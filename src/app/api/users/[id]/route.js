import { NextResponse } from "next/server";
import pool from "@/components/lib/db";

// GET SINGLE USER
// ==========================
export async function GET(request, { params }) {

    const { id } = await params;

    try {

        const [rows] = await pool.query(
            `
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
      WHERE u.id=? AND u.is_deleted=0
      `,
            [id]
        );

        if (rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found.",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: rows[0],
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

// ==========================
// UPDATE USER
// ==========================
export async function PUT(request, { params }) {

    const { id } = await params;

    try {

        const body = await request.json();

        const {
            role_id,
            branch_id,
            first_name,
            last_name,
            username,
            email,
            mobile,
            profile_image,
            gender,
            date_of_birth,
            address,
            city,
            state,
            pincode,
            status,
        } = body;

        const [exist] = await pool.query(
            "SELECT id FROM cst_users WHERE id=? AND is_deleted=0",
            [id]
        );

        if (exist.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found.",
                },
                { status: 404 }
            );
        }

        await pool.query(
            `
      UPDATE cst_users
      SET
      role_id=?,
      branch_id=?
      first_name=?,
      last_name=?,
      username=?,
      email=?,
      mobile=?,
      profile_image=?,
      gender=?,
      date_of_birth=?,
      address=?,
      city=?,
      state=?,
      pincode=?,
      status=?
      WHERE id=?
      `,
            [
                role_id,
                branch_id,
                first_name,
                last_name,
                username,
                email,
                mobile,
                profile_image,
                gender,
                date_of_birth,
                address,
                city,
                state,
                pincode,
                status,
                id,
            ]
        );

        return NextResponse.json({
            success: true,
            message: "User updated successfully.",
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

// ==========================
// SOFT DELETE USER
// ==========================
export async function DELETE(request, { params }) {

    const { id } = await params;

    try {

        const [result] = await pool.query(
            `
      UPDATE cst_users
      SET is_deleted=1
      WHERE id=?
      `,
            [id]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found.",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "User deleted successfully.",
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