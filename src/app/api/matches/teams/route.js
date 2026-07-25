import { NextResponse } from "next/server";
import pool from "@/components/lib/db";
import fs from "fs/promises";
import path from "path";

// GET ALL TEAMS
// =======================
export async function GET() {
    const connection = await pool.getConnection();

    try {
        const [rows] = await connection.query(`
            SELECT
                t.*,
                b.branch_name
            FROM cst_teams t
            LEFT JOIN cst_branch b
                ON t.branch_id = b.id
            ORDER BY t.id DESC
        `);

        return NextResponse.json({
            success: true,
            data: rows,
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
// ADD TEAM

export async function POST(request) {
    const connection = await pool.getConnection();

    try {
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

        // Duplicate Team Name Check
        const [exists] = await connection.query(
            `SELECT id FROM cst_teams WHERE team_name=?`,
            [team_name]
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

        // Upload Team Logo
        let fileName = null;
        const logo = formData.get("team_logo");

        if (logo && logo.size > 0) {
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

        const [result] = await connection.query(
            `
            INSERT INTO cst_teams
            (
                branch_id,
                team_name,
                team_code,
                team_logo,
                category,
                coach_name,
                status
            )
            VALUES
            (?, ?, ?, ?, ?, ?, ?)
            `,
            [
                branch_id || null,
                team_name,
                team_code || null,
                fileName,
                category || "U-14",
                coach_name || null,
                status,
            ]
        );

        return NextResponse.json({
            success: true,
            message: "Team added successfully.",
            id: result.insertId,
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