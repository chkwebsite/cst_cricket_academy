import { NextResponse } from "next/server";
import pool from "@/components/lib/db";
import fs from 'fs';
import path from "path";

// GET Single
// ===========================
export async function GET(req, { params }) {
    try {

        const { id } = await params;

        const [rows] = await pool.query(
            `SELECT *
             FROM cst_co_founders
             WHERE id = ?
             AND is_deleted = 0
             LIMIT 1`,
            [id]
        );

        if (rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Record not found."
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

    }
}

// ===========================
// UPDATE
// ===========================
export async function PUT(req, { params }) {

    try {

        const { id } = await params;

        const formData = await req.formData();

        const title = formData.get("title");
        const name = formData.get("name");
        const designation = formData.get("designation");
        const sub_designation = formData.get("sub_designation");
        const description = formData.get("description");
        const experience = formData.get("experience");
        const qualification = formData.get("qualification");
        const display_order = Number(formData.get("display_order") || 0);
        const rawStatus = formData.get("status");
        const status = rawStatus === null || rawStatus === "" ? 1 : Number(rawStatus);

        const image = formData.get("profile_image");

        // Existing Record
        const [old] = await pool.query(
            "SELECT profile_image FROM cst_co_founders WHERE id=?",
            [id]
        );

        if (old.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Record not found."
                },
                { status: 404 }
            );
        }

        let imagePath = old[0].profile_image;

        // New Image Upload
        if (image && typeof image === "object" && image.size > 0) {

            const allowed = [
                "image/jpeg",
                "image/jpg",
                "image/png",
                "image/webp"
            ];

            if (!allowed.includes(image.type)) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Only JPG, PNG and WEBP images are allowed."
                    },
                    { status: 400 }
                );
            }

            const bytes = await image.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const uploadDir = path.join(
                process.cwd(),
                "public/images/uploads/co-founders"
            );

            fs.mkdirSync(uploadDir, { recursive: true });

            const ext = image.name.split(".").pop().toLowerCase();

            const fileName =
                `${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2)}.${ext}`;

            const filePath = path.join(uploadDir, fileName);

            fs.writeFileSync(filePath, buffer);

            imagePath = `/images/uploads/co-founders/${fileName}`;

            // Delete Old Image
            if (old[0].profile_image) {

                const oldImage = path.join(
                    process.cwd(),
                    "public",
                    old[0].profile_image
                );

                if (fs.existsSync(oldImage)) {
                    fs.unlinkSync(oldImage);
                }

            }
        }

        // Update
        await pool.query(
            `
            UPDATE cst_co_founders
            SET
                title=?,
                name=?,
                designation=?,
                sub_designation=?,
                profile_image=?,
                description=?,
                experience=?,
                qualification=?,
                display_order=?,
                status=?
            WHERE id=?
            `,
            [
                title,
                name,
                designation,
                sub_designation,
                imagePath,
                description,
                experience,
                qualification,
                display_order,
                status,
                id
            ]
        );

        return NextResponse.json({
            success: true,
            message: "Updated Successfully"
        });

    } catch (error) {

        return NextResponse.json(
            {
                success: false,
                message: error.message
            },
            { status: 500 }
        );

    }
}

// ===========================
// DELETE (Soft Delete)
// ===========================
export async function DELETE(req, { params }) {

    try {

        const { id } = await params;

        await pool.query(
            `
            UPDATE cst_co_founders
            SET is_deleted=1
            WHERE id=?
            `,
            [id]
        );

        return NextResponse.json({
            success: true,
            message: "Deleted Successfully"
        });

    } catch (error) {

        return NextResponse.json(
            {
                success: false,
                message: error.message
            },
            { status: 500 }
        );

    }

}
