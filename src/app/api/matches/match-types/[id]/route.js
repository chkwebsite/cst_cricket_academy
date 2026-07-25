import { NextResponse } from "next/server";
import pool from "@/components/lib/db";

// GET SINGLE
export async function GET(request, { params }) {
    const connection = await pool.getConnection();

    try {
        const { id } = await params;

        const [rows] = await connection.query(
            "SELECT * FROM cst_match_types WHERE id=?",
            [id]
        );

        if (rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Record not found.",
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
            `
            SELECT id
            FROM cst_match_types
            WHERE match_type=? AND id<>?
            `,
            [match_type, id]
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

        await connection.query(
            `
            UPDATE cst_match_types
            SET
                match_type=?,
                status=?
            WHERE id=?
            `,
            [match_type, status, id]
        );

        return NextResponse.json({
            success: true,
            message: "Match type updated successfully.",
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
            "DELETE FROM cst_match_types WHERE id=?",
            [id]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Record not found.",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Match type deleted successfully.",
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