"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";

export default function MenuDetailPage() {
    const { user: userInfo } = useAuth();
    const [menu, setMenu] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();
    const params = useParams();
    useEffect(() => {
        async function loadMenu() {
            try {
                const res = await fetch(`/api/menus/${params.id}`);
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || "Unable to load menu.");
                setMenu(json.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadMenu();
    }, [params.id]);

    const handleDelete = async () => {
        if (!confirm("Delete this menu?")) return;
        try {
            const res = await fetch(`/api/menus/${params.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Delete failed.");
            router.push("/next_panel/menus");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="container-fluid">
            <div className="row g-4">
                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                            <div>
                                <Link href="/next_panel/menus" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Menus
                                </Link>
                                <h1 className="h4 mb-2">Menu details</h1>
                                <p className="text-muted mb-0">View or edit this menu item.</p>
                            </div>
                            <div className="d-flex gap-2">
                                {userInfo.permissions.includes("menus.edit") &&
                                    <Link href={`/next_panel/menus/${params.id}/edit`} className="btn btn-primary">
                                        <Edit size={16} className="me-2" /> Edit
                                    </Link>
                                }
                                {userInfo.permissions.includes("menus.delete") &&
                                    <button className="btn btn-outline-danger" onClick={handleDelete}>
                                        <Trash2 size={16} className="me-2" /> Delete
                                    </button>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading menu details...</div>
                        ) : error ? (
                            <div className="alert alert-danger">{error}</div>
                        ) : (
                            <div className="row gy-3">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <h5 className="mb-1">Menu Name</h5>
                                        <p className="mb-0">{menu.menu_name}</p>
                                    </div>
                                    <div className="mb-3">
                                        <h5 className="mb-1">Menu Icon</h5>
                                        <p className="mb-0">{menu.menu_icon || "—"}</p>
                                    </div>
                                    <div className="mb-3">
                                        <h5 className="mb-1">Menu URL</h5>
                                        <p className="mb-0">{menu.menu_url || "—"}</p>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <h5 className="mb-1">Parent ID</h5>
                                        <p className="mb-0">{menu.parent_id || "None"}</p>
                                    </div>
                                    <div className="mb-3">
                                        <h5 className="mb-1">Permission Name</h5>
                                        <p className="mb-0">{menu.permission_name || "—"}</p>
                                    </div>
                                    <div className="mb-3">
                                        <h5 className="mb-1">Sort Order</h5>
                                        <p className="mb-0">{menu.sort_order}</p>
                                    </div>
                                    <div className="mb-3">
                                        <h5 className="mb-1">Status</h5>
                                        <span className={`badge ${menu.status === 1 ? "bg-success" : "bg-secondary"}`}>
                                            {menu.status === 1 ? "Active" : "Inactive"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
