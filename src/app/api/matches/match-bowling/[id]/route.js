import { NextResponse } from "next/server";
import pool from "@/components/lib/db";

// GET SINGLE BOWLING RECORD
// ==============================
export async function GET(request, { params }) {

    const connection = await pool.getConnection();

    try {

        const { id } = await params;

        const [rows] = await connection.query(`
            SELECT

                mb.*,

                mi.innings_no,

                mtp.user_id,

                mtp.player_id,

                CONCAT(u.first_name,' ',u.last_name) AS academy_player,

                op.name AS outside_player

            FROM cst_match_bowling mb

            LEFT JOIN cst_match_innings mi
                ON mi.id = mb.innings_id

            LEFT JOIN cst_match_team_players mtp
                ON mtp.id = mb.bowler_id

            LEFT JOIN cst_users u
                ON u.id = mtp.user_id

            LEFT JOIN cst_outside_player op
                ON op.id = mtp.player_id

            WHERE mb.id=?
        `, [id]);

        if (rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: "Bowling record not found."
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
// UPDATE BOWLING RECORD
// ==============================
export async function PUT(request, { params }) {

    const connection = await pool.getConnection();

    try {

        const { id } = await params;

        const {
            innings_id,
            bowler_id,
            overs,
            maidens,
            runs,
            wickets,
            wides,
            no_balls,
            economy
        } = await request.json();

        if (!innings_id || !bowler_id) {
            return NextResponse.json({
                success: false,
                message: "Innings and Bowler are required."
            }, { status: 400 });
        }

        const [exists] = await connection.query(
            `
            SELECT id
            FROM cst_match_bowling
            WHERE innings_id=? AND bowler_id=? AND id<>?
            `,
            [
                innings_id,
                bowler_id,
                id
            ]
        );

        if (exists.length > 0) {
            return NextResponse.json({
                success: false,
                message: "Bowling record already exists."
            }, { status: 409 });
        }

        const [result] = await connection.query(
            `
            UPDATE cst_match_bowling
            SET
                innings_id=?,
                bowler_id=?,
                overs=?,
                maidens=?,
                runs=?,
                wickets=?,
                wides=?,
                no_balls=?,
                economy=?
            WHERE id=?
            `,
            [
                innings_id,
                bowler_id,
                overs || 0,
                maidens || 0,
                runs || 0,
                wickets || 0,
                wides || 0,
                no_balls || 0,
                economy || 0,
                id
            ]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json({
                success: false,
                message: "Bowling record not found."
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "Bowling record updated successfully."
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
// DELETE BOWLING RECORD
// ==============================
export async function DELETE(request, { params }) {

    const connection = await pool.getConnection();

    try {

        const { id } = await params;

        const [result] = await connection.query(
            "DELETE FROM cst_match_bowling WHERE id=?",
            [id]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json({
                success: false,
                message: "Bowling record not found."
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "Bowling record deleted successfully."
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