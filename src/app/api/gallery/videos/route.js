import { NextResponse } from "next/server";
import pool from "@/components/lib/db";

// ================= GET ALL =================
export async function GET(request) {

    const connection = await pool.getConnection();

    try {

        const { searchParams } = new URL(request.url);

        const album_id = searchParams.get("album_id");

        let query = `
            SELECT
                gv.*,
                ga.album_title,
                gc.category_name,
                u.username AS uploaded_by_name
            FROM cst_gallery_videos gv
            LEFT JOIN cst_gallery_albums ga
                ON gv.album_id = ga.id
            LEFT JOIN cst_gallery_categories gc
                ON ga.category_id = gc.id
            LEFT JOIN cst_users u
                ON gv.uploaded_by = u.id
        `;

        const params = [];

        if (album_id) {
            query += " WHERE gv.album_id=?";
            params.push(album_id);
        }

        query += " ORDER BY gv.sort_order ASC, gv.id DESC";

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

// ================= ADD =================
export async function POST(request) {

    const connection = await pool.getConnection();

    try {

        const body = await request.json();

        const {
            album_id,
            video_title,
            video_url,
            video_type,
            duration,
            sort_order,
            status,
            uploaded_by
        } = body;

        if (!album_id || !video_url) {
            return NextResponse.json({
                success: false,
                message: "Album and Video URL are required."
            }, { status: 400 });
        }

        const [result] = await connection.query(
            `INSERT INTO cst_gallery_videos
            (
                album_id,
                video_title,
                video_url,
                video_type,
                duration,
                sort_order,
                status,
                uploaded_by
            )
            VALUES(?,?,?,?,?,?,?,?)`,
            [
                album_id,
                video_title,
                video_url,
                video_type || "Upload",
                duration,
                sort_order || 0,
                status ?? 1,
                uploaded_by
            ]
        );

        return NextResponse.json({
            success: true,
            message: "Video added successfully.",
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