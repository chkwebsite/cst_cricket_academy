import { NextResponse } from "next/server";
import pool from "@/components/lib/db";
import bcrypt from "bcryptjs";
import fs from 'fs';
import path from "path";

export async function POST(req) {
    try {
        const formData = await req.formData()
        const role_id = formData.get("role_id");
        const branch_id = formData.get("branch_id");
        const first_name = formData.get("first_name");
        const last_name = formData.get("last_name");
        const username = formData.get("username");
        const email = formData.get("email");
        const mobile = formData.get("mobile");
        const password = formData.get("password");
        const gender = formData.get("gender");
        const date_of_birth = formData.get("date_of_birth");
        const address = formData.get("address");
        const city = formData.get("city");
        const state = formData.get("state");
        const pincode = formData.get("pincode");
        const profile_image = formData.get("profile_image");



        // Validation
        if (!role_id || !first_name || !email || !password) {
            return NextResponse.json({
                success: false,
                message: "Required fields are missing."
            },
                {
                    status: 400,
                })
        }

        // Check Email
        const [emails] = await pool.query("SELECT id FROM cst_users WHERE email = ?", [email]);
        if (emails.length > 0) {
            return NextResponse.json({
                success: false,
                message: "Email already exists.",
            },
                {
                    status: 409,
                })
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10)

        let imagePath = null;
        if (profile_image && typeof profile_image === "object" && profile_image.size > 0) {
            const bytes = await profile_image.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const uploadDir = path.join(process.cwd(), "public/images/uploads/users");
            if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

            const ext = (profile_image.name || "").split(".").pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
            const filePath = path.join(uploadDir, fileName);
            fs.writeFileSync(filePath, buffer);
            imagePath = `/images/uploads/users/${fileName}`;
        }

        const [result] = await pool.query(
            ` INSERT INTO cst_users (role_id,branch_id,first_name,last_name,username,email,mobile,password,gender,date_of_birth,address,city,state,pincode,profile_image) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [role_id, branch_id, first_name, last_name, username, email, mobile, hashedPassword, gender, date_of_birth, address, city, state, pincode, imagePath]
        );
        return NextResponse.json({
            success: true,
            message: "User registered successfully",
            userId: result.insertId,
            profile_image: imagePath
        }, { status: 200 })
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Something went wrong",
            error: error.message,
        },
            { status: 500 }
        )
    }
}