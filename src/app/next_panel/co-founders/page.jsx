"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Edit, Plus, Trash2, UserRoundCheck } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";



export default function CoFoundersPage() {
    const { user } = useAuth();
    const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
    const hasPermission = (permission) => {
        if (Number(user?.role_id) === 1 || Number(user?.role_id) === 7) return true;
        return permissions.includes(permission);
    };
    const [coFounders, setCoFounders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadCoFounders() {
            try {
                const res = await fetch("/api/co-founders");
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || "Unable to load co-founders.");
                setCoFounders(json.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadCoFounders();
    }, []);

    const handleDelete = async (coFounder) => {
        if (!confirm(`Delete co-founder "${coFounder.name}"?`)) return;

        setDeletingId(coFounder.id);
        setError(null);

        try {
            const res = await fetch(`/api/co-founders/${coFounder.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete co-founder.");
            setCoFounders((current) => current.filter((item) => item.id !== coFounder.id));
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
                                    <UserRoundCheck size={24} />
                                    <h1 className="h4 mb-0">Co-Founders</h1>
                                </div>
                                <p className="text-muted mb-0">Manage leadership profiles shown across the academy.</p>
                            </div>
                            {hasPermission("co_founders.create") &&
                                <Link href="/next_panel/co-founders/new" className="btn btn-primary fw-semibold">
                                    <Plus size={16} className="me-2" /> New Co-Founder
                                </Link>
                            }
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-3">
                        {error && <div className="alert alert-danger">{error}</div>}

                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading co-founders...</div>
                        ) : coFounders.length === 0 ? (
                            <div className="text-center py-5 text-muted">No co-founders found yet.</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th scope="col">Profile</th>
                                            <th scope="col">Designation</th>
                                            <th scope="col">Experience</th>
                                            <th scope="col">Order</th>
                                            <th scope="col">Status</th>
                                            <th scope="col" className="text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {coFounders.map((coFounder) => (
                                            <tr key={coFounder.id}>
                                                <td>
                                                    <div className="d-flex align-items-center gap-3">
                                                        <img
                                                            src={coFounder.profile_image || "/images/cst_white.png"}
                                                            alt={coFounder.name}
                                                            className="rounded-circle border"
                                                            width="48"
                                                            height="48"
                                                            style={{ objectFit: "cover" }}
                                                        />
                                                        <div>
                                                            <div className="fw-semibold">{[coFounder.title, coFounder.name].filter(Boolean).join(" ")}</div>
                                                            <small className="text-muted">{coFounder.sub_designation || "No sub designation"}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{coFounder.designation}</td>
                                                <td className="text-muted">{coFounder.experience || "Not provided"}</td>
                                                <td>{coFounder.display_order ?? 0}</td>
                                                <td>
                                                    <span className={`badge ${Number(coFounder.status) === 1 ? "bg-success" : "bg-secondary"}`}>
                                                        {Number(coFounder.status) === 1 ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td className="text-end">
                                                    <div className="btn-group btn-group-sm" role="group">

                                                        {/* View */}
                                                        {hasPermission("co_founders.view") && (
                                                            <Link
                                                                href={`/next_panel/co-founders/${coFounder.id}/details`}
                                                                className="btn btn-outline-primary"
                                                                aria-label="View co-founder"
                                                            >
                                                                <ArrowUpRight size={16} />
                                                                {/* ya <Eye size={16} /> */}
                                                            </Link>
                                                        )}

                                                        {/* Edit */}
                                                        {hasPermission("co_founders.edit") && (
                                                            <Link
                                                                href={`/next_panel/co-founders/${coFounder.id}/edit`}
                                                                className="btn btn-outline-secondary"
                                                                aria-label="Edit co-founder"
                                                            >
                                                                <Edit size={16} />
                                                            </Link>
                                                        )}

                                                        {/* Delete */}
                                                        {hasPermission("co_founders.delete") && (
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-danger"
                                                                onClick={() => handleDelete(coFounder)}
                                                                disabled={deletingId === coFounder.id}
                                                                aria-label="Delete co-founder"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
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
