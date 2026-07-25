import { NextResponse } from "next/server";
import pool from "@/components/lib/db";
import fs from "fs/promises";
import path from "path";

// GET SINGLE TEAM
// =======================
export async function GET(request, { params }) {
    const connection = await pool.getConnection();

    try {
        const { id } = await params;

        const [rows] = await connection.query(
            `
            SELECT
                t.*,
                b.branch_name
            FROM cst_teams t
            LEFT JOIN cst_branch b
                ON b.id = t.branch_id
            WHERE t.id=?
            `,
            [id]
        );

        if (rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Team not found.",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: rows[0],
        });

    } catch (error) {
        console.error(error);

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

// =======================
// UPDATE TEAM
// =======================
export async function PUT(request, { params }) {

    const connection = await pool.getConnection();

    try {

        const { id } = await params;

        const formData = await request.formData();

        const branch_id = formData.get("branch_id");
        const team_name = formData.get("team_name");
        const team_code = formData.get("team_code");
        const category = formData.get("category");
        const coach_name = formData.get("coach_name");
        const status = Number(formData.get("status") || 1);

        if (!team_name) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Team name is required.",
                },
                { status: 400 }
            );
        }

        // Duplicate Check
        const [exists] = await connection.query(
            `
            SELECT id
            FROM cst_teams
            WHERE team_name=? AND id<>?
            `,
            [team_name, id]
        );

        if (exists.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Team already exists.",
                },
                { status: 409 }
            );
        }

        // Old Image
        const [oldData] = await connection.query(
            `SELECT team_logo FROM cst_teams WHERE id=?`,
            [id]
        );

        let fileName = oldData[0]?.team_logo || null;

        // New Image
        const logo = formData.get("team_logo");

        if (logo && logo.size > 0) {

            // Delete old image
            if (fileName) {
                await fs.unlink(
                    path.join(
                        process.cwd(),
                        "public/images/uploads/teams",
                        fileName
                    )
                ).catch(() => { });
            }

            const bytes = await logo.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const ext = path.extname(logo.name);

            fileName = `${Date.now()}${ext}`;

            const uploadDir = path.join(
                process.cwd(),
                "public/images/uploads/teams"
            );

            await fs.mkdir(uploadDir, { recursive: true });

            await fs.writeFile(
                path.join(uploadDir, fileName),
                buffer
            );
        }

        await connection.query(
            `
            UPDATE cst_teams
            SET
                branch_id=?,
                team_name=?,
                team_code=?,
                team_logo=?,
                category=?,
                coach_name=?,
                status=?
            WHERE id=?
            `,
            [
                branch_id || null,
                team_name,
                team_code || null,
                fileName,
                category,
                coach_name || null,
                status,
                id,
            ]
        );

        return NextResponse.json({
            success: true,
            message: "Team updated successfully.",
        });

    } catch (error) {

        console.error(error);

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

// =======================
// DELETE TEAM
// =======================
export async function DELETE(request, { params }) {

    const connection = await pool.getConnection();

    try {

        const { id } = await params;

        const [rows] = await connection.query(
            `SELECT team_logo FROM cst_teams WHERE id=?`,
            [id]
        );

        if (rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Team not found.",
                },
                { status: 404 }
            );
        }

        // Delete Image
        if (rows[0].team_logo) {

            await fs.unlink(
                path.join(
                    process.cwd(),
                    "public/images/uploads/teams",
                    rows[0].team_logo
                )
            ).catch(() => { });

        }

        await connection.query(
            `DELETE FROM cst_teams WHERE id=?`,
            [id]
        );

        return NextResponse.json({
            success: true,
            message: "Team deleted successfully.",
        });

    } catch (error) {

        console.error(error);

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