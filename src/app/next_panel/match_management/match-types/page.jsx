"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Edit, Plus, Trash2, ListChecks } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";

export default function MatchTypePage() {
    const { user } = useAuth();
    const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
    const hasPermission = (permission) => {
        if (Number(user?.role_id) === 1 || Number(user?.role_id) === 7) return true;
        return permissions.includes(permission);
    };
    const [matchTypes, setMatchTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadMatchTypes() {
            try {
                const matchTypeRes = await fetch("/api/match-types");
                const matchTypeJson = await matchTypeRes.json();

                if (!matchTypeRes.ok) throw new Error(matchTypeJson.message || "Unable to load match types.");

                setMatchTypes(matchTypeJson.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadMatchTypes();
    }, []);

    const handleDelete = async (matchType) => {
        if (!confirm(`Delete match type "${matchType.match_type}"?`)) return;

        setDeletingId(matchType.id);
        setError(null);

        try {
            const res = await fetch(`/api/match-types/${matchType.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete match type.");
            setMatchTypes((current) => current.filter((item) => item.id !== matchType.id));
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
                                    <ListChecks size={24} />
                                    <h1 className="h4 mb-0">Match Types</h1>
                                </div>
                                <p className="text-muted mb-0">Manage the match types available for tournaments.</p>
                            </div>

                            {hasPermission("match_types.create") &&
                                <Link href="/next_panel/match-types/new" className="btn btn-primary fw-semibold">
                                    <Plus size={16} className="me-2" /> New Match Type
                                </Link>
                            }
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-3">
                        {error && <div className="alert alert-danger">{error}</div>}

                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading match types...</div>
                        ) : matchTypes.length === 0 ? (
                            <div className="text-center py-5 text-muted">No match types found yet.</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th scope="col">Match Type</th>
                                            <th scope="col">Status</th>
                                            <th scope="col" className="text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {matchTypes.map((matchType) => (
                                            <tr key={matchType.id}>
                                                <td className="fw-semibold">{matchType.match_type}</td>
                                                <td>
                                                    <span className={`badge ${matchType.status === 1 ? "bg-success" : "bg-secondary"}`}>
                                                        {matchType.status === 1 ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td className="text-end">
                                                    <div className="btn-group btn-group-sm" role="group">
                                                        <Link href={`/next_panel/match-types/${matchType.id}`} className="btn btn-outline-primary" aria-label="View match type">
                                                            <ArrowUpRight size={16} />
                                                        </Link>

                                                        {hasPermission("match_types.edit") && <Link href={`/next_panel/match-types/${matchType.id}/edit`} className="btn btn-outline-secondary" aria-label="Edit match type">
                                                            <Edit size={16} />
                                                        </Link>}
                                                        {hasPermission("match_types.delete") &&
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-danger"
                                                                onClick={() => handleDelete(matchType)}
                                                                disabled={deletingId === matchType.id}
                                                                aria-label="Delete match type"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        }
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
