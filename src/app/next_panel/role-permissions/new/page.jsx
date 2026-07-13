"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

export default function NewRolePermissionsPage() {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [selectedRole, setSelectedRole] = useState("");
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        async function loadData() {
            try {
                const [rolesRes, permissionsRes] = await Promise.all([
                    fetch("/api/roles"),
                    fetch("/api/permissions"),
                ]);
                const [rolesJson, permissionsJson] = await Promise.all([rolesRes.json(), permissionsRes.json()]);
                if (!rolesRes.ok) throw new Error(rolesJson.message || "Unable to load roles.");
                if (!permissionsRes.ok) throw new Error(permissionsJson.message || "Unable to load permissions.");
                setRoles(rolesJson.data || []);
                setPermissions(permissionsJson.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    const togglePermission = (id) => {
        setSelectedPermissions((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const res = await fetch("/api/role-permissions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role_id: Number(selectedRole), permission_ids: selectedPermissions }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to assign permissions.");
            router.push("/next_panel/role-permissions");
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container-fluid">
            <div className="row g-4">
                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                            <div>
                                <Link href="/next_panel/role-permissions" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Assignments
                                </Link>
                                <h1 className="h4 mb-2">Assign Permissions</h1>
                                <p className="text-muted mb-0">Grant multiple permissions to a role.</p>
                            </div>
                            <button className="btn btn-primary" form="assignForm" type="submit" disabled={saving || loading}>
                                <Plus size={16} className="me-2" /> {saving ? "Saving..." : "Assign"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading roles and permissions...</div>
                        ) : error ? (
                            <div className="alert alert-danger">{error}</div>
                        ) : (
                            <form id="assignForm" onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Role</label>
                                    <select
                                        className="form-select"
                                        value={selectedRole}
                                        onChange={(e) => setSelectedRole(e.target.value)}
                                        required
                                    >
                                        <option value="">Select a role</option>
                                        {roles.map((role) => (
                                            <option key={role.id} value={role.id}>{role.role_name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Permissions</label>
                                    <div className="row g-2">
                                        {permissions.map((permission) => (
                                            <div key={permission.id} className="col-md-6">
                                                <button
                                                    type="button"
                                                    className={`btn w-100 text-start ${selectedPermissions.includes(permission.id) ? "btn-primary" : "btn-outline-secondary"}`}
                                                    onClick={() => togglePermission(permission.id)}
                                                >
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <div className="fw-semibold">{permission.permission_name}</div>
                                                            <small className="text-muted">{permission.module_name}</small>
                                                        </div>
                                                        <span>{selectedPermissions.includes(permission.id) ? "✓" : ""}</span>
                                                    </div>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
