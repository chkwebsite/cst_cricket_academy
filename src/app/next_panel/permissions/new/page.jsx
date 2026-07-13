"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

export default function NewPermissionPage() {
    const [permissionName, setPermissionName] = useState("");
    const [moduleName, setModuleName] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/permissions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    permission_name: permissionName,
                    module_name: moduleName,
                    description,
                    status,
                }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to create permission.");
            router.push("/next_panel/permissions");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid">
            <div className="row g-4">
                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                            <div>
                                <Link href="/next_panel/permissions" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Permissions
                                </Link>
                                <h1 className="h4 mb-2">Create Permission</h1>
                                <p className="text-muted mb-0">Add a new permission.</p>
                            </div>
                            <button className="btn btn-primary" type="submit" form="permissionForm">
                                <Plus size={16} className="me-2" /> Save Permission
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        <form id="permissionForm" onSubmit={handleSubmit}>
                            {error && <div className="alert alert-danger">{error}</div>}

                            <div className="mb-3">
                                <label className="form-label">Permission Name</label>
                                <input
                                    className="form-control"
                                    value={permissionName}
                                    onChange={(e) => setPermissionName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Module Name</label>
                                <input
                                    className="form-control"
                                    value={moduleName}
                                    onChange={(e) => setModuleName(e.target.value)}
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
                    </div>
                </div>
            </div>
        </div>
    );
}
