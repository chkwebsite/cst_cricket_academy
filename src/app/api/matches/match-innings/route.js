import { NextResponse } from "next/server";
import pool from "@/components/lib/db";

// GET ALL MATCH INNINGS
// ==============================
export async function GET() {
    const connection = await pool.getConnection();

    try {

        const [rows] = await connection.query(`
            SELECT
                mi.*,

                m.match_no,

                bt.team_name AS batting_team,

                bw.team_name AS bowling_team

            FROM cst_match_innings mi

            LEFT JOIN cst_matches m
                ON m.id = mi.match_id

            LEFT JOIN cst_teams bt
                ON bt.id = mi.batting_team_id

            LEFT JOIN cst_teams bw
                ON bw.id = mi.bowling_team_id

            ORDER BY mi.id DESC
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

// ==============================
// ADD MATCH INNINGS
// ==============================
export async function POST(request) {

    const connection = await pool.getConnection();

    try {

        const {
            match_id,
            innings_no,
            batting_team_id,
            bowling_team_id,
            total_runs,
            wickets,
            overs,
            extras,
            target,
            remarks
        } = await request.json();

        // Required Validation
        if (!match_id || !innings_no || !batting_team_id || !bowling_team_id) {

            return NextResponse.json(
                {
                    success: false,
                    message: "Match, Innings No, Batting Team and Bowling Team are required.",
                },
                { status: 400 }
            );

        }

        // Same Team Validation
        if (Number(batting_team_id) === Number(bowling_team_id)) {

            return NextResponse.json(
                {
                    success: false,
                    message: "Batting Team and Bowling Team cannot be the same.",
                },
                { status: 400 }
            );

        }

        // Duplicate Innings Check
        const [exists] = await connection.query(
            `
            SELECT id
            FROM cst_match_innings
            WHERE
                match_id = ?
                AND innings_no = ?
            `,
            [
                match_id,
                innings_no
            ]
        );

        if (exists.length > 0) {

            return NextResponse.json(
                {
                    success: false,
                    message: "This innings already exists for the selected match.",
                },
                { status: 409 }
            );

        }

        const [result] = await connection.query(
            `
            INSERT INTO cst_match_innings
            (
                match_id,
                innings_no,
                batting_team_id,
                bowling_team_id,
                total_runs,
                wickets,
                overs,
                extras,
                target,
                remarks
            )
            VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                match_id,
                innings_no,
                batting_team_id,
                bowling_team_id,
                total_runs || 0,
                wickets || 0,
                overs || 0,
                extras || 0,
                target || 0,
                remarks || null
            ]
        );

        return NextResponse.json({
            success: true,
            message: "Match innings added successfully.",
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