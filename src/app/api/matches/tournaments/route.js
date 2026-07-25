import { NextResponse } from "next/server";
import pool from "@/components/lib/db";

// GET ALL
export async function GET() {
    const connection = await pool.getConnection();

    try {
        const [rows] = await connection.query(`
            SELECT *
            FROM cst_tournaments
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
        const {
            tournament_name,
            season,
            start_date,
            end_date,
            status,
        } = await request.json();

        if (!tournament_name || !start_date) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Tournament name and Start date is required.",
                },
                { status: 400 }
            );
        }

        const [exists] = await connection.query(
            `SELECT id FROM cst_tournaments WHERE tournament_name=? AND start_date=?`,
            [tournament_name, start_date]
        );

        if (exists.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Tournament already exists.",
                },
                { status: 409 }
            );
        }

        const [result] = await connection.query(
            `INSERT INTO cst_tournaments
            (tournament_name, season, start_date, end_date, status)
            VALUES (?, ?, ?, ?, ?)`,
            [
                tournament_name,
                season || null,
                start_date || null,
                end_date || null,
                status ?? 1,
            ]
        );

        return NextResponse.json({
            success: true,
            message: "Tournament added successfully.",
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
