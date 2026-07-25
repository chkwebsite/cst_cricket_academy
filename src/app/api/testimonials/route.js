import { NextResponse } from "next/server";
import pool from "@/components/lib/db";
import fs from 'fs';
import path from "path";

export async function GET() {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query(`
      SELECT
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

      WHERE t.is_deleted = 0
      ORDER BY t.display_order ASC, t.id DESC
    `);

        return NextResponse.json({
            success: true,
            data: rows,
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

// POST
// ==========================
export async function POST(req) {
    const connection = await pool.getConnection();
    try {

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
        const rating = formData.get("rating") || 5;
        const display_order = formData.get("display_order") || 0;
        const featured = formData.get("featured") || 0;
        const video_url = formData.get("video_url");
        const status = formData.get("status") ?? 1;

        const image = formData.get("profile_image");

        if (!student_name || !parent_name) {

            return NextResponse.json({
                success: false,
                message: "Student name and Parent name are required."
            }, {
                status: 400
            });

        }

        // Duplicate Check
        const [exist] = await connection.query(
            `
            SELECT id
            FROM cst_testimonials
            WHERE
            student_name = ?
            AND is_deleted = 0
            `,
            [student_name]
        );

        if (exist.length > 0) {

            return NextResponse.json({
                success: false,
                message: "Testimonials already exists."
            }, {
                status: 409
            });

        }

        let imagePath = null;
        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
        ];

        if (image && image.size > 0) {

            if (!allowedTypes.includes(image.type)) {
                return NextResponse.json({
                    success: false,
                    message: "Only JPG, PNG and WEBP images are allowed."
                }, { status: 400 });
            }

            if (image.size > 2 * 1024 * 1024) {
                return NextResponse.json({
                    success: false,
                    message: "Image size must be less than 2 MB."
                }, { status: 400 });
            }
        }
        if (image && typeof image === "object" && image.size > 0) {
            const bytes = await image.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const uploadDir = path.join(process.cwd(), "public/images/uploads/testimonials");
            if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

            const ext = image.name.split(".").pop().toLowerCase();
            const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
            const filePath = path.join(uploadDir, fileName);
            fs.writeFileSync(filePath, buffer);
            imagePath = `/images/uploads/testimonials/${fileName}`;
        }

        const [result] = await connection.query(
            `
            INSERT INTO cst_testimonials
            (
                user_id,
                branch_id,
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
                status
            )
            VALUES
            (
                ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
            )
            `,
            [
                user_id || null,
                branch_id || null,
                student_name,
                parent_name,
                email,
                contact,
                imagePath,
                designation,
                presented,
                testimonial,
                rating,
                display_order,
                featured,
                video_url,
                status,
            ]
        );

        return NextResponse.json({
            success: true,
            message: "Testimonial added successfully.",
            id: result.insertId,
        });

    } catch (error) {

        console.log(error);

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