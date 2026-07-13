import { NextResponse } from "next/server";
import pool from "@/components/lib/db";
import fs from 'fs';
import path from "path";

// ================= GET ALL =================
export async function GET() {
    try {
        const [rows] = await pool.query(`
            SELECT
                cp.*,
                u.first_name,
                u.last_name,
                b.branch_name,
                p.designation AS coach_designation
            FROM cst_coaching_program cp
            LEFT JOIN cst_users u
                ON u.id = cp.user_id
            LEFT JOIN cst_branch b
                ON b.id = cp.branch_id
            LEFT JOIN cst_profile p
                ON p.id = cp.coach_id
            WHERE cp.is_deleted = 0
            ORDER BY cp.id DESC
        `);

        return NextResponse.json({
            success: true,
            data: rows,
        });

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error.message,
        });
    }
}

// ================= INSERT =================

export async function POST(req) {

    try {

        const formData = await req.formData();

        const user_id = formData.get("user_id");
        const coach_id = formData.get("coach_id");
        const branch_id = formData.get("branch_id");
        const title = formData.get("title");
        const slug = formData.get("slug");
        const designation = formData.get("designation");
        const sub_designation = formData.get("sub_designation");
        const about_me = formData.get("about_me");
        const description = formData.get("description");
        const start_date = formData.get("start_date");
        const end_date = formData.get("end_date");
        const start_time = formData.get("start_time");
        const end_time = formData.get("end_time");
        const duration = formData.get("duration");
        const days = formData.get("days");
        const age_group = formData.get("age_group");
        const skill_level = formData.get("skill_level");
        const total_seats = formData.get("total_seats");
        const available_seats = formData.get("available_seats");
        const fees = formData.get("fees");
        const display_order = formData.get("display_order");
        const featured = formData.get("featured");
        const status = formData.get("status");

        const image = formData.get("program_image");

        if (!title || !designation) {

            return NextResponse.json({
                success: false,
                message: "Title and Designation are required."
            }, {
                status: 400
            });

        }

        // Duplicate Check
        const [exist] = await pool.query(
            `
            SELECT id
            FROM cst_coaching_program
            WHERE
            title = ?
            AND is_deleted = 0
            `,
            [title]
        );

        if (exist.length > 0) {

            return NextResponse.json({
                success: false,
                message: "Coaching Program already exists."
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
            const uploadDir = path.join(process.cwd(), "public/images/uploads/coaching_program");
            if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

            const ext = image.name.split(".").pop().toLowerCase();
            const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
            const filePath = path.join(uploadDir, fileName);
            fs.writeFileSync(filePath, buffer);
            imagePath = `public/images/uploads/coaching_program/${fileName}`;
        }

        const [result] = await pool.query(
            `
            INSERT INTO cst_coaching_program
            (
                 user_id,
                coach_id,
                branch_id,
                title,
                slug,
                program_image,
                designation,
                sub_designation,
                about_me,
                description,
                start_date,
                end_date,
                start_time,
                end_time,
                duration,
                days,
                age_group,
                skill_level,
                total_seats,
                available_seats,
                fees,
                display_order,
                featured,
                status
            )
            VALUES
            (
                ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
            )
            `,
            [
                user_id,
                coach_id,
                branch_id,
                title,
                slug,
                imagePath,
                designation,
                sub_designation,
                about_me,
                description,
                start_date,
                end_date,
                start_time,
                end_time,
                duration,
                days,
                age_group,
                skill_level,
                total_seats,
                available_seats,
                fees,
                display_order,
                featured,
                status,
            ]
        );

        return NextResponse.json({
            success: true,
            message: "Program added successfully",
            id: result.insertId
        });

    } catch (error) {

        console.log(error);

        return NextResponse.json({
            success: false,
            message: error.message
        }, {
            status: 500
        });

    }

}
