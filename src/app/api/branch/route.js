import { NextResponse } from "next/server";
import pool from "@/components/lib/db";

// GET : All Branches
// ==============================
export async function GET() {
    try {

        const [rows] = await pool.query(`
            SELECT *
            FROM cst_branch
            WHERE is_deleted = 0
            ORDER BY id DESC
        `);

        return NextResponse.json({
            success: true,
            data: rows
        });

    } catch (error) {

        console.error(error);

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
// POST : Add Branch
// ==============================
export async function POST(req) {

    try {

        const body = await req.json();

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

        // Validation
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
            AND is_deleted = 0
            `,
            [
                branch_name,
                branch_code
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

        // Insert
        const [result] = await pool.query(
            `
            INSERT INTO cst_branch
            (
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
            )
            VALUES
            (
                ?,?,?,?,?,?,?,?,?,?,?,?
            )
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
                status ?? 1
            ]
        );

        return NextResponse.json({
            success: true,
            message: "Branch added successfully.",
            id: result.insertId
        });

    } catch (error) {

        console.error(error);

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