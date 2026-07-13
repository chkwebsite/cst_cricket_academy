import { NextResponse } from "next/server";
import pool from "@/components/lib/db";
import fs from 'fs';
import path from "path";

// GET ALL
// ==========================
export async function GET() {
    try {

        const [rows] = await pool.query(`
            SELECT *
            FROM cst_co_founders
            WHERE is_deleted = 0
            ORDER BY display_order ASC,id DESC
        `);

        return NextResponse.json({
            success: true,
            data: rows
        });

    } catch (error) {

        return NextResponse.json({
            success: false,
            message: error.message
        }, {
            status: 500
        });

    }
}

// ==========================
// POST
// ==========================
export async function POST(req) {

    try {

        const formData = await req.formData();

        const title = formData.get("title");
        const name = formData.get("name");
        const designation = formData.get("designation");
        const sub_designation = formData.get("sub_designation");
        const description = formData.get("description");
        const experience = formData.get("experience");
        const qualification = formData.get("qualification");
        const display_order = formData.get("display_order") || 0;
        const status = formData.get("status") || 1;

        const image = formData.get("profile_image");

        if (!name || !designation) {

            return NextResponse.json({
                success: false,
                message: "Name and Designation are required."
            }, {
                status: 400
            });

        }

        // Duplicate Check
        const [exist] = await pool.query(
            `
            SELECT id
            FROM cst_co_founders
            WHERE
            name = ?
            AND is_deleted = 0
            `,
            [name]
        );

        if (exist.length > 0) {

            return NextResponse.json({
                success: false,
                message: "Co-Founder already exists."
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
            const uploadDir = path.join(process.cwd(), "public/images/uploads/co-founders");
            if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

            const ext = image.name.split(".").pop().toLowerCase();
            const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
            const filePath = path.join(uploadDir, fileName);
            fs.writeFileSync(filePath, buffer);
            imagePath = `/images/uploads/co-founders/${fileName}`;
        }

        const [result] = await pool.query(
            `
            INSERT INTO cst_co_founders
            (
                title,
                name,
                designation,
                sub_designation,
                profile_image,
                description,
                experience,
                qualification,
                display_order,
                status
            )
            VALUES
            (
                ?,?,?,?,?,?,?,?,?,?
            )
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
                status
            ]
        );

        return NextResponse.json({
            success: true,
            message: "Co-Founder Added Successfully",
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