import { NextResponse } from "next/server";
import pool from "@/components/lib/db";

// GET : All Profiles
// ==============================
export async function GET() {
    try {

        const [rows] = await pool.query(`
            SELECT cp.*, 
            u.first_name,
            u.last_name,
            u.email,
            u.mobile,
            u.profile_image,
            b.branch_name
            FROM cst_profile cp
            LEFT JOIN cst_users u
            ON u.id = cp.user_id
            LEFT JOIN cst_branch b
            ON b.id = cp.branch_id
            WHERE cp.is_deleted = 0
            ORDER BY cp.id DESC
        `);

        return NextResponse.json({
            success: true,
            data: rows
        });

    } catch (error) {

        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: error.message
            },
            {
                status: 500
            }
        );
    }
}

// ==============================
// POST : Add Profile
// ==============================
export async function POST(req) {

    try {

        const body = await req.json();

        const {
            user_id,
            visiting_coaches,
            branch_id,
            title,
            designation,
            sub_designation,
            about_me,
            description,
            experience,
            qualification,
            specialization,
            achievements,
            date_of_joining,
            facebook_url,
            instagram_url,
            linkedin_url,
            twitter_url,
            youtube_url,
            website_url,
            display_order,
            status,
            is_deleted
        } = body;

        // Validation
        if (!user_id || !branch_id || !title) {

            return NextResponse.json(
                {
                    success: false,
                    message: "User id, Branch and Title are required."
                },
                {
                    status: 400
                }
            );

        }

        // Duplicate Check
        const [exist] = await pool.query(
            `
            SELECT id
            FROM cst_profile
            WHERE
            (
                user_id = ?
                OR title = ?
            )
            AND is_deleted = 0
            `,
            [
                user_id,
                title
            ]
        );

        if (exist.length > 0) {

            return NextResponse.json(
                {
                    success: false,
                    message: "Profile already exists."
                },
                {
                    status: 409
                }
            );

        }

        // Insert
        const [result] = await pool.query(
            `
            INSERT INTO cst_profile
            (
                user_id,
                visiting_coaches,
                branch_id,
                title,
                designation,
                sub_designation,
                about_me,
                description,
                experience,
                qualification,
                specialization,
                achievements,
                date_of_joining,
                facebook_url,
                instagram_url,
                linkedin_url,
                twitter_url,
                youtube_url,
                website_url,
                display_order,
                status,
                is_deleted
            )
            VALUES
            (
                ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
            )
            `,
            [
                user_id,
                visiting_coaches ?? null,
                branch_id ?? null,
                title,
                designation ?? null,
                sub_designation ?? null,
                about_me ?? null,
                description ?? null,
                experience ?? null,
                qualification ?? null,
                specialization ?? null,
                achievements ?? null,
                date_of_joining ?? null,
                facebook_url ?? null,
                instagram_url ?? null,
                linkedin_url ?? null,
                twitter_url ?? null,
                youtube_url ?? null,
                website_url ?? null,
                display_order ?? 0,
                status ?? 1,
                is_deleted ?? 0
            ]
        );

        return NextResponse.json({
            success: true,
            message: "Profile added successfully.",
            id: result.insertId
        });

    } catch (error) {

        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: error.message
            },
            {
                status: 500
            }
        );

    }

}
