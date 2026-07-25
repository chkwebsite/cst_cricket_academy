import { NextResponse } from "next/server";
import pool from "@/components/lib/db";
import fs from "fs";
import path from "path";

//Single Get
export async function GET(request, { params }) {

    const connection = await pool.getConnection();

    try {

        const { id } = await params;

        const [rows] = await connection.query(
            `
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
            WHERE gi.id = ?
            `,
            [id]
        );

        if (!rows.length) {
            return NextResponse.json({
                success: false,
                message: "Image not found."
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: rows[0]
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

export async function PUT(request, { params }) {

    const connection = await pool.getConnection();

    try {

        const { id } = await params;

        const formData = await request.formData();

        const album_id = formData.get("album_id");
        const image_caption = formData.get("image_caption");
        const sort_order = formData.get("sort_order");
        const status = formData.get("status");

        const [rows] = await connection.query(
            "SELECT * FROM cst_gallery_images WHERE id=?",
            [id]
        );

        if (!rows.length) {
            return NextResponse.json({
                success: false,
                message: "Image not found."
            }, { status: 404 });
        }

        let image_path = rows[0].image_path;

        const file = formData.get("image");

        if (file && file.size > 0) {

            const oldPath = path.join(
                process.cwd(),
                "public",
                image_path
            );

            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }

            const ext = file.name.split(".").pop();

            const fileName = `gallery_${Date.now()}.${ext}`;

            const buffer = Buffer.from(await file.arrayBuffer());

            fs.writeFileSync(
                path.join(
                    process.cwd(),
                    "public/images/uploads/gallery/images",
                    fileName
                ),
                buffer
            );

            image_path = `/images/uploads/gallery/images/${fileName}`;
        }

        await connection.query(
            `UPDATE cst_gallery_images
            SET
            album_id=?,
            image_path=?,
            image_caption=?,
            sort_order=?,
            status=?
            WHERE id=?`,
            [
                album_id,
                image_path,
                image_caption,
                sort_order,
                status,
                id
            ]
        );

        return NextResponse.json({
            success: true,
            message: "Image updated successfully."
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

//DELETE

export async function DELETE(request, { params }) {

    const connection = await pool.getConnection();

    try {

        const { id } = await params;

        const [rows] = await connection.query(
            "SELECT image_path FROM cst_gallery_images WHERE id=?",
            [id]
        );

        if (!rows.length) {

            return NextResponse.json({
                success: false,
                message: "Image not found."
            }, { status: 404 });

        }

        const img = path.join(
            process.cwd(),
            "public",
            rows[0].image_path
        );

        if (fs.existsSync(img)) {
            fs.unlinkSync(img);
        }

        await connection.query(
            "DELETE FROM cst_gallery_images WHERE id=?",
            [id]
        );

        return NextResponse.json({
            success: true,
            message: "Image deleted successfully."
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

