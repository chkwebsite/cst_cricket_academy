import { NextResponse } from "next/server";
import pool from "@/components/lib/db";

// ================= GET ALL =================
export async function GET() {
    const connection = await pool.getConnection();

    try {
        const [rows] = await connection.query(`
            SELECT *
            FROM cst_umpire
            ORDER BY id DESC
        `);

        return NextResponse.json({
            success: true,
            data: rows,
        });

    } catch (error) {
        console.error(error);

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

// ================= ADD =================
export async function POST(request) {
    const connection = await pool.getConnection();

    try {
        const {
            name,
            email,
            phone,
            experience,
            about,
            status,
        } = await request.json();

        if (!name || !email || !phone) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Name, Email and Phone are required.",
                },
                { status: 400 }
            );
        }

        const [exists] = await connection.query(
            `SELECT id FROM cst_umpire WHERE email=?`,
            [email]
        );

        if (exists.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Email already exists.",
                },
                { status: 409 }
            );
        }

        const [result] = await connection.query(
            `
            INSERT INTO cst_umpire
            (
                name,
                email,
                phone,
                experience,
                about,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                name,
                email,
                phone,
                experience || null,
                about || null,
                status ?? 1,
            ]
        );

        return NextResponse.json({
            success: true,
            message: "Umpire added successfully.",
            id: result.insertId,
        });

    } catch (error) {
        console.error(error);

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