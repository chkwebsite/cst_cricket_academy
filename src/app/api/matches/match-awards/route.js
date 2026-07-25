import { NextResponse } from "next/server";
import pool from "@/components/lib/db";

// GET ALL MATCH AWARDS
// ==============================
export async function GET() {

    const connection = await pool.getConnection();

    try {

        const [rows] = await connection.query(`
            SELECT

                ma.*,

                m.match_no,

                mtp.user_id,

                mtp.player_id AS outside_player_id,

                CONCAT(u.first_name,' ',u.last_name) AS academy_player,

                op.name AS outside_player

            FROM cst_match_awards ma

            LEFT JOIN cst_matches m
                ON m.id=ma.match_id

            LEFT JOIN cst_match_team_players mtp
                ON mtp.id=ma.player_id

            LEFT JOIN cst_users u
                ON u.id=mtp.user_id

            LEFT JOIN cst_outside_player op
                ON op.id=mtp.player_id

            ORDER BY ma.id DESC
        `);

        return NextResponse.json({
            success: true,
            data: rows
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
// ADD MATCH AWARD
// ==============================
export async function POST(request) {

    const connection = await pool.getConnection();

    try {

        const {

            match_id,
            award_type,
            player_id,
            remarks

        } = await request.json();

        if (
            !match_id ||
            !award_type ||
            !player_id
        ) {

            return NextResponse.json({
                success: false,
                message: "Match, Award Type and Player are required."
            }, { status: 400 });

        }

        // Duplicate Check
        const [exists] = await connection.query(`
            SELECT id
            FROM cst_match_awards
            WHERE
                match_id=?
                AND award_type=?
                AND player_id=?
        `, [
            match_id,
            award_type,
            player_id
        ]);

        if (exists.length) {

            return NextResponse.json({
                success: false,
                message: "Award already assigned."
            }, { status: 409 });

        }

        const [result] = await connection.query(`
            INSERT INTO cst_match_awards
            (
                match_id,
                award_type,
                player_id,
                remarks
            )
            VALUES
            (?,?,?,?)
        `, [
            match_id,
            award_type,
            player_id,
            remarks || null
        ]);

        return NextResponse.json({
            success: true,
            message: "Award added successfully.",
            id: result.insertId
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