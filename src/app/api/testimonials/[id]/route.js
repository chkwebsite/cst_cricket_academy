import { NextResponse } from "next/server";
import pool from "@/components/lib/db";
import fs from 'fs';
import path from "path";

// GET Single
// ===========================
export async function GET(req, { params }) {
    const connection = await pool.getConnection();
    try {

        const { id } = await params;

        const [rows] = await connection.query(
            `SELECT
        t.*,

        u.first_name,
        u.last_name,
        u.email AS user_email,
        u.mobile,
        u.profile_image AS user_profile_image,

        b.branch_name,
        b.branch_code,
        b.address AS branch_address

      FROM cst_testimonials t

      LEFT JOIN cst_users u
        ON u.id = t.user_id
        AND u.is_deleted = 0

      LEFT JOIN cst_branch b
        ON b.id = t.branch_id
        AND b.is_deleted = 0

      WHERE t.id = ? AND t.is_deleted = 0
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

    } finally {
        connection.release();
    }
}

// UPDATE
// ===========================
export async function PUT(req, { params }) {
    const connection = await pool.getConnection();
    try {

        const { id } = await params;

        const formData = await req.formData();

        const user_id = formData.get("user_id");
        const branch_id = formData.get("branch_id");
        const student_name = formData.get("student_name");
        const parent_name = formData.get("parent_name");
        const email = formData.get("email");
        const contact = formData.get("contact");
        const designation = formData.get("designation");
        const presented = formData.get("presented");
        const testimonial = formData.get("testimonial");
        const rating = formData.get("rating");
        const display_order = formData.get("display_order");
        const featured = formData.get("featured");
        const video_url = formData.get("video_url");
        const status = formData.get("status");

        const image = formData.get("profile_image");

        // Existing Record
        const [old] = await connection.query(
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

            if (image.size > 2 * 1024 * 1024) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Image size must be less than 2 MB."
                    },
                    { status: 400 }
                );
            }

            const bytes = await image.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const uploadDir = path.join(
                process.cwd(),
                "public/images/uploads/testimonials"
            );

            fs.mkdirSync(uploadDir, { recursive: true });

            const ext = image.name.split(".").pop().toLowerCase();

            const fileName =
                `${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2)}.${ext}`;

            const filePath = path.join(uploadDir, fileName);

            fs.writeFileSync(filePath, buffer);

            imagePath = `/images/uploads/testimonials/${fileName}`;

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
        await connection.query(
            `
            UPDATE cst_testimonials SET
        user_id=?,
        branch_id=?,
        student_name=?,
        parent_name=?,
        email=?,
        contact=?,
        profile_image=?,
        designation=?,
        presented=?,
        testimonial=?,
        rating=?,
        display_order=?,
        featured=?,
        video_url=?,
        status=?
        WHERE id=?
            `,
            [
                user_id || null,
                branch_id || null,
                student_name,
                parent_name,
                email,
                contact,
                profile_image,
                designation,
                presented,
                testimonial,
                rating,
                display_order,
                featured,
                video_url,
                status,
                id,
            ]
        );

        return NextResponse.json({
            success: true,
            message: "Testimonial updated successfully.",
        });

    } catch (error) {

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

// ===========================
// DELETE (Soft Delete)
// ===========================
export async function DELETE(req, { params }) {
    const connection = await pool.getConnection();
    try {

        const { id } = await params;

        await connection.query(
            `
            UPDATE cst_testimonials
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

    } finally {
        connection.release();
    }

}

