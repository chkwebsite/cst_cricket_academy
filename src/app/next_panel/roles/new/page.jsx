"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

export default function NewRolePage() {
    const [roleName, setRoleName] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const res = await fetch("/api/roles", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    role_name: roleName,
                    description,
                    status,
                }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to create role.");
            setSuccess("Role created successfully.");
            router.push("/next_panel/roles");
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
                                <Link href="/next_panel/roles" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Roles
                                </Link>
                                <h1 className="h4 mb-2">Create New Role</h1>
                                <p className="text-muted mb-0">Add a new role for your cricket academy panel.</p>
                            </div>
                            <div>
                                <button className="btn btn-primary" type="submit" form="roleForm">
                                    <Plus size={16} className="me-2" /> Save Role
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        <form id="roleForm" onSubmit={handleSubmit}>
                            {error && <div className="alert alert-danger">{error}</div>}
                            {success && <div className="alert alert-success">{success}</div>}

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
                    </div>
                </div>
            </div>
        </div>
    );
}
