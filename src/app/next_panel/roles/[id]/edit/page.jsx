"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

export default function EditRolePage() {
    const [roleName, setRoleName] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState(1);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();
    const params = useParams();
    useEffect(() => {
        async function loadRole() {
            try {
                const res = await fetch(`/api/roles/${params.id}`);
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || "Unable to load role.");
                const role = json.data;
                setRoleName(role.role_name || "");
                setDescription(role.description || "");
                setStatus(role.status ?? 1);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadRole();
    }, [params.id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const res = await fetch(`/api/roles/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role_name: roleName, description, status }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to update role.");
            router.push(`/next_panel/roles/${params.id}`);
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
                                <Link href="/next_panel/roles" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Roles
                                </Link>
                                <h1 className="h4 mb-2">Edit Role</h1>
                                <p className="text-muted mb-0">Update the role settings.</p>
                            </div>
                            <button className="btn btn-primary" type="submit" form="roleEditForm">
                                {saving ? <Loader2 size={16} className="me-2 spin" /> : <Save size={16} className="me-2" />} Save Changes
                            </button>
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
                            <form id="roleEditForm" onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Role Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={roleName}
                                        onChange={(e) => setRoleName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-control"
                                        rows={4}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Status</label>
                                    <select className="form-select" value={status} onChange={(e) => setStatus(Number(e.target.value))}>
                                        <option value={1}>Active</option>
                                        <option value={0}>Inactive</option>
                                    </select>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
