import { NextResponse } from "next/server";
import pool from "@/components/lib/db";

// GET ALL MENUS
// =======================
export async function GET(request) {
    try {
        const url = new URL(request.url);
        const roleId = url.searchParams.get("role_id");

        const [rows] = await pool.query(`
      SELECT
        m.*,
        p.menu_name AS parent_name
      FROM cst_menu m
      LEFT JOIN cst_menu p
        ON m.parent_id = p.id
      ORDER BY m.sort_order ASC, m.id ASC
    `);

        if (roleId && Number(roleId) !== 7) {
            const [permissions] = await pool.query(
                `SELECT p.permission_name FROM cst_role_permission rp
                 INNER JOIN cst_permission p ON rp.permission_id = p.id
                 WHERE rp.role_id = ?`,
                [roleId]
            );

            const allowedPermissions = new Set((permissions || []).map((p) => p.permission_name));

            const rowMap = {};
            rows.forEach((row) => {
                rowMap[row.id] = row;
            });

            const allowedRows = rows.filter(
                (row) => !row.permission_name || allowedPermissions.has(row.permission_name)
            );

            const allowedIds = new Set(allowedRows.map((row) => row.id));
            allowedRows.forEach((row) => {
                let parentId = row.parent_id;
                while (parentId && rowMap[parentId] && !allowedIds.has(parentId)) {
                    const parent = rowMap[parentId];
                    if (parent.permission_name && !allowedPermissions.has(parent.permission_name)) {
                        break;
                    }
                    allowedIds.add(parentId);
                    parentId = parent.parent_id;
                }
            });

            const filteredRows = rows.filter((row) => allowedIds.has(row.id));

            return NextResponse.json({
                success: true,
                data: filteredRows,
            });
        }

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
// ADD MENU
// =======================
export async function POST(req) {

    try {

        const body = await req.json();

        const {
            parent_id,
            menu_name,
            menu_icon,
            menu_url,
            sort_order,
            permission_name,
            status,
        } = body;

        if (!menu_name) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Menu Name is required.",
                },
                { status: 400 }
            );
        }

        const [result] = await pool.query(
            `INSERT INTO cst_menu
      (
        parent_id,
        menu_name,
        menu_icon,
        menu_url,
        sort_order,
        permission_name,
        status
      )
      VALUES (?,?,?,?,?,?,?)`,
            [
                parent_id || null,
                menu_name,
                menu_icon || "",
                menu_url || "",
                sort_order || 0,
                permission_name || "",
                status ?? 1,
            ]
        );

        return NextResponse.json({
            success: true,
            message: "Menu created successfully.",
            id: result.insertId,
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