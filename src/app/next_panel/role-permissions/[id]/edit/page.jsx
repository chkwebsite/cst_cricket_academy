"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

export default function EditRolePermissionsPage() {
    const [permissions, setPermissions] = useState([]);
    const [assigned, setAssigned] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();
    const params = useParams();
    useEffect(() => {
        async function loadData() {
            try {
                const [permissionsRes, assignedRes] = await Promise.all([
                    fetch("/api/permissions"),
                    fetch(`/api/role-permissions/${params.id}`),
                ]);
                const [permissionsJson, assignedJson] = await Promise.all([permissionsRes.json(), assignedRes.json()]);
                if (!permissionsRes.ok) throw new Error(permissionsJson.message || "Unable to load permissions.");
                if (!assignedRes.ok) throw new Error(assignedJson.message || "Unable to load assigned permissions.");
                setPermissions(permissionsJson.data || []);
                setAssigned((assignedJson.data || []).map((item) => item.permission_id));
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [params.id]);

    const togglePermission = (id) => {
        setAssigned((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const res = await fetch(`/api/role-permissions/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ permission_ids: assigned }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to update role permissions.");
            router.push(`/next_panel/role-permissions/${params.id}`);
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
                                <h1 className="h4 mb-2">Edit Role Permissions</h1>
                                <p className="text-muted mb-0">Update the assigned permissions for this role.</p>
                            </div>
                            <button className="btn btn-primary" form="editRolePermissionsForm" type="submit" disabled={saving || loading}>
                                {saving ? <Loader2 size={16} className="me-2 spin" /> : <Save size={16} className="me-2" />} Save Changes
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading permissions...</div>
                        ) : error ? (
                            <div className="alert alert-danger">{error}</div>
                        ) : (
                            <form id="editRolePermissionsForm" onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Permissions</label>
                                    <div className="row g-2">
                                        {permissions.map((permission) => (
                                            <div key={permission.id} className="col-md-6">
                                                <button
                                                    type="button"
                                                    className={`btn w-100 text-start ${assigned.includes(permission.id) ? "btn-primary" : "btn-outline-secondary"}`}
                                                    onClick={() => togglePermission(permission.id)}
                                                >
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <div className="fw-semibold">{permission.permission_name}</div>
                                                            <small className="text-muted">{permission.module_name}</small>
                                                        </div>
                                                        <span>{assigned.includes(permission.id) ? "✓" : ""}</span>
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
