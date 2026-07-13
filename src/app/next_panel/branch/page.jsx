"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Building2, Edit, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";

export default function BranchPage() {
    const { user: userInfo } = useAuth();
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState(null);

    const loadBranches = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/branch");
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to load branches.");
            setBranches(json.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBranches();
    }, []);

    const handleDelete = async (branch) => {
        if (!confirm(`Delete branch "${branch.branch_name}"?`)) return;

        setDeletingId(branch.id);
        setError(null);

        try {
            const res = await fetch(`/api/branch/${branch.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete branch.");
            setBranches((current) => current.filter((item) => item.id !== branch.id));
        } catch (err) {
            setError(err.message);
        } finally {
            setDeletingId(null);
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
                                    <Building2 size={24} />
                                    <h1 className="h4 mb-0">Branches</h1>
                                </div>
                                <p className="text-muted mb-0">Manage academy branch locations and contact details.</p>
                            </div>

                            {userInfo.permissions.includes("branches.create") && <Link href="/next_panel/branch/new" className="btn btn-primary fw-semibold">
                                <Plus size={16} className="me-2" /> New Branch
                            </Link>}
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-3">
                        {error && <div className="alert alert-danger">{error}</div>}

                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading branches...</div>
                        ) : branches.length === 0 ? (
                            <div className="text-center py-5 text-muted">No branches found yet.</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th scope="col">Branch</th>
                                            <th scope="col">Code</th>
                                            <th scope="col">Contact</th>
                                            <th scope="col">Location</th>
                                            <th scope="col">Status</th>
                                            <th scope="col" className="text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {branches.map((branch) => (
                                            <tr key={branch.id}>
                                                <td className="fw-semibold">{branch.branch_name}</td>
                                                <td>{branch.branch_code}</td>
                                                <td>
                                                    <div>{branch.contact_person || "No contact person"}</div>
                                                    <small className="text-muted">{branch.mobile || branch.email || "No contact info"}</small>
                                                </td>
                                                <td className="text-muted">
                                                    {[branch.city, branch.state].filter(Boolean).join(", ") || "No location"}
                                                </td>
                                                <td>
                                                    <span className={`badge ${branch.status === 1 ? "bg-success" : "bg-secondary"}`}>
                                                        {branch.status === 1 ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td className="text-end">
                                                    <div className="btn-group btn-group-sm" role="group">
                                                        <Link href={`/next_panel/branch/${branch.id}`} className="btn btn-outline-primary" aria-label="View branch">
                                                            <ArrowUpRight size={16} />
                                                        </Link>
                                                        {userInfo.permissions.includes("branches.edit") && <Link href={`/next_panel/branch/${branch.id}/edit`} className="btn btn-outline-secondary" aria-label="Edit branch">
                                                            <Edit size={16} />
                                                        </Link>}
                                                        {userInfo.permissions.includes("branches.delete") && <button
                                                            type="button"
                                                            className="btn btn-outline-danger"
                                                            onClick={() => handleDelete(branch)}
                                                            disabled={deletingId === branch.id}
                                                            aria-label="Delete branch"
                                                        >
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
