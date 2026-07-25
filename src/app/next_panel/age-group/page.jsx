"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Edit, Plus, Trash2, Users } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";

export default function AgeGroupPage() {
    const { user: userInfo } = useAuth();
    const [ageGroups, setAgeGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState(null);

    const loadAgeGroups = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/age_groups");
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to load age groups.");
            setAgeGroups(json.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAgeGroups();
    }, []);

    const handleDelete = async (ageGroup) => {
        if (!confirm(`Delete age group "${ageGroup.age_group || ageGroup.id}"?`)) return;

        setDeletingId(ageGroup.id);
        setError(null);

        try {
            const res = await fetch(`/api/age-group/${ageGroup.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete age group.");
            setAgeGroups((current) => current.filter((item) => item.id !== ageGroup.id));
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
                                    <Users size={24} />
                                    <h1 className="h4 mb-0">Age Groups</h1>
                                </div>
                                <p className="text-muted mb-0">Manage player age group brackets.</p>
                            </div>

                            {userInfo.permissions.includes("age-group.create") && (
                                <Link href="/next_panel/age-group/new" className="btn btn-primary fw-semibold">
                                    <Plus size={16} className="me-2" /> New Age Group
                                </Link>
                            )}

                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-3">
                        {error && <div className="alert alert-danger">{error}</div>}

                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading age groups...</div>
                        ) : ageGroups.length === 0 ? (
                            <div className="text-center py-5 text-muted">No age groups found yet.</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th scope="col">Age Group</th>
                                            <th scope="col">Min Age</th>
                                            <th scope="col">Max Age</th>
                                            <th scope="col">Status</th>
                                            <th scope="col" className="text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ageGroups.map((ageGroup) => (
                                            <tr key={ageGroup.id}>
                                                <td className="fw-semibold">{ageGroup.age_group || "—"}</td>
                                                <td>{ageGroup.min_age}</td>
                                                <td>{ageGroup.max_age}</td>
                                                <td>
                                                    <span className={`badge ${ageGroup.status === 1 ? "bg-success" : "bg-secondary"}`}>
                                                        {ageGroup.status === 1 ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td className="text-end">
                                                    <div className="btn-group btn-group-sm" role="group">
                                                        <Link href={`/next_panel/age-group/${ageGroup.id}`} className="btn btn-outline-primary" aria-label="View age group">
                                                            <ArrowUpRight size={16} />
                                                        </Link>
                                                        {userInfo.permissions.includes("age-group.edit") && (
                                                            <Link href={`/next_panel/age-group/${ageGroup.id}/edit`} className="btn btn-outline-secondary" aria-label="Edit age group">
                                                                <Edit size={16} />
                                                            </Link>
                                                        )}
                                                        {userInfo.permissions.includes("age-group.delete") && (
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-danger"
                                                                onClick={() => handleDelete(ageGroup)}
                                                                disabled={deletingId === ageGroup.id}
                                                                aria-label="Delete age group"
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
