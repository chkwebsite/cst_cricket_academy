import { NextResponse } from "next/server";
import pool from "@/components/lib/db";
import fs from "fs";
import path from "path";

// GET

export async function GET(request) {
    const connection = await pool.getConnection();

    try {

        const { searchParams } = new URL(request.url);

        const album_id = searchParams.get("album_id");

        let query = `
            SELECT
                gi.*,
                ga.album_title,
                gc.category_name,
                u.username AS uploaded_by_name
            FROM cst_gallery_images gi
            LEFT JOIN cst_gallery_albums ga
                ON gi.album_id = ga.id
            LEFT JOIN cst_gallery_categories gc
                ON ga.category_id = gc.id
            LEFT JOIN cst_users u
                ON gi.uploaded_by = u.id
        `;

        const params = [];

        if (album_id) {
            query += ` WHERE gi.album_id = ?`;
            params.push(album_id);
        }

        query += ` ORDER BY gi.sort_order ASC, gi.id DESC`;

        const [rows] = await connection.query(query, params);

        return NextResponse.json({
            success: true,
            total: rows.length,
            data: rows
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

export async function POST(request) {
    const connection = await pool.getConnection();

    try {

        const formData = await request.formData();

        const album_id = formData.get("album_id");
        const image_caption = formData.get("image_caption");
        const sort_order = formData.get("sort_order") || 0;
        const status = formData.get("status") || 1;
        const uploaded_by = formData.get("uploaded_by");

        if (!album_id) {
            return NextResponse.json({
                success: false,
                message: "Album is required."
            }, { status: 400 });
        }

        const files = formData.getAll("images");

        if (!files.length) {
            return NextResponse.json({
                success: false,
                message: "Please select image."
            }, { status: 400 });
        }

        const uploadDir = path.join(
            process.cwd(),
            "public/images/uploads/gallery/images"
        );

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        for (const file of files) {

            if (!file || file.size === 0) continue;

            const ext = file.name.split(".").pop();

            const fileName = `gallery_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;

            const buffer = Buffer.from(await file.arrayBuffer());

            fs.writeFileSync(
                path.join(uploadDir, fileName),
                buffer
            );

            await connection.query(
                `INSERT INTO cst_gallery_images
                (
                    album_id,
                    image_path,
                    image_caption,
                    sort_order,
                    status,
                    uploaded_by
                )
                VALUES(?,?,?,?,?,?)`,
                [
                    album_id,
                    `/images/uploads/gallery/images/${fileName}`,
                    image_caption,
                    sort_order,
                    status,
                    uploaded_by
                ]
            );
        }

        return NextResponse.json({
            success: true,
            message: "Images uploaded successfully."
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