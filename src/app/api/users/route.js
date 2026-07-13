import { NextResponse } from "next/server";
import pool from "@/components/lib/db";

// GET ALL USERS
// ==========================
export async function GET() {
    try {
        const [rows] = await pool.query(`
      SELECT
        u.id,
        u.role_id,
        r.role_name,
        u.branch_id,
        b.branch_name,
        u.first_name,
        u.last_name,
        u.username,
        u.email,
        u.mobile,
        u.profile_image,
        u.gender,
        u.date_of_birth,
        u.address,
        u.city,
        u.state,
        u.pincode,
        u.last_login,
        u.email_verified_at,
        u.status,
        u.created_at,
        u.updated_at
      FROM cst_users u
      LEFT JOIN cst_role r
      ON u.role_id=r.id
      LEFT JOIN cst_branch b
      ON u.branch_id = b.id
      WHERE u.is_deleted=0
      ORDER BY u.id DESC
    `);

        return NextResponse.json({
            success: true,
            data: rows,
        });

    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: error.message,
            },
            { status: 500 }
        );
    }
}