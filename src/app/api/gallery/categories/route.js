import { NextResponse } from "next/server";
import pool from "@/components/lib/db";

// ================= GET ALL =================
export async function GET() {
    const connection = await pool.getConnection();

    try {
        const [rows] = await connection.query(`
            SELECT
                gc.*,
                u.username AS created_by_name
            FROM cst_gallery_categories gc
            LEFT JOIN cst_users u
                ON gc.created_by = u.id
            ORDER BY gc.sort_order ASC, gc.id DESC
        `);

        return NextResponse.json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error(error);

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

        const body = await request.json();

        const {
            category_name,
            slug,
            description,
            featured_image,
            sort_order,
            status,
            created_by
        } = body;

        if (!category_name) {
            return NextResponse.json({
                success: false,
                message: "Category name is required."
            }, { status: 400 });
        }

        const [exists] = await connection.query(
            "SELECT id FROM cst_gallery_categories WHERE category_name=?",
            [category_name]
        );

        if (exists.length) {
            return NextResponse.json({
                success: false,
                message: "Category already exists."
            }, { status: 409 });
        }

        const [result] = await connection.query(
            `INSERT INTO cst_gallery_categories
            (
                category_name,
                slug,
                description,
                featured_image,
                sort_order,
                status,
                created_by
            )
            VALUES (?,?,?,?,?,?,?)`,
            [
                category_name,
                slug,
                description,
                featured_image,
                sort_order || 0,
                status ?? 1,
                created_by || null
            ]
        );

        return NextResponse.json({
            success: true,
            message: "Category created successfully.",
            id: result.insertId
        });

    } catch (error) {

        console.error(error);

        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });

    } finally {
        connection.release();
    }
}