import { NextResponse } from "next/server";
import pool from "@/components/lib/db";
import fs from "fs";
import path from "path";

// ================= GET SINGLE =================
export async function GET(request, { params }) {

    const connection = await pool.getConnection();

    try {

        const { id } = await params;

        const [rows] = await connection.query(
            `SELECT *
            FROM cst_gallery_albums
            WHERE id=?;`,
            [id]
        );

        if (!rows.length) {
            return NextResponse.json({
                success: false,
                message: "Category not found."
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

//Upload

export async function PUT(request, { params }) {

    const connection = await pool.getConnection();

    try {

        const { id } = await params;

        const formData = await request.formData();

        const category_id = formData.get("category_id");
        const branch_id = formData.get("branch_id");
        const album_title = formData.get("album_title");
        const slug = formData.get("slug");
        const description = formData.get("description");
        const event_date = formData.get("event_date");
        const location = formData.get("location");
        const is_featured = formData.get("is_featured");
        const sort_order = formData.get("sort_order");
        const status = formData.get("status");

        const [rows] = await connection.query(
            "SELECT * FROM cst_gallery_albums WHERE id=?",
            [id]
        );

        if (!rows.length) {
            return NextResponse.json({
                success: false,
                message: "Album not found."
            }, { status: 404 });
        }

        let cover_image = rows[0].cover_image;

        const file = formData.get("cover_image");

        if (file && file.size > 0) {

            if (cover_image) {

                const oldImage = path.join(
                    process.cwd(),
                    "public",
                    cover_image
                );

                if (fs.existsSync(oldImage)) {
                    fs.unlinkSync(oldImage);
                }
            }

            const ext = file.name.split(".").pop();

            const fileName = `album_${Date.now()}.${ext}`;

            const buffer = Buffer.from(await file.arrayBuffer());

            const uploadDir = path.join(
                process.cwd(),
                "public/images/uploads/gallery/albums"
            );

            fs.writeFileSync(
                path.join(uploadDir, fileName),
                buffer
            );

            cover_image = `/images/uploads/gallery/albums/${fileName}`;
        }

        await connection.query(
            `UPDATE cst_gallery_albums
            SET
            category_id=?,
            branch_id=?,
            album_title=?,
            slug=?,
            description=?,
            cover_image=?,
            event_date=?,
            location=?,
            is_featured=?,
            sort_order=?,
            status=?
            WHERE id=?`,
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
                id
            ]
        );

        return NextResponse.json({
            success: true,
            message: "Album updated successfully."
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
            "SELECT cover_image FROM cst_gallery_albums WHERE id=?",
            [id]
        );

        if (!rows.length) {

            return NextResponse.json({
                success: false,
                message: "Album not found."
            }, { status: 404 });

        }

        if (rows[0].cover_image) {

            const imagePath = path.join(
                process.cwd(),
                "public",
                rows[0].cover_image
            );

            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await connection.query(
            "DELETE FROM cst_gallery_albums WHERE id=?",
            [id]
        );

        return NextResponse.json({
            success: true,
            message: "Album deleted successfully."
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

