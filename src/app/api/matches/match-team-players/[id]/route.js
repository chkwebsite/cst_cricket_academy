import { NextResponse } from "next/server";
import pool from "@/components/lib/db";

// GET SINGLE
// ==============================
export async function GET(request, { params }) {

    const connection = await pool.getConnection();

    try {

        const { id } = await params;

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

            WHERE mtp.id=?
        `, [id]);

        if (rows.length === 0) {

            return NextResponse.json({
                success: false,
                message: "Record not found."
            }, { status: 404 });

        }

        return NextResponse.json({
            success: true,
            data: rows[0]
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

// ==============================
// UPDATE
// ==============================
export async function PUT(request, { params }) {

    const connection = await pool.getConnection();

    try {

        const { id } = await params;

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

        if (!match_id || !team_id) {

            return NextResponse.json({
                success: false,
                message: "Match and Team are required."
            }, { status: 400 });

        }

        if (!player_id && !user_id) {

            return NextResponse.json({
                success: false,
                message: "Please select Academy Player or Outside Player."
            }, { status: 400 });

        }

        if (player_id && user_id) {

            return NextResponse.json({
                success: false,
                message: "Select only one player."
            }, { status: 400 });

        }

        let exists = [];

        if (user_id) {

            [exists] = await connection.query(`
                SELECT id
                FROM cst_match_team_players
                WHERE
                    match_id=?
                    AND team_id=?
                    AND user_id=?
                    AND id<>?
            `, [
                match_id,
                team_id,
                user_id,
                id
            ]);

        } else {

            [exists] = await connection.query(`
                SELECT id
                FROM cst_match_team_players
                WHERE
                    match_id=?
                    AND team_id=?
                    AND player_id=?
                    AND id<>?
            `, [
                match_id,
                team_id,
                player_id,
                id
            ]);

        }

        if (exists.length > 0) {

            return NextResponse.json({
                success: false,
                message: "Player already added in this match."
            }, { status: 409 });

        }

        const [result] = await connection.query(`
            UPDATE cst_match_team_players
            SET
                match_id=?,
                team_id=?,
                player_id=?,
                user_id=?,
                is_playing11=?,
                is_captain=?,
                is_wicket_keeper=?,
                is_bollower=?,
                is_bollower_type=?,
                is_allrounder=?
            WHERE id=?
        `, [
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
            id
        ]);

        if (result.affectedRows === 0) {

            return NextResponse.json({
                success: false,
                message: "Record not found."
            }, { status: 404 });

        }

        return NextResponse.json({
            success: true,
            message: "Player updated successfully."
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

// ==============================
// DELETE
// ==============================
export async function DELETE(request, { params }) {

    const connection = await pool.getConnection();

    try {

        const { id } = await params;

        const [result] = await connection.query(
            "DELETE FROM cst_match_team_players WHERE id=?",
            [id]
        );

        if (result.affectedRows === 0) {

            return NextResponse.json({
                success: false,
                message: "Record not found."
            }, { status: 404 });

        }

        return NextResponse.json({
            success: true,
            message: "Player deleted successfully."
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