import { NextResponse } from "next/server";
import pool from "@/components/lib/db";

// GET ALL ROLE PERMISSIONS
// =======================
export async function GET(request) {
    try {
        const url = new URL(request.url);
        const roleId = url.searchParams.get("role_id");
        const moduleName = url.searchParams.get("module_name");

        let query = `
      SELECT
        rp.id,
        rp.role_id,
        r.role_name,
        rp.permission_id,
        p.permission_name,
        p.module_name
      FROM cst_role_permission rp
      INNER JOIN cst_role r ON rp.role_id = r.id
      INNER JOIN cst_permission p ON rp.permission_id = p.id
      WHERE 1=1
    `;
        const params = [];

        if (roleId) {
            query += " AND rp.role_id = ?";
            params.push(roleId);
        }

        if (moduleName) {
            query += " AND p.module_name = ?";
            params.push(moduleName);
        }

        query += " ORDER BY r.role_name, p.module_name";

        const [rows] = await pool.query(query, params);

        return NextResponse.json({
            success: true,
            data: rows,
        });

    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: error.message,
            },
            { status: 500 }
        );
    }
}

// =======================
// ASSIGN PERMISSIONS
// =======================
export async function POST(req) {
    const connection = await pool.getConnection();

    try {
        const body = await req.json();

        const { role_id, permission_ids } = body;

        if (!role_id || !Array.isArray(permission_ids)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "role_id and permission_ids are required.",
                },
                { status: 400 }
            );
        }

        await connection.beginTransaction();

        for (const permissionId of permission_ids) {
            await connection.query(
                `
        INSERT IGNORE INTO cst_role_permission
        (role_id, permission_id)
        VALUES (?, ?)
        `,
                [role_id, permissionId]
            );
        }

        await connection.commit();

        return NextResponse.json({
            success: true,
            message: "Permissions assigned successfully.",
        });

    } catch (error) {
        await connection.rollback();

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