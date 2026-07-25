import { NextResponse } from "next/server";
import pool from "@/components/lib/db";

// ================= GET SINGLE =================
export async function GET(request, { params }) {

    const connection = await pool.getConnection();

    try {

        const { id } = await params;

        const [rows] = await connection.query(
            `SELECT * FROM cst_umpire WHERE id=?`,
            [id]
        );

        if (rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Umpire not found.",
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

// ================= UPDATE =================
export async function PUT(request, { params }) {

    const connection = await pool.getConnection();

    try {

        const { id } = await params;

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
            `
            SELECT id
            FROM cst_umpire
            WHERE email=? AND id<>?
            `,
            [email, id]
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

        await connection.query(
            `
            UPDATE cst_umpire
            SET
                name=?,
                email=?,
                phone=?,
                experience=?,
                about=?,
                status=?
            WHERE id=?
            `,
            [
                name,
                email,
                phone,
                experience || null,
                about || null,
                status,
                id,
            ]
        );

        return NextResponse.json({
            success: true,
            message: "Umpire updated successfully.",
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

// ================= DELETE =================
export async function DELETE(request, { params }) {

    const connection = await pool.getConnection();

    try {

        const { id } = await params;

        const [result] = await connection.query(
            `DELETE FROM cst_umpire WHERE id=?`,
            [id]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Umpire not found.",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Umpire deleted successfully.",
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

