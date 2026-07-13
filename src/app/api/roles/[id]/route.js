import { NextResponse } from "next/server";
import pool from "@/components/lib/db";

// ================= GET =================

export async function GET(request, { params }) {

    try {

        const { id } = await params;

        const [role] = await pool.query(
            `SELECT *
             FROM cst_role
             WHERE id=? AND is_deleted=0`,
            [id]
        );

        if (role.length == 0) {

            return NextResponse.json({
                success: false,
                message: "Role not found."
            }, { status: 404 });

        }

        return NextResponse.json({
            success: true,
            data: role[0]
        });

    } catch (error) {

        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });

    }

}

// ================= PUT =================

export async function PUT(request, { params }) {

    try {

        const { id } = await params;

        const body = await request.json();

        const {
            role_name,
            description,
            status
        } = body;

        const [exist] = await pool.query(
            `SELECT id
             FROM cst_role
             WHERE role_name=?
             AND id<>?
             AND is_deleted=0`,
            [role_name, id]
        );

        if (exist.length > 0) {

            return NextResponse.json({
                success: false,
                message: "Role already exists."
            }, { status: 409 });

        }

        await pool.query(
            `UPDATE cst_role
             SET
                role_name=?,
                description=?,
                status=?
             WHERE id=?`,
            [
                role_name,
                description,
                status,
                id
            ]
        );

        return NextResponse.json({
            success: true,
            message: "Role Updated Successfully"
        });

    } catch (error) {

        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });

    }

}

// ================= DELETE =================

export async function DELETE(request, { params }) {

    try {

        const { id } = await params;

        await pool.query(
            `UPDATE cst_role
             SET is_deleted=1
             WHERE id=?`,
            [id]
        );

        return NextResponse.json({
            success: true,
            message: "Role Deleted Successfully"
        });

    } catch (error) {

        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });

    }

}