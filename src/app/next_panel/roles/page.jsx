"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Shield, ArrowUpRight, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";

export default function RolesPage() {
    const { user: userInfo } = useAuth();
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadRoles() {
            try {
                const res = await fetch("/api/roles");
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || "Unable to load roles.");
                setRoles(json.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadRoles();
    }, []);

    return (
        <div className="container-fluid">
            <div className="row g-4">
                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                            <div>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <Shield size={24} />
                                    <h1 className="h4 mb-0">Roles</h1>
                                </div>
                                <p className="text-muted mb-0">Manage role definitions for your admin panel.</p>
                            </div>

                            {userInfo.permissions.includes("roles.create") && <Link href="/next_panel/roles/new" className="btn btn-primary fw-semibold">
                                <Plus size={16} className="me-2" /> New Role
                            </Link>}
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-3">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading roles...</div>
                        ) : error ? (
                            <div className="alert alert-danger">{error}</div>
                        ) : roles.length === 0 ? (
                            <div className="text-center py-5 text-muted">No roles found yet.</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th scope="col">Role Name</th>
                                            <th scope="col">Description</th>
                                            <th scope="col">Status</th>
                                            <th scope="col" className="text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {roles.map((role) => (
                                            <tr key={role.id}>
                                                <td className="fw-semibold">{role.role_name}</td>
                                                <td className="text-muted">{role.description || "—"}</td>
                                                <td>
                                                    <span className={`badge ${role.status === 1 ? "bg-success" : "bg-secondary"}`}>
                                                        {role.status === 1 ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td className="text-end">
                                                    <div className="btn-group btn-group-sm" role="group">
                                                        <Link href={`/next_panel/roles/${role.id}`} className="btn btn-outline-primary">
                                                            <ArrowUpRight size={16} />
                                                        </Link>
                                                        {userInfo.permissions.includes("roles.edit") && <Link href={`/next_panel/roles/${role.id}/edit`} className="btn btn-outline-secondary">
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
