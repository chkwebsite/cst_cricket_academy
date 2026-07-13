"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";

export default function RoleDetailPage() {
    const { user: userInfo } = useAuth();
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();
    const params = useParams();
    // alert(params);
    useEffect(() => {
        async function loadRole() {
            try {
                const res = await fetch(`/api/roles/${params.id}`);
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || "Unable to load role.");
                setRole(json.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadRole();
    }, [params.id]);

    const handleDelete = async () => {
        if (!confirm("Delete this role?")) return;
        try {
            const res = await fetch(`/api/roles/${params.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Delete failed.");
            router.push("/next_panel/roles");
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
                                <Link href="/next_panel/roles" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Roles
                                </Link>
                                <h1 className="h4 mb-2">Role details</h1>
                                <p className="text-muted mb-0">View and manage this role.</p>
                            </div>
                            <div className="d-flex gap-2">
                                {userInfo.permissions.includes("roles.edit") && <Link href={`/next_panel/roles/${params.id}/edit`} className="btn btn-primary">
                                    <Edit size={16} className="me-2" /> Edit
                                </Link>}
                                {userInfo.permissions.includes("roles.delete") && <button className="btn btn-outline-danger" onClick={handleDelete}>
                                    <Trash2 size={16} className="me-2" /> Delete
                                </button>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading role details...</div>
                        ) : error ? (
                            <div className="alert alert-danger">{error}</div>
                        ) : (
                            <div className="row gy-3">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <h5 className="mb-1">Role Name</h5>
                                        <p className="mb-0">{role.role_name}</p>
                                    </div>
                                    <div className="mb-3">
                                        <h5 className="mb-1">Status</h5>
                                        <span className={`badge ${role.status === 1 ? "bg-success" : "bg-secondary"}`}>
                                            {role.status === 1 ? "Active" : "Inactive"}
                                        </span>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <h5 className="mb-1">Description</h5>
                                        <p className="mb-0 text-muted">{role.description || "No description provided."}</p>
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
