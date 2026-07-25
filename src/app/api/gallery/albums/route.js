import { NextResponse } from "next/server";
import pool from "@/components/lib/db";
import fs from "fs";
import path from "path";

// ================= GET ALL =================
export async function GET() {
    const connection = await pool.getConnection();

    try {
        const [rows] = await connection.query(`
            SELECT
            a.*,
            c.category_name,
            b.branch_name,
            u.username AS created_by_name
        FROM cst_gallery_albums a
        LEFT JOIN cst_gallery_categories c
            ON a.category_id=c.id
        LEFT JOIN cst_branch b
            ON a.branch_id=b.id
        LEFT JOIN cst_users u
            ON a.created_by=u.id
        ORDER BY a.sort_order,a.id DESC;
        `);

        return NextResponse.json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error(error);

        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });

    } finally {
        connection.release();
    }
}

//POST

export async function POST(request) {
    const connection = await pool.getConnection();

    try {
        const formData = await request.formData();

        const category_id = formData.get("category_id");
        const branch_id = formData.get("branch_id");
        const album_title = formData.get("album_title");
        const slug = formData.get("slug");
        const description = formData.get("description");
        const event_date = formData.get("event_date");
        const location = formData.get("location");
        const is_featured = formData.get("is_featured") || 0;
        const sort_order = formData.get("sort_order") || 0;
        const status = formData.get("status") || 1;
        const created_by = formData.get("created_by");

        if (!album_title || !category_id) {
            return NextResponse.json({
                success: false,
                message: "Album title and category are required."
            }, { status: 400 });
        }

        let cover_image = null;

        const file = formData.get("cover_image");

        if (file && file.size > 0) {

            const uploadDir = path.join(process.cwd(), "public/images/uploads/gallery/albums");

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const ext = file.name.split(".").pop();
            const fileName = `album_${Date.now()}.${ext}`;

            const buffer = Buffer.from(await file.arrayBuffer());

            fs.writeFileSync(path.join(uploadDir, fileName), buffer);

            cover_image = `/images/uploads/gallery/albums/${fileName}`;
        }

        const [result] = await connection.query(
            `INSERT INTO cst_gallery_albums
            (
                category_id,
                branch_id,
                album_title,
                slug,
                description,
                cover_image,
                event_date,
                location,
                is_featured,
                sort_order,
                status,
                created_by
            )
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
                category_id,
                branch_id || null,
                album_title,
                slug,
                description,
                cover_image,
                event_date || null,
                location,
                is_featured,
                sort_order,
                status,
                created_by
            ]
        );

        return NextResponse.json({
            success: true,
            message: "Album created successfully.",
            id: result.insertId
        });

    } catch (error) {

        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });

    } finally {
        connection.release();
    }
}