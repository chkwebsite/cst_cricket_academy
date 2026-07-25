import { NextResponse } from "next/server";
import pool from "@/components/lib/db";

// GET ALL SCORECARDS
// ==============================
export async function GET() {

    const connection = await pool.getConnection();

    try {

        const [rows] = await connection.query(`
            SELECT

                ms.*,

                mi.innings_no,

                batter.user_id AS batter_user_id,
                batter.player_id AS batter_outside_player_id,

                bowler.user_id AS bowler_user_id,
                bowler.player_id AS bowler_outside_player_id,

                fielder.user_id AS fielder_user_id,
                fielder.player_id AS fielder_outside_player_id,

                CONCAT(u1.first_name,' ',u1.last_name) AS batter_name,
                op1.name AS batter_outside_name,

                CONCAT(u2.first_name,' ',u2.last_name) AS bowler_name,
                op2.name AS bowler_outside_name,

                CONCAT(u3.first_name,' ',u3.last_name) AS fielder_name,
                op3.name AS fielder_outside_name

            FROM cst_match_scorecard ms

            LEFT JOIN cst_match_innings mi
                ON mi.id = ms.innings_id

            LEFT JOIN cst_match_team_players batter
                ON batter.id = ms.player_id

            LEFT JOIN cst_match_team_players bowler
                ON bowler.id = ms.bowler_id

            LEFT JOIN cst_match_team_players fielder
                ON fielder.id = ms.fielder_id

            LEFT JOIN cst_users u1
                ON u1.id = batter.user_id

            LEFT JOIN cst_outside_player op1
                ON op1.id = batter.player_id

            LEFT JOIN cst_users u2
                ON u2.id = bowler.user_id

            LEFT JOIN cst_outside_player op2
                ON op2.id = bowler.player_id

            LEFT JOIN cst_users u3
                ON u3.id = fielder.user_id

            LEFT JOIN cst_outside_player op3
                ON op3.id = fielder.player_id

            ORDER BY ms.id DESC
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
// ADD SCORECARD
// ==============================
export async function POST(request) {

    const connection = await pool.getConnection();

    try {

        const {

            innings_id,
            player_id,
            batting_position,
            runs,
            balls,
            fours,
            sixes,
            strike_rate,
            how_out,
            bowler_id,
            fielder_id

        } = await request.json();

        if (!innings_id || !player_id) {

            return NextResponse.json({
                success: false,
                message: "Innings and Player are required."
            }, { status: 400 });

        }

        // Duplicate batting entry
        const [exists] = await connection.query(`
            SELECT id
            FROM cst_match_scorecard
            WHERE innings_id=? AND player_id=?
        `, [
            innings_id,
            player_id
        ]);

        if (exists.length > 0) {

            return NextResponse.json({
                success: false,
                message: "Player score already exists."
            }, { status: 409 });

        }

        const [result] = await connection.query(`
            INSERT INTO cst_match_scorecard
            (
                innings_id,
                player_id,
                batting_position,
                runs,
                balls,
                fours,
                sixes,
                strike_rate,
                how_out,
                bowler_id,
                fielder_id
            )
            VALUES
            (?,?,?,?,?,?,?,?,?,?,?)
        `, [

            innings_id,
            player_id,
            batting_position || null,
            runs || 0,
            balls || 0,
            fours || 0,
            sixes || 0,
            strike_rate || 0,
            how_out || null,
            bowler_id || null,
            fielder_id || null

        ]);

        return NextResponse.json({
            success: true,
            message: "Scorecard added successfully.",
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