import { NextResponse } from "next/server";
import pool from "@/components/lib/db";

// ================= GET SINGLE =================
export async function GET(request, { params }) {

    const connection = await pool.getConnection();

    try {

        const { id } = await params;

        const [rows] = await connection.query(
            `SELECT
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
            WHERE gv.id=?`,
            [id]
        );

        if (!rows.length) {
            return NextResponse.json({
                success: false,
                message: "Video not found."
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

// ================= UPDATE =================
export async function PUT(request, { params }) {

    const connection = await pool.getConnection();

    try {

        const { id } = await params;

        const body = await request.json();

        const {
            album_id,
            video_title,
            video_url,
            video_type,
            duration,
            sort_order,
            status
        } = body;

        const [rows] = await connection.query(
            "SELECT id FROM cst_gallery_videos WHERE id=?",
            [id]
        );

        if (!rows.length) {
            return NextResponse.json({
                success: false,
                message: "Video not found."
            }, { status: 404 });
        }

        await connection.query(
            `UPDATE cst_gallery_videos
            SET
                album_id=?,
                video_title=?,
                video_url=?,
                video_type=?,
                duration=?,
                sort_order=?,
                status=?
            WHERE id=?`,
            [
                album_id,
                video_title,
                video_url,
                video_type,
                duration,
                sort_order,
                status,
                id
            ]
        );

        return NextResponse.json({
            success: true,
            message: "Video updated successfully."
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

// ================= DELETE =================
export async function DELETE(request, { params }) {

    const connection = await pool.getConnection();

    try {

        const { id } = await params;

        const [rows] = await connection.query(
            "SELECT id FROM cst_gallery_videos WHERE id=?",
            [id]
        );

        if (!rows.length) {
            return NextResponse.json({
                success: false,
                message: "Video not found."
            }, { status: 404 });
        }

        await connection.query(
            "DELETE FROM cst_gallery_videos WHERE id=?",
            [id]
        );

        return NextResponse.json({
            success: true,
            message: "Video deleted successfully."
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

