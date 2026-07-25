import { NextResponse } from "next/server";
import pool from "@/components/lib/db";

// GET SINGLE INNINGS
// ==============================
export async function GET(request, { params }) {

    const connection = await pool.getConnection();

    try {

        const { id } = await params;

        const [rows] = await connection.query(`
            SELECT
                mi.*,

                m.match_no,

                bt.team_name AS batting_team,

                bw.team_name AS bowling_team

            FROM cst_match_innings mi

            LEFT JOIN cst_matches m
                ON m.id=mi.match_id

            LEFT JOIN cst_teams bt
                ON bt.id=mi.batting_team_id

            LEFT JOIN cst_teams bw
                ON bw.id=mi.bowling_team_id

            WHERE mi.id=?
        `, [id]);

        if (rows.length === 0) {

            return NextResponse.json({
                success: false,
                message: "Innings not found."
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
// UPDATE INNINGS
// ==============================
export async function PUT(request, { params }) {

    const connection = await pool.getConnection();

    try {

        const { id } = await params;

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

        if (
            !match_id ||
            !innings_no ||
            !batting_team_id ||
            !bowling_team_id
        ) {

            return NextResponse.json({
                success: false,
                message: "Match, Innings No, Batting Team and Bowling Team are required."
            }, { status: 400 });

        }

        if (Number(batting_team_id) === Number(bowling_team_id)) {

            return NextResponse.json({
                success: false,
                message: "Batting Team and Bowling Team cannot be same."
            }, { status: 400 });

        }

        const [exists] = await connection.query(`
            SELECT id
            FROM cst_match_innings
            WHERE
                match_id=?
                AND innings_no=?
                AND id<>?
        `, [
            match_id,
            innings_no,
            id
        ]);

        if (exists.length) {

            return NextResponse.json({
                success: false,
                message: "Innings already exists."
            }, { status: 409 });

        }

        const [result] = await connection.query(`
            UPDATE cst_match_innings
            SET
                match_id=?,
                innings_no=?,
                batting_team_id=?,
                bowling_team_id=?,
                total_runs=?,
                wickets=?,
                overs=?,
                extras=?,
                target=?,
                remarks=?
            WHERE id=?
        `, [
            match_id,
            innings_no,
            batting_team_id,
            bowling_team_id,
            total_runs || 0,
            wickets || 0,
            overs || 0,
            extras || 0,
            target || 0,
            remarks || null,
            id
        ]);

        if (result.affectedRows === 0) {

            return NextResponse.json({
                success: false,
                message: "Innings not found."
            }, { status: 404 });

        }

        return NextResponse.json({
            success: true,
            message: "Innings updated successfully."
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
// DELETE INNINGS
// ==============================
export async function DELETE(request, { params }) {

    const connection = await pool.getConnection();

    try {

        const { id } = await params;

        const [result] = await connection.query(
            "DELETE FROM cst_match_innings WHERE id=?",
            [id]
        );

        if (result.affectedRows === 0) {

            return NextResponse.json({
                success: false,
                message: "Innings not found."
            }, { status: 404 });

        }

        return NextResponse.json({
            success: true,
            message: "Innings deleted successfully."
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

