"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, LayoutList, Edit, Eye } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";

export default function MenusPage() {
    const { user: userInfo } = useAuth();
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadMenus() {
            try {
                const res = await fetch("/api/menus");
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || "Unable to load menus.");
                setMenus(json.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadMenus();
    }, []);

    return (
        <div className="container-fluid">
            <div className="row g-4">
                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                            <div>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <LayoutList size={24} />
                                    <h1 className="h4 mb-0">Menus</h1>
                                </div>
                                <p className="text-muted mb-0">Manage application menu structure and links.</p>
                            </div>
                            {userInfo.permissions.includes("menus.create") &&
                                <Link href="/next_panel/menus/new" className="btn btn-primary fw-semibold">
                                    <Plus size={16} className="me-2" /> New Menu
                                </Link>
                            }
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-3">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading menus...</div>
                        ) : error ? (
                            <div className="alert alert-danger">{error}</div>
                        ) : menus.length === 0 ? (
                            <div className="text-center py-5 text-muted">No menus found.</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th scope="col">Menu Name</th>
                                            <th scope="col">Parent</th>
                                            <th scope="col">URL</th>
                                            <th scope="col">Permission</th>
                                            <th scope="col">Sort</th>
                                            <th scope="col" className="text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {menus.map((menu) => (
                                            <tr key={menu.id}>
                                                <td className="fw-semibold">{menu.menu_name}</td>
                                                <td>{menu.parent_name || "—"}</td>
                                                <td className="text-muted">{menu.menu_url || "—"}</td>
                                                <td className="text-muted">{menu.permission_name || "—"}</td>
                                                <td>{menu.sort_order}</td>
                                                <td className="text-end">
                                                    <div className="btn-group btn-group-sm" role="group">
                                                        <Link href={`/next_panel/menus/${menu.id}`} className="btn btn-outline-primary">
                                                            <Eye size={16} />
                                                        </Link>
                                                        {userInfo.permissions.includes("menus.edit") && <Link href={`/next_panel/menus/${menu.id}/edit`} className="btn btn-outline-secondary">
                                                            <Edit size={16} />
                                                        </Link>}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
