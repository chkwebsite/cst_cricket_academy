import pool from "@/components/lib/db";
import { NextResponse } from "next/server";

const normalizePaymentStatus = (status) => {
    if (status === "Success") return "Paid";
    return ["Paid", "Failed", "Refunded"].includes(status) ? status : "Paid";
};

async function recalculateAcademyFee(connection, academyFeeId) {
    const [[fee]] = await connection.query(`
        SELECT total_amount
        FROM cst_academy_fees
        WHERE id=?
    `, [academyFeeId]);

    if (!fee) {
        throw new Error("Fee invoice not found");
    }

    const [[paymentTotal]] = await connection.query(`
        SELECT COALESCE(SUM(paid_amount), 0) AS paid_amount
        FROM cst_fee_payments
        WHERE academy_fee_id=?
        AND payment_status='Paid'
    `, [academyFeeId]);

    const total = Number(fee.total_amount) || 0;
    const paid = Number(paymentTotal.paid_amount) || 0;
    const balance = Number((total - paid).toFixed(2));
    const paymentStatus = paid <= 0 ? "Pending" : balance <= 0 ? "Paid" : "Partial";

    await connection.query(`
        UPDATE cst_academy_fees
        SET
            paid_amount=?,
            balance_amount=?,
            payment_status=?
        WHERE id=?
    `, [
        paid,
        balance <= 0 ? 0 : balance,
        paymentStatus,
        academyFeeId
    ]);
}

// ================= GET ALL =================
export async function GET(request) {
    const connection = await pool.getConnection();

    try {
        const { searchParams } = new URL(request.url);
        const filters = [];
        const params = [];

        const studentId = searchParams.get("student_id");
        if (studentId) {
            filters.push("u.id = ?");
            params.push(studentId);
        }

        const invoiceId = searchParams.get("invoice_id");
        if (invoiceId) {
            filters.push("af.id = ?");
            params.push(invoiceId);
        }

        const feeMonth = searchParams.get("fee_month");
        if (feeMonth) {
            filters.push("DATE_FORMAT(COALESCE(af.fee_period_start, af.due_date), '%Y-%m') = ?");
            params.push(feeMonth);
        }

        const [rows] = await connection.query(`
            SELECT
                fp.*,
                af.id AS invoice_id,
                af.invoice_no,
                af.total_amount,
                af.payment_status AS fee_status,
                DATE_FORMAT(COALESCE(af.fee_period_start, af.due_date), '%Y-%m') AS fee_month,
                DATE_FORMAT(COALESCE(af.fee_period_start, af.due_date), '%M %Y') AS fee_month_label,
                u.id AS student_id,
                ep.enrollment_no,
                ep.admission_no,
                CONCAT(u.first_name,' ',u.last_name) AS student_name
            FROM cst_fee_payments fp
            LEFT JOIN cst_academy_fees af
                ON af.id = fp.academy_fee_id
            LEFT JOIN cst_enroll_player_programs ep
                ON ep.id = af.enrollment_id
            LEFT JOIN cst_users u
                ON u.id = ep.user_id
            ${filters.length ? `WHERE ${filters.join(" AND ")}` : ""}
            ORDER BY fp.payment_date DESC, fp.id DESC
        `, params);

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

        const body = await request.json();

        const {
            academy_fee_id,
            receipt_no,
            payment_date,
            paid_amount,
            payment_mode,
            transaction_id,
            bank_name,
            cheque_no,
            cheque_date,
            payment_status,
            remarks,
            created_by
        } = body;

        const normalizedPaymentStatus = normalizePaymentStatus(payment_status);

        // Insert Payment
        const [result] = await connection.query(`
            INSERT INTO cst_fee_payments (
                academy_fee_id,
                receipt_no,
                payment_date,
                paid_amount,
                payment_mode,
                transaction_id,
                bank_name,
                cheque_no,
                cheque_date,
                payment_status,
                remarks,
                created_by
            )
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
        `, [
            academy_fee_id,
            receipt_no,
            payment_date,
            paid_amount,
            payment_mode,
            transaction_id,
            bank_name,
            cheque_no,
            cheque_date,
            normalizedPaymentStatus,
            remarks,
            created_by
        ]);

        await recalculateAcademyFee(connection, academy_fee_id);

        await connection.commit();

        return NextResponse.json({
            success: true,
            message: "Payment Added Successfully",
            id: result.insertId
        });

    } catch (error) {

        await connection.rollback();

        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });

    } finally {
        connection.release();
    }

}
