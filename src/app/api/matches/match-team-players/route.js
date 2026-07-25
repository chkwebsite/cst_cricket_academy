import { NextResponse } from "next/server";
import pool from "@/components/lib/db";

// GET ALL
// ==============================
export async function GET() {
    const connection = await pool.getConnection();

    try {

        const [rows] = await connection.query(`
            SELECT
                mtp.*,

                m.match_no,

                t.team_name,

                u.full_name AS academy_player,

                op.name AS outside_player

            FROM cst_match_team_players mtp

            LEFT JOIN cst_matches m
                ON m.id = mtp.match_id

            LEFT JOIN cst_teams t
                ON t.id = mtp.team_id

            LEFT JOIN cst_users u
                ON u.id = mtp.user_id

            LEFT JOIN cst_outside_player op
                ON op.id = mtp.player_id

            ORDER BY mtp.id DESC
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
// ADD PLAYER
// ==============================
export async function POST(request) {

    const connection = await pool.getConnection();

    try {

        const {
            match_id,
            team_id,
            player_id,
            user_id,
            is_playing11,
            is_captain,
            is_wicket_keeper,
            is_bollower,
            is_bollower_type,
            is_allrounder
        } = await request.json();

        // Required validation
        if (!match_id || !team_id) {

            return NextResponse.json(
                {
                    success: false,
                    message: "Match and Team are required.",
                },
                { status: 400 }
            );

        }

        // Academy OR Outside Player
        if (!player_id && !user_id) {

            return NextResponse.json(
                {
                    success: false,
                    message: "Please select an academy player or an outside player.",
                },
                { status: 400 }
            );

        }

        if (player_id && user_id) {

            return NextResponse.json(
                {
                    success: false,
                    message: "Select only one player.",
                },
                { status: 400 }
            );

        }

        // Duplicate Check
        let exists = [];

        if (user_id) {

            [exists] = await connection.query(
                `
                SELECT id
                FROM cst_match_team_players
                WHERE
                    match_id=?
                    AND team_id=?
                    AND user_id=?
                `,
                [
                    match_id,
                    team_id,
                    user_id
                ]
            );

        } else {

            [exists] = await connection.query(
                `
                SELECT id
                FROM cst_match_team_players
                WHERE
                    match_id=?
                    AND team_id=?
                    AND player_id=?
                `,
                [
                    match_id,
                    team_id,
                    player_id
                ]
            );

        }

        if (exists.length > 0) {

            return NextResponse.json(
                {
                    success: false,
                    message: "Player already added in this match.",
                },
                { status: 409 }
            );

        }

        const [result] = await connection.query(
            `
            INSERT INTO cst_match_team_players
            (
                match_id,
                team_id,
                player_id,
                user_id,
                is_playing11,
                is_captain,
                is_wicket_keeper,
                is_bollower,
                is_bollower_type,
                is_allrounder
            )
            VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                match_id,
                team_id,
                player_id || null,
                user_id || null,
                is_playing11 ?? 1,
                is_captain ?? 0,
                is_wicket_keeper ?? 0,
                is_bollower ?? 0,
                is_bollower_type || null,
                is_allrounder ?? 0,
            ]
        );

        return NextResponse.json({
            success: true,
            message: "Player added successfully.",
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