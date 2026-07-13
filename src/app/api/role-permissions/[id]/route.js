import { NextResponse } from "next/server";
import pool from "@/components/lib/db";

// GET ROLE PERMISSIONS
// =======================
export async function GET(request, { params }) {

    const { id } = await params;

    try {

        const [rows] = await pool.query(
            `
      SELECT
      rp.id,
      rp.permission_id,
      p.permission_name,
      p.module_name
      FROM cst_role_permission rp
      INNER JOIN cst_permission p
      ON rp.permission_id=p.id
      WHERE rp.role_id=?
      `,
            [id]
        );

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

// =======================
// UPDATE ROLE PERMISSIONS
// =======================
export async function PUT(request, { params }) {

    const { id } = await params;

    const connection = await pool.getConnection();

    try {

        const body = await request.json();

        const { permission_ids } = body;

        if (!Array.isArray(permission_ids)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "permission_ids must be an array.",
                },
                { status: 400 }
            );
        }

        await connection.beginTransaction();

        await connection.query(
            "DELETE FROM cst_role_permission WHERE role_id=?",
            [id]
        );

        for (const permissionId of permission_ids) {
            await connection.query(
                `
        INSERT INTO cst_role_permission
        (role_id, permission_id)
        VALUES (?, ?)
        `,
                [id, permissionId]
            );
        }

        await connection.commit();

        return NextResponse.json({
            success: true,
            message: "Role permissions updated successfully.",
        });

    } catch (error) {

        await connection.rollback();

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

// =======================
// DELETE SINGLE PERMISSION
// =======================
export async function DELETE(request, { params }) {

    const { id } = await params;

    try {

        const [result] = await pool.query(
            "DELETE FROM cst_role_permission WHERE id=?",
            [id]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Record not found.",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Permission removed successfully.",
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