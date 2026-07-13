import { NextResponse } from "next/server";
import pool from "@/components/lib/db";

// GET SINGLE MENU
// =======================
export async function GET(request, { params }) {

    const { id } = await params;

    try {

        const [rows] = await pool.query(
            `
      SELECT *
      FROM cst_menu
      WHERE id=?
      `,
            [id]
        );

        if (rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Menu not found.",
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

// =======================
// UPDATE MENU
// =======================
export async function PUT(request, { params }) {

    const { id } = await params;

    try {

        const body = await request.json();

        const {
            parent_id,
            menu_name,
            menu_icon,
            menu_url,
            sort_order,
            permission_name,
            status,
        } = body;

        await pool.query(
            `
      UPDATE cst_menu
      SET
      parent_id=?,
      menu_name=?,
      menu_icon=?,
      menu_url=?,
      sort_order=?,
      permission_name=?,
      status=?
      WHERE id=?
      `,
            [
                parent_id || null,
                menu_name,
                menu_icon,
                menu_url,
                sort_order,
                permission_name,
                status,
                id,
            ]
        );

        return NextResponse.json({
            success: true,
            message: "Menu updated successfully.",
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
// DELETE MENU
// =======================
export async function DELETE(request, { params }) {

    const { id } = await params;

    try {

        // Check if this menu has child menus
        const [children] = await pool.query(
            "SELECT id FROM cst_menu WHERE parent_id=?",
            [id]
        );

        if (children.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Cannot delete. This menu has child menus.",
                },
                { status: 400 }
            );
        }

        const [result] = await pool.query(
            "DELETE FROM cst_menu WHERE id=?",
            [id]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Menu not found.",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Menu deleted successfully.",
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