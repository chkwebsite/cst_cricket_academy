import pool from "@/components/lib/db";
import { NextResponse } from "next/server";

//GET Single Records

export async function GET(request, { params }) {
    const connection = await pool.getConnection();

    try {
        const { id } = await params;

        const [rows] = await connection.query(
            `SELECT *
     FROM cst_age_groups
     WHERE id = ? AND is_deleted = 0
     LIMIT 1`,
            [id]
        );

        if (rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Age Group not found."
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: rows[0]
        });
    } finally {
        connection.release();
    }
}

//UPDATE Single Records

export async function PUT(req, { params }) {
    const connection = await pool.getConnection();
    try {
        const { id } = await params;
        const body = await req.json();
        const { age_group, min_age, max_age, status } = body;

        if (!min_age || !max_age) {
            return NextResponse.json({
                success: false,
                message: "Min age and Max age are required..."
            })
        }

        const [exist] = await connection.query(
            `SELECT id
     FROM cst_age_groups
     WHERE min_age = ?
       AND max_age = ?
       AND id != ?`,
            [min_age, max_age, id]
        );

        if (exist.length > 0) {
            return NextResponse.json({
                success: false,
                message: "Age Group already exists."
            });
        }

        const [result] = await connection.query(`UPDATE cst_age_groups SET age_group = ?, min_age = ?, max_age = ?, status = ? WHERE id = ?`,
            [age_group || "", min_age, max_age, status, id]
        );
        if (result.affectedRows === 0) {
            return NextResponse.json({
                success: false,
                message: "Age Group not found."
            }, { status: 404 })
        } else {
            return NextResponse.json({
                success: true,
                message: "Age Group updated successfully."
            });
        }
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

// DELETE : Soft Delete
// ==============================
export async function DELETE(request, { params }) {
    const connection = await pool.getConnection();
    try {

        const { id } = await params;

        const [result] = await connection.query(
            `
            UPDATE cst_age_groups
            SET is_deleted = 1
            WHERE id = ?
            `,
            [id]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Age Group not found."
                },
                {
                    status: 404
                }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Age Group deleted successfully."
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

