import { NextResponse } from "next/server";
import pool from "@/components/lib/db";

// GET ALL PERMISSIONS
// =====================
export async function GET() {
    try {
        const [rows] = await pool.query(`
      SELECT *
      FROM cst_permission
      ORDER BY id DESC
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

// =====================
// ADD PERMISSION
// =====================
export async function POST(req) {
    try {
        const body = await req.json();

        const {
            permission_name,
            module_name,
            description,
            status,
        } = body;

        if (!permission_name || !module_name) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Permission Name and Module Name are required.",
                },
                { status: 400 }
            );
        }

        const [exist] = await pool.query(
            "SELECT id FROM cst_permission WHERE permission_name=?",
            [permission_name]
        );

        if (exist.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Permission already exists.",
                },
                { status: 409 }
            );
        }

        const [result] = await pool.query(
            `INSERT INTO cst_permission
      (permission_name,module_name,description,status)
      VALUES (?,?,?,?)`,
            [
                permission_name,
                module_name,
                description || "",
                status ?? 1,
            ]
        );

        return NextResponse.json({
            success: true,
            message: "Permission created successfully.",
            id: result.insertId,
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