import { NextResponse } from "next/server";
import pool from "@/components/lib/db";

// GET : Single Branch
// ==============================
export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const [rows] = await pool.query(
            `
            SELECT *
            FROM cst_branch
            WHERE id = ?
            AND is_deleted = 0
            LIMIT 1
            `,
            [id]
        );

        if (rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Branch not found."
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: rows[0]
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

    }
}

// ==============================
// PUT : Update Branch
// ==============================
export async function PUT(request, { params }) {

    try {

        const { id } = await params;

        const body = await request.json();

        const {
            branch_name,
            branch_code,
            contact_person,
            mobile,
            email,
            address,
            city,
            state,
            pincode,
            latitude,
            longitude,
            status
        } = body;

        if (!branch_name || !branch_code) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Branch Name and Branch Code are required."
                },
                {
                    status: 400
                }
            );
        }

        // Duplicate Check
        const [exist] = await pool.query(
            `
            SELECT id
            FROM cst_branch
            WHERE
            (
                branch_name = ?
                OR branch_code = ?
            )
            AND id <> ?
            AND is_deleted = 0
            `,
            [
                branch_name,
                branch_code,
                id
            ]
        );

        if (exist.length > 0) {

            return NextResponse.json(
                {
                    success: false,
                    message: "Branch already exists."
                },
                {
                    status: 409
                }
            );

        }

        const [result] = await pool.query(
            `
            UPDATE cst_branch
            SET
                branch_name = ?,
                branch_code = ?,
                contact_person = ?,
                mobile = ?,
                email = ?,
                address = ?,
                city = ?,
                state = ?,
                pincode = ?,
                latitude = ?,
                longitude = ?,
                status = ?
            WHERE id = ?
            `,
            [
                branch_name,
                branch_code,
                contact_person || "",
                mobile || "",
                email || "",
                address || "",
                city || "",
                state || "",
                pincode || "",
                latitude || null,
                longitude || null,
                status ?? 1,
                id
            ]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Branch not found."
                },
                {
                    status: 404
                }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Branch updated successfully."
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

    }

}

// ==============================
// DELETE : Soft Delete
// ==============================
export async function DELETE(request, { params }) {

    try {

        const { id } = await params;

        const [result] = await pool.query(
            `
            UPDATE cst_branch
            SET is_deleted = 1
            WHERE id = ?
            `,
            [id]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Branch not found."
                },
                {
                    status: 404
                }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Branch deleted successfully."
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

    }

}