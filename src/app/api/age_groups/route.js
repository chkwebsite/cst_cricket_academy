import { NextResponse } from "next/server";
import pool from "@/components/lib/db";


// GET All Age Group Data

export async function GET() {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query(`SELECT * FROM cst_age_groups
WHERE is_deleted = 0
ORDER BY id DESC;`);
        if (rows) {
            return NextResponse.json({
                success: true,
                data: rows
            }, { status: 200 })
        }
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 })
    } finally {
        if (connection) connection.release();
    }
}

// POST Age Group Data

export async function POST(req) {
    const connection = await pool.getConnection();
    try {
        const body = await req.json();
        const { age_group, min_age, max_age, status } = body;

        if (!min_age || !max_age) {
            return NextResponse.json({
                success: false,
                message: "Min age and Max age are required..."
            })
        }

        const [exist] = await connection.query(`SELECT id FROM cst_age_groups WHERE min_age = ? AND max_age = ?`,
            [min_age, max_age]
        )
        if (exist.length > 0) {
            return NextResponse.json({
                success: false,
                message: "Age Group All ready exist..."
            })
        }
        const [result] = await connection.query(
            `INSERT INTO cst_age_groups (age_group, min_age, max_age, status)
     VALUES (?, ?, ?, ?)`,
            [age_group || "", min_age, max_age, status || 1]
        );
        return NextResponse.json({
            success: true,
            message: "Age Group added successfully.",
            id: result.insertId
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: error.message
            },
            {
                status: 500
            }
        );
    } finally {
        connection.release();
    }
}