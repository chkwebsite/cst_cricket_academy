"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Award, ArrowUpRight, Edit, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";

export default function MatchAwardsPage() {
    const { user } = useAuth();
    const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
    const hasPermission = (permission) => {
        if (Number(user?.role_id) === 1 || Number(user?.role_id) === 7) return true;
        return permissions.includes(permission);
    };
    const [awards, setAwards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadAwards() {
            try {
                const res = await fetch("/api/match-awards");
                const json = await res.json();

                if (!res.ok) throw new Error(json.message || "Unable to load match awards.");

                setAwards(json.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadAwards();
    }, []);

    const getPlayerName = (row) => row.academy_player?.trim() || row.outside_player || `Player #${row.player_id}`;

    const handleDelete = async (row) => {
        if (!confirm(`Remove "${row.award_type}" award from "${getPlayerName(row)}"?`)) return;

        setDeletingId(row.id);
        setError(null);

        try {
            const res = await fetch(`/api/match-awards/${row.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete award.");
            setAwards((current) => current.filter((item) => item.id !== row.id));
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
                                    <Award size={24} />
                                    <h1 className="h4 mb-0">Match Awards</h1>
                                </div>
                                <p className="text-muted mb-0">Manage awards given to players for each match.</p>
                            </div>

                            {hasPermission("match-awards.create") &&
                                <Link href="/next_panel/match-awards/new" className="btn btn-primary fw-semibold">
                                    <Plus size={16} className="me-2" /> Add Award
                                </Link>
                            }
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-3">
                        {error && <div className="alert alert-danger">{error}</div>}

                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading match awards...</div>
                        ) : awards.length === 0 ? (
                            <div className="text-center py-5 text-muted">No awards recorded yet.</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th scope="col">Match</th>
                                            <th scope="col">Award</th>
                                            <th scope="col">Player</th>
                                            <th scope="col">Remarks</th>
                                            <th scope="col" className="text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {awards.map((row) => (
                                            <tr key={row.id}>
                                                <td>{row.match_no ? `Match #${row.match_no}` : `Match #${row.match_id}`}</td>
                                                <td>
                                                    <span className="badge bg-warning text-dark">{row.award_type}</span>
                                                </td>
                                                <td className="fw-semibold">{getPlayerName(row)}</td>
                                                <td className="text-muted">{row.remarks || "—"}</td>
                                                <td className="text-end">
                                                    <div className="btn-group btn-group-sm" role="group">
                                                        <Link href={`/next_panel/match-awards/${row.id}`} className="btn btn-outline-primary" aria-label="View award">
                                                            <ArrowUpRight size={16} />
                                                        </Link>

                                                        {hasPermission("match-awards.edit") && <Link href={`/next_panel/match-awards/${row.id}/edit`} className="btn btn-outline-secondary" aria-label="Edit award">
                                                            <Edit size={16} />
                                                        </Link>}
                                                        {hasPermission("match-awards.delete") &&
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-danger"
                                                                onClick={() => handleDelete(row)}
                                                                disabled={deletingId === row.id}
                                                                aria-label="Delete award"
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
