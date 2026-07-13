import { NextResponse } from "next/server";
import pool from "@/components/lib/db";

// GET : Single Profile
// ==============================
export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const [rows] = await pool.query(
            `
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
            WHERE cp.id = ?
            AND cp.is_deleted = 0
            LIMIT 1
            `,
            [id]
        );

        if (rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Profile not found."
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: rows[0]
        });

    } catch (error) {

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
// PUT : Update Profile
// ==============================
export async function PUT(request, { params }) {

    try {

        const { id } = await params;

        const body = await request.json();

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
        } = body;

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
            AND id <> ?
            AND is_deleted = 0
            `,
            [
                user_id,
                title,
                id
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

        const [result] = await pool.query(
            `
            UPDATE cst_profile
            SET
                user_id=?,
                visiting_coaches=?,
                branch_id=?,
                title=?,
                designation=?,
                sub_designation=?,
                about_me=?,
                description=?,
                experience=?,
                qualification=?,
                specialization=?,
                achievements=?,
                date_of_joining=?,
                facebook_url=?,
                instagram_url=?,
                linkedin_url=?,
                twitter_url=?,
                youtube_url=?,
                website_url=?,
                display_order=?,
                status=?
            WHERE id = ?
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
                id
            ]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Profile not found."
                },
                {
                    status: 404
                }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Profile updated successfully."
        });

    } catch (error) {

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
// DELETE : Soft Delete
// ==============================
export async function DELETE(request, { params }) {

    try {

        const { id } = await params;

        const [result] = await pool.query(
            `
            UPDATE cst_profile
            SET is_deleted = 1
            WHERE id = ?
            `,
            [id]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Profile not found."
                },
                {
                    status: 404
                }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Profile deleted successfully."
        });

    } catch (error) {

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
