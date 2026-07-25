import { NextResponse } from "next/server";
import pool from "@/components/lib/db";
import fs from 'fs';
import path from "path";

// GET Single

export async function GET(req, { params }) {
    const connection = await pool.getConnection();
    try {
        const { id } = await params;

        const [rows] = await connection.query(
            `SELECT *
             FROM cst_experts
             WHERE id = ? AND is_deleted = 0`,
            [id]
        );

        if (rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Expert not found."
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
            { status: 500 }
        );
    } finally {
        connection.release();
    }
}

// UPDATE

export async function PUT(req, { params }) {
    const connection = await pool.getConnection();
    try {
        const { id } = await params;

        const formData = await req.formData();

        const branch_id = formData.get("branch_id");
        const expert_name = formData.get("expert_name")?.trim();
        const designation = formData.get("designation")?.trim();
        const about = formData.get("about");
        const status = formData.get("status") || 1;

        const image = formData.get("profile_image");

        const [expert] = await connection.query(
            `SELECT * FROM cst_experts
             WHERE id = ? AND is_deleted = 0`,
            [id]
        );

        if (!expert.length) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Expert not found."
                },
                { status: 404 }
            );
        }

        let imagePath = expert[0].profile_image;

        if (image && image.size > 0) {

            const uploadDir = path.join(
                process.cwd(),
                "public/images/uploads/experts"
            );

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            if (imagePath) {
                const oldPath = path.join(
                    process.cwd(),
                    "public",
                    imagePath.replace(/^\/+/, "")
                );

                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }

            const ext = image.name.split(".").pop();

            const fileName =
                `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;

            const buffer = Buffer.from(await image.arrayBuffer());

            fs.writeFileSync(
                path.join(uploadDir, fileName),
                buffer
            );

            imagePath = `/images/uploads/experts/${fileName}`;
        }

        await connection.query(
            `UPDATE cst_experts
             SET
                branch_id=?,
                expert_name=?,
                designation=?,
                profile_image=?,
                about=?,
                status=?
             WHERE id=?`,
            [
                branch_id,
                expert_name,
                designation,
                imagePath,
                about,
                status,
                id
            ]
        );

        return NextResponse.json({
            success: true,
            message: "Expert updated successfully."
        });

    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: error.message
            },
            { status: 500 }
        );
    } finally {
        connection.release();
    }
}

// DELETE (Soft Delete)

export async function DELETE(req, { params }) {
    const connection = await pool.getConnection();
    try {
        const { id } = await params;

        const [result] = await connection.query(
            `UPDATE cst_experts
             SET is_deleted = 1
             WHERE id = ?`,
            [id]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Expert not found."
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Expert deleted successfully."
        });

    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: error.message
            },
            { status: 500 }
        );
    } finally {
        connection.release();
    }
}

