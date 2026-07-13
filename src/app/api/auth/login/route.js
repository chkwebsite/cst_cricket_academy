import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "@/components/lib/db";

export async function POST(req) {
    try {
        const body = await req.json();
        const { email, password } = body;
        if (!email || !password) {
            return NextResponse.json({
                success: false,
                message: "Email and password are required"
            }, { status: 400 })
        }
        const [rows] = await pool.query(`
        SELECT
        u.id,
            u.role_id,
            u.first_name,
            u.last_name,
            u.email,
            u.password,
            u.status,
            u.profile_image,
            r.role_name
      FROM cst_users u
      LEFT JOIN cst_role r
      ON r.id = u.role_id
      WHERE u.email = ?
            LIMIT 1`,
            [email]);

        if (rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: "Invalid email or password"
            }, { status: 401 })
        }
        const user = rows[0];
        const activeStatuses = ["active", 1, "1", true, "true"];
        if (!activeStatuses.includes(user.status)) {
            return NextResponse.json({
                success: false,
                message: "Your account is not active. Please contact admin."
            }, { status: 403 })
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({
                success: false,
                message: "Invalid email or password",
            }, { status: 401 })
        }



        await pool.query(`UPDATE cst_users SET last_login = now() WHERE id = ?`, [user.id]);

        const token = jwt.sign(
            {
                id: user.id,
                role_id: user.role_id,
                role_name: user.role_name,
                email: user.email,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        const [permissionRows] = await pool.query(`
        SELECT p.permission_name
        FROM cst_role_permission rp
        JOIN cst_permission p
        ON p.id = rp.permission_id
        WHERE rp.role_id = ?;
        `, [user.role_id]);
        const permissions = (permissionRows || []).map((p) => p.permission_name);
        const safeUser = { ...user, permissions };
        delete safeUser.password;

        const response = NextResponse.json({
            success: true,
            message: "Login successful.",
            token,
            user: safeUser,
            //permissions,
        });

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        });

        return response;
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong",
                error: error.message,
            },
            { status: 500 }
        );
    }
}
