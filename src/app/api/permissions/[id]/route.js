import { NextResponse } from "next/server";
import pool from "@/components/lib/db";

// GET SINGLE
// ======================
export async function GET(request, { params }) {

    const { id } = await params;

    try {

        const [rows] = await pool.query(
            "SELECT * FROM cst_permission WHERE id=?",
            [id]
        );

        if (rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Permission not found.",
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

// ======================
// UPDATE
// ======================
export async function PUT(request, { params }) {

    const { id } = await params;

    try {

        const body = await request.json();

        const {
            permission_name,
            module_name,
            description,
            status,
        } = body;

        const [exist] = await pool.query(
            "SELECT id FROM cst_permission WHERE id=?",
            [id]
        );

        if (exist.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Permission not found.",
                },
                { status: 404 }
            );
        }

        await pool.query(
            `UPDATE cst_permission
      SET
      permission_name=?,
      module_name=?,
      description=?,
      status=?
      WHERE id=?`,
            [
                permission_name,
                module_name,
                description,
                status,
                id,
            ]
        );

        return NextResponse.json({
            success: true,
            message: "Permission updated successfully.",
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

// ======================
// DELETE
// ======================
export async function DELETE(request, { params }) {

    const { id } = await params;

    try {

        const [exist] = await pool.query(
            "SELECT id FROM cst_permission WHERE id=?",
            [id]
        );

        if (exist.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Permission not found.",
                },
                { status: 404 }
            );
        }

        await pool.query(
            "DELETE FROM cst_permission WHERE id=?",
            [id]
        );

        return NextResponse.json({
            success: true,
            message: "Permission deleted successfully.",
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