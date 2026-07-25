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

// =================== GET ALL ===================
export async function GET(request) {
    const connection = await pool.getConnection();

    try {
        const { searchParams } = new URL(request.url);
        const includeInactive = searchParams.get("include_inactive") === "1";
        const filters = ["e.is_deleted=0"];
        const params = [];

        if (!includeInactive) {
            filters.push("e.status = ?");
            params.push("Active");
        }

        const search = searchParams.get("search");
        if (search) {
            filters.push(`(
                e.enrollment_no LIKE ?
                OR e.admission_no LIKE ?
                OR CONCAT(u.first_name,' ',u.last_name) LIKE ?
                OR cp.title LIKE ?
                OR b.branch_name LIKE ?
            )`);
            const likeSearch = `%${search}%`;
            params.push(likeSearch, likeSearch, likeSearch, likeSearch, likeSearch);
        }

        const branchId = searchParams.get("branch_id");
        if (branchId) {
            filters.push("e.branch_id = ?");
            params.push(branchId);
        }

        const programId = searchParams.get("program_id");
        if (programId) {
            filters.push("e.program_id = ?");
            params.push(programId);
        }

        const [rows] = await connection.query(`
            ${enrollmentSelect}
            WHERE ${filters.join(" AND ")}
            ORDER BY e.id DESC;
        `, params);

        return NextResponse.json({
            success: true,
            data: rows,
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

// =================== ADD ===================
export async function POST(request) {

    const connection = await pool.getConnection();

    try {

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
            created_by
        } = body;
        // Validations
        if (!user_id || !enrollment_no || !admission_no || !program_id) {
            return NextResponse.json({
                success: false,
                message: "Student, enrollment no, admission no and program are required."
            }, { status: 400 })
        }
        // Duplicates
        const [exist] = await connection.query(`SELECT id FROM cst_enroll_player_programs 
            WHERE user_id = ? AND program_id = ? AND age_group_id <=> ? AND is_deleted = 0`, [user_id, program_id, age_group_id]);
        if (exist.length > 0) {
            return NextResponse.json({
                success: false,
                message: "Enrollment already exists."
            }, { status: 409 })
        }
        const [result] = await connection.query(`
            INSERT INTO cst_enroll_player_programs
            (
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
                created_by
            )
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
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
            created_by
        ]);


        return NextResponse.json({
            success: true,
            message: "Enrollment Added Successfully",
            id: result.insertId
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
