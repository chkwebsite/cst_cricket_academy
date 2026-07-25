import { NextResponse } from "next/server";
import pool from "@/components/lib/db";

// GET ALL
export async function GET() {
    const connection = await pool.getConnection();

    try {
        const [rows] = await connection.query(`
            SELECT *
            FROM cst_match_types
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

// ADD
export async function POST(request) {
    const connection = await pool.getConnection();

    try {
        const { match_type, status } = await request.json();

        if (!match_type) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Match type is required.",
                },
                { status: 400 }
            );
        }

        const [exists] = await connection.query(
            "SELECT id FROM cst_match_types WHERE match_type=?",
            [match_type]
        );

        if (exists.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Match type already exists.",
                },
                { status: 409 }
            );
        }

        const [result] = await connection.query(
            `
            INSERT INTO cst_match_types
            (match_type,status)
            VALUES (?,?)
            `,
            [match_type, status ?? 1]
        );

        return NextResponse.json({
            success: true,
            message: "Match type added successfully.",
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