import { NextResponse } from "next/server";
import pool from "@/components/lib/db";

// ================= GET =================

export async function GET() {
    try {

        const [roles] = await pool.query(`
            SELECT *
            FROM cst_role
            WHERE is_deleted=0
            ORDER BY id DESC
        `);

        return NextResponse.json({
            success: true,
            data: roles,
        });

    } catch (error) {

        return NextResponse.json({
            success: false,
            message: error.message,
        }, { status: 500 });

    }
}

// ================= POST =================

export async function POST(request) {

    try {

        const body = await request.json();

        const { role_name, description, status } = body;

        if (!role_name) {
            return NextResponse.json({
                success: false,
                message: "Role Name is required."
            }, { status: 400 });
        }

        const [exist] = await pool.query(
            "SELECT id FROM cst_role WHERE role_name=? AND is_deleted=0",
            [role_name]
        );

        if (exist.length > 0) {

            return NextResponse.json({
                success: false,
                message: "Role already exists."
            }, { status: 409 });

        }

        const [result] = await pool.query(
            `INSERT INTO cst_role
            (role_name,description,status)
            VALUES(?,?,?)`,
            [
                role_name,
                description || "",
                status ?? 1
            ]
        );

        return NextResponse.json({
            success: true,
            message: "Role Added Successfully",
            id: result.insertId
        });

    } catch (error) {

        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });

    }

}