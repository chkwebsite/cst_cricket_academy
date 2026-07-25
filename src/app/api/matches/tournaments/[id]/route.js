import { NextResponse } from "next/server";
import pool from "@/components/lib/db";

// GET SINGLE
export async function GET(request, { params }) {
    const connection = await pool.getConnection();

    try {
        const { id } = await params;

        const [rows] = await connection.query(
            `SELECT * FROM cst_tournaments WHERE id=?`,
            [id]
        );

        if (rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Tournament not found.",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: rows[0],
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

// UPDATE
export async function PUT(request, { params }) {
    const connection = await pool.getConnection();

    try {
        const { id } = await params;

        const {
            tournament_name,
            season,
            start_date,
            end_date,
            status,
        } = await request.json();

        if (!tournament_name) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Tournament name is required.",
                },
                { status: 400 }
            );
        }

        const [exists] = await connection.query(
            `SELECT id
             FROM cst_tournaments
             WHERE tournament_name=? AND season=? AND id<>?`,
            [tournament_name, season, id]
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

        await connection.query(
            `UPDATE cst_tournaments
             SET
                tournament_name=?,
                season=?,
                start_date=?,
                end_date=?,
                status=?
             WHERE id=?`,
            [
                tournament_name,
                season || null,
                start_date || null,
                end_date || null,
                status,
                id,
            ]
        );

        return NextResponse.json({
            success: true,
            message: "Tournament updated successfully.",
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

// DELETE
export async function DELETE(request, { params }) {
    const connection = await pool.getConnection();

    try {
        const { id } = await params;

        const [result] = await connection.query(
            `DELETE FROM cst_tournaments WHERE id=?`,
            [id]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Tournament not found.",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Tournament deleted successfully.",
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