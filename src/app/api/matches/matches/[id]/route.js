import { NextResponse } from "next/server";
import pool from "@/components/lib/db";

// ==============================
// GET SINGLE MATCH
// ==============================
export async function GET(request, { params }) {
    const connection = await pool.getConnection();

    try {
        const { id } = await params;

        const [rows] = await connection.query(
            `
            SELECT
                m.*,

                t.tournament_name,

                b.branch_name,

                ta.team_name AS team_a_name,

                tb.team_name AS team_b_name,

                mt.match_type,

                tw.team_name AS toss_winner_team,

                u1.name AS umpire1_name,

                u2.name AS umpire2_name,

                wt.team_name AS winner_team

            FROM cst_matches m

            LEFT JOIN cst_tournaments t
                ON t.id = m.tournament_id

            LEFT JOIN cst_branch b
                ON b.id = m.branch_id

            LEFT JOIN cst_teams ta
                ON ta.id = m.team_a_id

            LEFT JOIN cst_teams tb
                ON tb.id = m.team_b_id

            LEFT JOIN cst_match_types mt
                ON mt.id = m.match_type_id

            LEFT JOIN cst_teams tw
                ON tw.id = m.toss_winner_team_id

            LEFT JOIN cst_umpire u1
                ON u1.id = m.umpire1_id

            LEFT JOIN cst_umpire u2
                ON u2.id = m.umpire2_id

            LEFT JOIN cst_teams wt
                ON wt.id = m.winner_team_id

            WHERE m.id = ?
            `,
            [id]
        );

        if (rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Match not found.",
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
// UPDATE MATCH
// ==============================
export async function PUT(request, { params }) {

    const connection = await pool.getConnection();

    try {

        const { id } = await params;

        const {
            match_no,
            tournament_id,
            branch_id,
            team_a_id,
            team_b_id,
            match_type_id,
            match_date,
            match_time,
            overs,
            toss_winner_team_id,
            toss_decision,
            umpire1_id,
            umpire2_id,
            status,
            winner_team_id,
            result,
            man_of_the_match,
            remarks
        } = await request.json();

        if (!team_a_id || !team_b_id || !match_date) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Team A, Team B and Match Date are required.",
                },
                { status: 400 }
            );
        }

        if (Number(team_a_id) === Number(team_b_id)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Team A and Team B cannot be the same.",
                },
                { status: 400 }
            );
        }

        if (
            toss_winner_team_id &&
            Number(toss_winner_team_id) !== Number(team_a_id) &&
            Number(toss_winner_team_id) !== Number(team_b_id)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Toss winner must be Team A or Team B.",
                },
                { status: 400 }
            );
        }

        if (
            winner_team_id &&
            Number(winner_team_id) !== Number(team_a_id) &&
            Number(winner_team_id) !== Number(team_b_id)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Winner team must be Team A or Team B.",
                },
                { status: 400 }
            );
        }

        if (match_no) {

            const [exists] = await connection.query(
                `
                SELECT id
                FROM cst_matches
                WHERE match_no=? AND id<>?
                `,
                [match_no, id]
            );

            if (exists.length > 0) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Match number already exists.",
                    },
                    { status: 409 }
                );
            }
        }

        const [results] = await connection.query(
            `
            UPDATE cst_matches
            SET
                match_no=?,
                tournament_id=?,
                branch_id=?,
                team_a_id=?,
                team_b_id=?,
                match_type_id=?,
                match_date=?,
                match_time=?,
                overs=?,
                toss_winner_team_id=?,
                toss_decision=?,
                umpire1_id=?,
                umpire2_id=?,
                status=?,
                winner_team_id=?,
                result=?,
                man_of_the_match=?,
                remarks=?
            WHERE id=?
            `,
            [
                match_no || null,
                tournament_id || null,
                branch_id || null,
                team_a_id,
                team_b_id,
                match_type_id || null,
                match_date,
                match_time || null,
                overs || null,
                toss_winner_team_id || null,
                toss_decision || null,
                umpire1_id || null,
                umpire2_id || null,
                status || "Upcoming",
                winner_team_id || null,
                result || null,
                man_of_the_match || null,
                remarks || null,
                id,
            ]
        );

        if (results.affectedRows === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Match not found.",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Match updated successfully.",
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
// DELETE MATCH
// ==============================
export async function DELETE(request, { params }) {

    const connection = await pool.getConnection();

    try {

        const { id } = await params;

        const [result] = await connection.query(
            `DELETE FROM cst_matches WHERE id=?`,
            [id]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Match not found.",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Match deleted successfully.",
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