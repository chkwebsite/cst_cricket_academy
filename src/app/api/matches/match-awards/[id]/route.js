import { NextResponse } from "next/server";
import pool from "@/components/lib/db";

// GET SINGLE MATCH AWARD
// ==============================
export async function GET(request, { params }) {

    const connection = await pool.getConnection();

    try {

        const { id } = await params;

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
                ON m.id = ma.match_id

            LEFT JOIN cst_match_team_players mtp
                ON mtp.id = ma.player_id

            LEFT JOIN cst_users u
                ON u.id = mtp.user_id

            LEFT JOIN cst_outside_player op
                ON op.id = mtp.player_id

            WHERE ma.id = ?
        `, [id]);

        if (rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Award not found.",
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

// ==============================
// UPDATE MATCH AWARD
// ==============================
export async function PUT(request, { params }) {

    const connection = await pool.getConnection();

    try {

        const { id } = await params;

        const {
            match_id,
            award_type,
            player_id,
            remarks
        } = await request.json();

        if (!match_id || !award_type || !player_id) {

            return NextResponse.json(
                {
                    success: false,
                    message: "Match, Award Type and Player are required.",
                },
                { status: 400 }
            );

        }

        const [exists] = await connection.query(
            `
            SELECT id
            FROM cst_match_awards
            WHERE
                match_id = ?
                AND award_type = ?
                AND player_id = ?
                AND id <> ?
            `,
            [
                match_id,
                award_type,
                player_id,
                id
            ]
        );

        if (exists.length > 0) {

            return NextResponse.json(
                {
                    success: false,
                    message: "Award already assigned.",
                },
                { status: 409 }
            );

        }

        const [result] = await connection.query(
            `
            UPDATE cst_match_awards
            SET
                match_id = ?,
                award_type = ?,
                player_id = ?,
                remarks = ?
            WHERE id = ?
            `,
            [
                match_id,
                award_type,
                player_id,
                remarks || null,
                id
            ]
        );

        if (result.affectedRows === 0) {

            return NextResponse.json(
                {
                    success: false,
                    message: "Award not found.",
                },
                { status: 404 }
            );

        }

        return NextResponse.json({
            success: true,
            message: "Award updated successfully.",
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
// DELETE MATCH AWARD
// ==============================
export async function DELETE(request, { params }) {

    const connection = await pool.getConnection();

    try {

        const { id } = await params;

        const [result] = await connection.query(
            `DELETE FROM cst_match_awards WHERE id = ?`,
            [id]
        );

        if (result.affectedRows === 0) {

            return NextResponse.json(
                {
                    success: false,
                    message: "Award not found.",
                },
                { status: 404 }
            );

        }

        return NextResponse.json({
            success: true,
            message: "Award deleted successfully.",
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

