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
            `SELECT cp.*,
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
             WHERE cp.id = ?
             AND cp.is_deleted = 0
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

// UPDATE

export async function PUT(req, { params }) {
    try {

        const { id } = await params;

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

        // Get old image
        const [oldRecord] = await pool.query(
            "SELECT program_image FROM cst_coaching_program WHERE id=?",
            [id]
        );

        let program_image = oldRecord[0]?.program_image || "";

        const image = formData.get("program_image");

        if (image && image.size > 0) {
            const allowedTypes = [
                "image/jpeg",
                "image/jpg",
                "image/png",
                "image/webp"
            ];

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

            const uploadDir = path.join(
                process.cwd(),
                "public/images/uploads/coaching_program"
            );

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            // Delete old image
            if (program_image) {
                const oldPath = program_image.startsWith("public/")
                    ? path.join(process.cwd(), program_image)
                    : path.join(uploadDir, program_image);

                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }

            // Upload new image
            const fileName = Date.now() + "_" + image.name;

            const buffer = Buffer.from(await image.arrayBuffer());

            fs.writeFileSync(
                path.join(uploadDir, fileName),
                buffer
            );

            program_image = `public/images/uploads/coaching_program/${fileName}`;
        }

        await pool.query(
            `UPDATE cst_coaching_program
            SET
                user_id=?,
                coach_id=?,
                branch_id=?,
                title=?,
                slug=?,
                program_image=?,
                designation=?,
                sub_designation=?,
                about_me=?,
                description=?,
                start_date=?,
                end_date=?,
                start_time=?,
                end_time=?,
                duration=?,
                days=?,
                age_group=?,
                skill_level=?,
                total_seats=?,
                available_seats=?,
                fees=?,
                display_order=?,
                featured=?,
                status=?
            WHERE id=?`,
            [
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
                status,
                id
            ]
        );

        return NextResponse.json({
            success: true,
            message: "Program Updated Successfully"
        });

    } catch (error) {

        return NextResponse.json({
            success: false,
            message: error.message
        });

    }
}

// DELETE (Soft Delete)
// ===========================
export async function DELETE(req, { params }) {

    try {

        const { id } = await params;

        await pool.query(
            `
            UPDATE cst_coaching_program
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
