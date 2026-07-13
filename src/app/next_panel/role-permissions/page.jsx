"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Layers, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";

export default function RolePermissionsPage() {
    const { user: userInfo } = useAuth();
    const [items, setItems] = useState([]);
    const [roles, setRoles] = useState([]);
    const [modules, setModules] = useState([]);
    const [selectedRoleFilter, setSelectedRoleFilter] = useState("");
    const [selectedModuleFilter, setSelectedModuleFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadFilters() {
            try {
                const [rolesRes, permissionsRes] = await Promise.all([
                    fetch("/api/roles"),
                    fetch("/api/permissions"),
                ]);
                const [rolesJson, permissionsJson] = await Promise.all([rolesRes.json(), permissionsRes.json()]);
                if (!rolesRes.ok) throw new Error(rolesJson.message || "Unable to load roles.");
                if (!permissionsRes.ok) throw new Error(permissionsJson.message || "Unable to load permissions.");
                setRoles(rolesJson.data || []);
                const moduleNames = Array.from(new Set((permissionsJson.data || []).map((permission) => permission.module_name).filter(Boolean)));
                setModules(moduleNames.sort());
            } catch (err) {
                setError(err.message);
            }
        }

        loadFilters();
    }, []);

    useEffect(() => {
        async function loadItems() {
            setLoading(true);
            try {
                const query = [];
                if (selectedRoleFilter) query.push(`role_id=${encodeURIComponent(selectedRoleFilter)}`);
                if (selectedModuleFilter) query.push(`module_name=${encodeURIComponent(selectedModuleFilter)}`);
                const url = `/api/role-permissions${query.length ? `?${query.join("&")}` : ""}`;
                const res = await fetch(url);
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || "Unable to load role permissions.");
                setItems(json.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadItems();
    }, [selectedRoleFilter, selectedModuleFilter]);

    const handleDelete = async (id) => {
        if (!confirm("Remove this permission from role?")) return;
        try {
            const res = await fetch(`/api/role-permissions/${id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to remove assignment.");
            setItems((prev) => prev.filter((item) => item.id !== id));
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
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <Layers size={24} />
                                    <h1 className="h4 mb-0">Role Permissions</h1>
                                </div>
                                <p className="text-muted mb-0">Manage role to permission assignments.</p>
                            </div>
                            {userInfo.permissions.includes("role-permissions.create") && <Link href="/next_panel/role-permissions/new" className="btn btn-primary fw-semibold">
                                <Plus size={16} className="me-2" /> Assign Permissions
                            </Link>}
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-3">
                        <div className="row g-3 mb-4">
                            <div className="col-md-4">
                                <label className="form-label">Filter by role</label>
                                <select
                                    className="form-select"
                                    value={selectedRoleFilter}
                                    onChange={(e) => setSelectedRoleFilter(e.target.value)}
                                >
                                    <option value="">All roles</option>
                                    {roles.map((role) => (
                                        <option key={role.id} value={role.id}>{role.role_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Filter by module</label>
                                <select
                                    className="form-select"
                                    value={selectedModuleFilter}
                                    onChange={(e) => setSelectedModuleFilter(e.target.value)}
                                >
                                    <option value="">All modules</option>
                                    {modules.map((moduleName) => (
                                        <option key={moduleName} value={moduleName}>{moduleName}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-4 d-flex align-items-end">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary w-100"
                                    onClick={() => {
                                        setSelectedRoleFilter("");
                                        setSelectedModuleFilter("");
                                    }}
                                >
                                    Clear filters
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading assignments...</div>
                        ) : error ? (
                            <div className="alert alert-danger">{error}</div>
                        ) : items.length === 0 ? (
                            <div className="text-center py-5 text-muted">No role-permission assignments found.</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th scope="col">Role</th>
                                            <th scope="col">Permission</th>
                                            <th scope="col">Module</th>
                                            <th scope="col" className="text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item) => (
                                            <tr key={item.id}>
                                                <td className="fw-semibold">{item.role_name}</td>
                                                <td>{item.permission_name}</td>
                                                <td className="text-muted">{item.module_name}</td>
                                                <td className="text-end">
                                                    <div className="btn-group btn-group-sm" role="group">
                                                        {userInfo.permissions.includes("role-permissions.edit") && <Link href={`/next_panel/role-permissions/${item.role_id}`} className="btn btn-outline-primary">
                                                            <Edit size={16} />
                                                        </Link>}
                                                        {userInfo.permissions.includes("role-permissions.delete") && <button type="button" className="btn btn-outline-danger" onClick={() => handleDelete(item.id)}>
                                                            <Trash2 size={16} />
                                                        </button>}
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
