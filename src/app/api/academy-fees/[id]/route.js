import pool from "@/components/lib/db";
import { NextResponse } from "next/server";

function getPaymentStatus(totalAmount, paidAmount) {
    const total = Number(totalAmount) || 0;
    const paid = Number(paidAmount) || 0;
    const balance = Number((total - paid).toFixed(2));

    if (paid <= 0) return { paymentStatus: "Pending", balance };
    if (balance <= 0) return { paymentStatus: "Paid", balance: 0 };
    return { paymentStatus: "Partial", balance };
}

const feeSelect = `
    SELECT
        af.*,
        DATE_FORMAT(COALESCE(af.fee_period_start, af.due_date), '%Y-%m') AS fee_month,
        DATE_FORMAT(COALESCE(af.fee_period_start, af.due_date), '%M %Y') AS fee_month_label,
        ep.enrollment_no,
        ep.admission_no,
        ep.fee_structure,
        ep.admission_date,
        ep.start_date,
        ep.end_date,
        ep.next_due_date,
        CONCAT(u.first_name,' ',u.last_name) AS student_name,
        CONCAT(u.first_name,' ',u.last_name) AS player_name,
        cp.title AS program_name,
        b.branch_name,
        NULL AS batch_name
    FROM cst_academy_fees af
    LEFT JOIN cst_enroll_player_programs ep
        ON ep.id = af.enrollment_id
    LEFT JOIN cst_users u
        ON u.id = ep.user_id
    LEFT JOIN cst_coaching_program cp
        ON cp.id = ep.program_id
    LEFT JOIN cst_branch b
        ON b.id = ep.branch_id
`;

// ================= GET SINGLE =================
export async function GET(request, { params }) {

    const connection = await pool.getConnection();

    try {

        const { id } = await params;

        const [rows] = await connection.query(`
            ${feeSelect}
            WHERE af.id = ?
            AND af.is_deleted = 0
        `, [id]);

        if (rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: "Record Not Found"
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: rows[0]
        });

    } catch (error) {

        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });

    } finally {
        connection.release();
    }

}

// ================= UPDATE =================
export async function PUT(request, { params }) {

    const connection = await pool.getConnection();

    try {

        const { id } = await params;

        const body = await request.json();

        const {
            enrollment_id,
            invoice_no,
            fee_type,
            fee_period_start,
            fee_period_end,
            due_date,
            amount,
            discount,
            tax_percent,
            tax_amount,
            late_fee,
            total_amount,
            paid_amount,
            balance_amount,
            remarks,
            status
        } = body;

        const normalizedInvoiceNo = String(invoice_no || "").trim();

        if (!enrollment_id || !normalizedInvoiceNo || !fee_type || total_amount === null || total_amount === undefined || total_amount === "") {
            return NextResponse.json({
                success: false,
                message: "Enrollment, invoice no, fee type and total amount are required."
            }, { status: 400 });
        }

        const [enrollments] = await connection.query(`
            SELECT id
            FROM cst_enroll_player_programs
            WHERE id = ?
            AND is_deleted = 0
        `, [enrollment_id]);

        if (enrollments.length === 0) {
            return NextResponse.json({
                success: false,
                message: "Enrollment not found."
            }, { status: 404 });
        }

        const [duplicateInvoice] = await connection.query(`
            SELECT id
            FROM cst_academy_fees
            WHERE invoice_no = ?
            AND is_deleted = 0
            AND id <> ?
        `, [normalizedInvoiceNo, id]);

        if (duplicateInvoice.length > 0) {
            return NextResponse.json({
                success: false,
                message: "Invoice number already exists."
            }, { status: 409 });
        }

        const normalizedPaidAmount = Number(paid_amount) || 0;
        const { paymentStatus, balance } = getPaymentStatus(total_amount, normalizedPaidAmount);

        await connection.query(`
            UPDATE cst_academy_fees
            SET
                enrollment_id=?,
                invoice_no=?,
                fee_type=?,
                fee_period_start=?,
                fee_period_end=?,
                due_date=?,
                amount=?,
                discount=?,
                tax_percent=?,
                tax_amount=?,
                late_fee=?,
                total_amount=?,
                paid_amount=?,
                balance_amount=?,
                payment_status=?,
                remarks=?,
                status=?
            WHERE id=?
        `, [
            enrollment_id,
            normalizedInvoiceNo,
            fee_type,
            fee_period_start,
            fee_period_end,
            due_date,
            amount,
            discount,
            tax_percent,
            tax_amount,
            late_fee,
            total_amount,
            normalizedPaidAmount,
            balance_amount ?? balance,
            paymentStatus,
            remarks,
            status,
            id
        ]);

        return NextResponse.json({
            success: true,
            message: "Fee Updated Successfully"
        });

    } catch (error) {

        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });

    } finally {
        connection.release();
    }

}

// ================= DELETE =================
export async function DELETE(request, { params }) {

    const connection = await pool.getConnection();

    try {

        const { id } = await params;

        await connection.query(`
            UPDATE cst_academy_fees
            SET is_deleted=1
            WHERE id=?
        `, [id]);

        return NextResponse.json({
            success: true,
            message: "Fee Deleted Successfully"
        });

    } catch (error) {

        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });

    } finally {
        connection.release();
    }

}

