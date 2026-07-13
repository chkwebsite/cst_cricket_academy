import { NextResponse } from "next/server";
import pool from "@/components/lib/db";

export async function GET() {
    try {
        const [rows] = await pool.query(`
      SELECT
        id,
        parent_id,
        menu_name,
        menu_icon,
        menu_url,
        sort_order,
        permission_name,
        status
      FROM cst_menu
      WHERE status = 1
      ORDER BY sort_order ASC, id ASC
    `);

        // Create a map of all menus
        const menuMap = {};

        rows.forEach((menu) => {
            menuMap[menu.id] = {
                ...menu,
                children: [],
            };
        });

        const tree = [];

        rows.forEach((menu) => {
            if (menu.parent_id === null) {
                tree.push(menuMap[menu.id]);
            } else if (menuMap[menu.parent_id]) {
                menuMap[menu.parent_id].children.push(menuMap[menu.id]);
            }
        });

        return NextResponse.json({
            success: true,
            data: tree,
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