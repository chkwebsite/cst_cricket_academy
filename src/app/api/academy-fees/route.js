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

function buildInvoiceNo(lastInvoiceNo) {
    const match = String(lastInvoiceNo || "").match(/^INV(\d+)$/);
    const nextNumber = match ? Number(match[1]) + 1 : 1;
    return `INV${String(nextNumber).padStart(6, "0")}`;
}

async function getNextInvoiceNo(connection) {
    const [rows] = await connection.query(`
        SELECT invoice_no
        FROM cst_academy_fees
        WHERE invoice_no REGEXP '^INV[0-9]+$'
        ORDER BY CAST(SUBSTRING(invoice_no, 4) AS UNSIGNED) DESC
        LIMIT 1
    `);

    return buildInvoiceNo(rows[0]?.invoice_no);
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

// ================= GET ALL =================
export async function GET(request) {
    const connection = await pool.getConnection();

    try {
        const { searchParams } = new URL(request.url);

        if (searchParams.get("next_invoice") === "1") {
            return NextResponse.json({
                success: true,
                invoice_no: await getNextInvoiceNo(connection)
            });
        }

        const [rows] = await connection.query(`
            ${feeSelect}
            WHERE af.is_deleted = 0
            ORDER BY COALESCE(af.fee_period_start, af.due_date) DESC, af.id DESC
        `);

        return NextResponse.json({
            success: true,
            data: rows
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

// ================= ADD =================
export async function POST(request) {

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [[lockRow]] = await connection.query(`SELECT GET_LOCK('cst_academy_fees_invoice_no', 10) AS locked`);
        if (!lockRow?.locked) {
            throw new Error("Unable to generate invoice number. Please try again.");
        }

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

        if (!enrollment_id || !fee_type || total_amount === null || total_amount === undefined || total_amount === "") {
            await connection.rollback();
            await connection.query(`SELECT RELEASE_LOCK('cst_academy_fees_invoice_no')`);
            return NextResponse.json({
                success: false,
                message: "Enrollment, fee type and total amount are required."
            }, { status: 400 });
        }

        const [enrollments] = await connection.query(`
            SELECT id
            FROM cst_enroll_player_programs
            WHERE id = ?
            AND is_deleted = 0
            AND status = 'Active'
        `, [enrollment_id]);

        if (enrollments.length === 0) {
            await connection.rollback();
            await connection.query(`SELECT RELEASE_LOCK('cst_academy_fees_invoice_no')`);
            return NextResponse.json({
                success: false,
                message: "Active enrollment not found."
            }, { status: 404 });
        }

        const requestedInvoiceNo = String(invoice_no || "").trim();
        const nextInvoiceNo = requestedInvoiceNo || await getNextInvoiceNo(connection);

        const [duplicateInvoice] = await connection.query(`
            SELECT id
            FROM cst_academy_fees
            WHERE invoice_no = ?
            AND is_deleted = 0
        `, [nextInvoiceNo]);

        if (duplicateInvoice.length > 0) {
            await connection.rollback();
            await connection.query(`SELECT RELEASE_LOCK('cst_academy_fees_invoice_no')`);
            return NextResponse.json({
                success: false,
                message: "Invoice number already exists."
            }, { status: 409 });
        }

        const normalizedPaidAmount = Number(paid_amount) || 0;
        const { paymentStatus, balance } = getPaymentStatus(total_amount, normalizedPaidAmount);

        const [result] = await connection.query(`
            INSERT INTO cst_academy_fees (
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
                payment_status,
                remarks,
                status
            )
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `, [
            enrollment_id,
            nextInvoiceNo,
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
            status
        ]);

        await connection.commit();
        await connection.query(`SELECT RELEASE_LOCK('cst_academy_fees_invoice_no')`);

        return NextResponse.json({
            success: true,
            message: "Fee Added Successfully",
            id: result.insertId,
            invoice_no: nextInvoiceNo
        });

    } catch (error) {
        await connection.rollback();
        await connection.query(`SELECT RELEASE_LOCK('cst_academy_fees_invoice_no')`);

        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });

    } finally {
        connection.release();
    }
}
