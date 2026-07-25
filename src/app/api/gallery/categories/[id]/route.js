import { NextResponse } from "next/server";
import pool from "@/components/lib/db";

// ================= GET SINGLE =================
export async function GET(request, { params }) {

    const connection = await pool.getConnection();

    try {

        const { id } = await params;

        const [rows] = await connection.query(
            `SELECT *
             FROM cst_gallery_categories
             WHERE id=?`,
            [id]
        );

        if (!rows.length) {
            return NextResponse.json({
                success: false,
                message: "Category not found."
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

// ================= UPDATE =================
export async function PUT(request, { params }) {

    const connection = await pool.getConnection();

    try {

        const { id } = await params;

        const body = await request.json();

        const {
            category_name,
            slug,
            description,
            featured_image,
            sort_order,
            status
        } = body;

        const [exists] = await connection.query(
            "SELECT id FROM cst_gallery_categories WHERE id=?",
            [id]
        );

        if (!exists.length) {
            return NextResponse.json({
                success: false,
                message: "Category not found."
            }, { status: 404 });
        }

        await connection.query(
            `UPDATE cst_gallery_categories
            SET
                category_name=?,
                slug=?,
                description=?,
                featured_image=?,
                sort_order=?,
                status=?
            WHERE id=?`,
            [
                category_name,
                slug,
                description,
                featured_image,
                sort_order,
                status,
                id
            ]
        );

        return NextResponse.json({
            success: true,
            message: "Category updated successfully."
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

// ================= DELETE =================
export async function DELETE(request, { params }) {

    const connection = await pool.getConnection();

    try {

        const { id } = await params;

        const [exists] = await connection.query(
            "SELECT id FROM cst_gallery_categories WHERE id=?",
            [id]
        );

        if (!exists.length) {
            return NextResponse.json({
                success: false,
                message: "Category not found."
            }, { status: 404 });
        }

        await connection.query(
            "DELETE FROM cst_gallery_categories WHERE id=?",
            [id]
        );

        return NextResponse.json({
            success: true,
            message: "Category deleted successfully."
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

