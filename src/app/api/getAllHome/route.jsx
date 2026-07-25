import pool from "@/components/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    const connection = await pool.getConnection();

    try {
        const [
            [coFounder],
            [coachingProgram],
            [regularCoaches],
            [visitingCoaches],
            [experts],
            [branches],
            [testimonials],
        ] = await Promise.all([

            connection.query(`
                SELECT *
                FROM cst_co_founders
                WHERE is_deleted = 0
                ORDER BY display_order ASC, id DESC
            `),

            connection.query(`
                SELECT cp.*, u.first_name, u.last_name,
                       b.branch_name,
                       p.designation AS coach_designation
                FROM cst_coaching_program cp
                LEFT JOIN cst_users u
                    ON u.id = cp.user_id
                LEFT JOIN cst_branch b
                    ON b.id = cp.branch_id
                LEFT JOIN cst_profile p
                    ON p.id = cp.coach_id
                WHERE cp.is_deleted = 0
                ORDER BY cp.id DESC
            `),

            connection.query(`
                SELECT cp.*, u.first_name, u.last_name,
                       u.email, u.mobile, u.profile_image,
                       b.branch_name
                FROM cst_profile cp
                LEFT JOIN cst_users u
                    ON u.id = cp.user_id
                LEFT JOIN cst_branch b
                    ON b.id = cp.branch_id
                WHERE cp.is_deleted = 0
                  AND cp.visiting_coaches = 0
                ORDER BY cp.id DESC
            `),

            connection.query(`
                SELECT cp.*, u.first_name, u.last_name,
                       u.email, u.mobile, u.profile_image,
                       b.branch_name
                FROM cst_profile cp
                LEFT JOIN cst_users u
                    ON u.id = cp.user_id
                LEFT JOIN cst_branch b
                    ON b.id = cp.branch_id
                WHERE cp.is_deleted = 0
                  AND cp.visiting_coaches = 1
                ORDER BY cp.id DESC
            `),

            connection.query(`
                SELECT *
                FROM cst_experts
                WHERE is_deleted = 0
                ORDER BY id DESC
            `),

            connection.query(`
                SELECT *
                FROM cst_branch
                WHERE is_deleted = 0
                ORDER BY id ASC
            `),
            connection.query(`
                SELECT t.*, u.first_name, u.last_name, u.email AS user_email, u.mobile, u.profile_image AS user_profile_image, b.branch_name, b.branch_code,b.address AS branch_address
                FROM cst_testimonials t
                LEFT JOIN cst_users u
                    ON u.id = t.user_id
                    AND u.is_deleted = 0
                LEFT JOIN cst_branch b
                    ON b.id = t.branch_id
                    AND b.is_deleted = 0
                WHERE t.is_deleted = 0
                ORDER BY t.display_order ASC, t.id DESC
                `)
        ]);

        return NextResponse.json({
            success: true,
            data: {
                coFounder,
                coachingProgram,
                regularCoaches,
                visitingCoaches,
                experts,
                branches,
                testimonials
            },
        });

    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: error.message,
            },
            { status: 500 }
        );
    } finally {
        connection.release();
    }
}