import pool from "@/components/lib/db";
import { NextResponse } from "next/server";

const enrollmentSelect = `
    SELECT
        e.*,
        e.id AS enrollment_id,
        CONCAT(u.first_name,' ',u.last_name) AS student_name,
        CONCAT(u.first_name,' ',u.last_name) AS player_name,
        b.branch_name,
        cp.title AS program_name,
        ag.age_group,
        CONCAT(p.first_name,' ',p.last_name) AS coach_name,
        NULL AS batch_name,
        COALESCE(e.final_fee, e.fees, 0) AS total_fee,
        CONCAT(COALESCE(NULLIF(e.enrollment_no, ''), CONCAT('ENR', LPAD(e.id, 6, '0'))), ' - ', CONCAT(u.first_name,' ',u.last_name)) AS label
    FROM cst_enroll_player_programs e
    LEFT JOIN cst_users u
        ON u.id=e.user_id
    LEFT JOIN cst_branch b
        ON b.id=e.branch_id
    LEFT JOIN cst_coaching_program cp
        ON cp.id=e.program_id
    LEFT JOIN cst_age_groups ag
        ON ag.id=e.age_group_id
    LEFT JOIN cst_users p
        ON p.id=e.coach_id
`;

// ================= SINGLE ===================
export async function GET(request, { params }) {

    const connection = await pool.getConnection();

    try {

        const { id } = await params;

        const [rows] = await connection.query(`
            ${enrollmentSelect}
            WHERE e.id=?
            AND e.is_deleted=0
        `, [id]);

        if (rows.length === 0) {

            return NextResponse.json({
                success: false,
                message: "Record not found"
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

// ================= UPDATE ===================
export async function PUT(request, { params }) {

    const connection = await pool.getConnection();

    try {

        const { id } = await params;

        const body = await request.json();

        const {
            user_id,
            enrollment_no,
            admission_no,
            branch_id,
            program_id,
            age_group_id,
            coach_id,
            fee_structure,
            fees,
            registration_fee,
            admission_fee,
            kit_fee,
            security_deposit,
            discount_amount,
            final_fee,
            admission_date,
            start_date,
            end_date,
            next_due_date,
            status,
            remarks,
            updated_by
        } = body;

        if (!user_id || !enrollment_no || !admission_no || !program_id) {
            return NextResponse.json({
                success: false,
                message: "Student, enrollment no, admission no and program are required."
            }, { status: 400 });
        }

        const [exist] = await connection.query(`
            SELECT id
            FROM cst_enroll_player_programs
            WHERE user_id = ?
            AND program_id = ?
            AND age_group_id <=> ?
            AND is_deleted = 0
            AND id <> ?
        `, [user_id, program_id, age_group_id, id]);

        if (exist.length > 0) {
            return NextResponse.json({
                success: false,
                message: "Enrollment already exists."
            }, { status: 409 });
        }

        await connection.query(`
            UPDATE cst_enroll_player_programs
            SET
                user_id=?,
                enrollment_no=?,
                admission_no=?,
                branch_id=?,
                program_id=?,
                age_group_id=?,
                coach_id=?,
                fee_structure=?,
                fees=?,
                registration_fee=?,
                admission_fee=?,
                kit_fee=?,
                security_deposit=?,
                discount_amount=?,
                final_fee=?,
                admission_date=?,
                start_date=?,
                end_date=?,
                next_due_date=?,
                status=?,
                remarks=?,
                updated_by=?
            WHERE id=?
            AND is_deleted=0
        `, [
            user_id,
            enrollment_no,
            admission_no,
            branch_id,
            program_id,
            age_group_id,
            coach_id,
            fee_structure,
            fees,
            registration_fee,
            admission_fee,
            kit_fee,
            security_deposit,
            discount_amount,
            final_fee,
            admission_date,
            start_date,
            end_date,
            next_due_date,
            status,
            remarks,
            updated_by,
            id
        ]);

        return NextResponse.json({
            success: true,
            message: "Enrollment Updated Successfully"
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



// ================= DELETE (Soft Delete) ===================
export async function DELETE(request, { params }) {

    const connection = await pool.getConnection();

    try {

        const { id } = await params;

        await connection.query(`
            UPDATE cst_enroll_player_programs
            SET is_deleted=1
            WHERE id=?
        `, [id]);

        return NextResponse.json({
            success: true,
            message: "Enrollment Deleted Successfully"
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
