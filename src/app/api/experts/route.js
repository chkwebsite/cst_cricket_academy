import { NextResponse } from "next/server";
import pool from "@/components/lib/db";
import fs from 'fs';
import path from "path";


//All Get
export async function GET() {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query(`
            SELECT *
            FROM cst_experts
            WHERE is_deleted = 0
            ORDER BY id DESC
        `);

        return NextResponse.json({
            success: true,
            data: rows
        });

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });
    }finally{
        connection.release();
    }
}

//POST

export async function POST(req) {
    const connection = await pool.getConnection();
    try {
        const formData = await req.formData();

        const branch_id = formData.get("branch_id");
        const expert_name = formData.get("expert_name");
        const designation = formData.get("designation");
        const about = formData.get("about");
        const status = formData.get("status") || 1;

        const image = formData.get("profile_image");

        if (!expert_name || !designation){
            return NextResponse.json({
                success:false,
                message:"Expert name and Designation aes required..."
            },{status:400})
        }

        // Duplicate Check

        const [exist] = await connection.query(`
            SELECT id FROM cst_experts WHERE expert_name = ? AND designation = ? 
            AND is_deleted = 0
            `, [expert_name, designation]);

        if(exist.length >0){
            return NextResponse.json({
                success:false,
                message:"Experts already exists..."
            },{status:409})
        }

        let imagePath = null;
        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
        ];

        if (image && image.size > 0) {

            if (!allowedTypes.includes(image.type)) {
                return NextResponse.json({
                    success: false,
                    message: "Only JPG, PNG and WEBP images are allowed."
                }, { status: 400 });
            }

            if (image.size > 2 * 1024 * 1024) {
                return NextResponse.json({
                    success: false,
                    message: "Image size must be less than 2 MB."
                }, { status: 400 });
            }
        }

    if (image && typeof image === "object" && image.size > 0) {
                const bytes = await image.arrayBuffer();
                const buffer = Buffer.from(bytes);
                const uploadDir = path.join(process.cwd(), "public/images/uploads/experts");
                if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    
                const ext = image.name.split(".").pop().toLowerCase();
                const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
                const filePath = path.join(uploadDir, fileName);
                fs.writeFileSync(filePath, buffer);
                imagePath = `/images/uploads/experts/${fileName}`;
    }

        const [result] = await connection.query(
            `INSERT INTO cst_experts
    (branch_id, expert_name, designation, profile_image, about, status)
    VALUES (?, ?, ?, ?, ?, ?)`,
            [
                branch_id,
                expert_name,
                designation,
                imagePath,
                about,
                status || 1
            ]
        );

        return NextResponse.json({
            success: true,
            message: "Expert Added Successfully",
            id: result.insertId
        });


    } catch (error) {
        console.log(error);

        return NextResponse.json({
            success: false,
            message: error.message
        }, {
            status: 500
        });
    }finally{
        connection.release();
    }
}