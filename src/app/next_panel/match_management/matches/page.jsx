"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Edit, Plus, Trash2, Swords } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";

const statusBadge = {
    Upcoming: "bg-primary",
    Live: "bg-warning text-dark",
    Completed: "bg-success",
    Cancelled: "bg-secondary",
};

export default function MatchPage() {
    const { user } = useAuth();
    const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
    const hasPermission = (permission) => {
        if (Number(user?.role_id) === 1 || Number(user?.role_id) === 7) return true;
        return permissions.includes(permission);
    };
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadMatches() {
            try {
                const matchRes = await fetch("/api/matches");
                const matchJson = await matchRes.json();

                if (!matchRes.ok) throw new Error(matchJson.message || "Unable to load matches.");

                setMatches(matchJson.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadMatches();
    }, []);

    const handleDelete = async (match) => {
        if (!confirm(`Delete match "${match.match_no || `#${match.id}`}"?`)) return;

        setDeletingId(match.id);
        setError(null);

        try {
            const res = await fetch(`/api/matches/${match.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete match.");
            setMatches((current) => current.filter((item) => item.id !== match.id));
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
                                    <Swords size={24} />
                                    <h1 className="h4 mb-0">Matches</h1>
                                </div>
                                <p className="text-muted mb-0">Schedule and track match fixtures and results.</p>
                            </div>

                            {hasPermission("matches.create") &&
                                <Link href="/next_panel/matches/new" className="btn btn-primary fw-semibold">
                                    <Plus size={16} className="me-2" /> New Match
                                </Link>
                            }
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-3">
                        {error && <div className="alert alert-danger">{error}</div>}

                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading matches...</div>
                        ) : matches.length === 0 ? (
                            <div className="text-center py-5 text-muted">No matches found yet.</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th scope="col">Match</th>
                                            <th scope="col">Tournament</th>
                                            <th scope="col">Teams</th>
                                            <th scope="col">Date</th>
                                            <th scope="col">Status</th>
                                            <th scope="col">Winner</th>
                                            <th scope="col" className="text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {matches.map((match) => (
                                            <tr key={match.id}>
                                                <td className="fw-semibold">{match.match_no || `#${match.id}`}</td>
                                                <td>{match.tournament_name || "Not provided"}</td>
                                                <td>{match.team_a_name} <span className="text-muted">vs</span> {match.team_b_name}</td>
                                                <td className="text-muted">
                                                    {match.match_date ? String(match.match_date).slice(0, 10) : "Not provided"}
                                                    {match.match_time ? ` ${String(match.match_time).slice(0, 5)}` : ""}
                                                </td>
                                                <td>
                                                    <span className={`badge ${statusBadge[match.status] || "bg-secondary"}`}>
                                                        {match.status || "Upcoming"}
                                                    </span>
                                                </td>
                                                <td className="text-muted">{match.winner_team || "Not provided"}</td>
                                                <td className="text-end">
                                                    <div className="btn-group btn-group-sm" role="group">
                                                        <Link href={`/next_panel/matches/${match.id}`} className="btn btn-outline-primary" aria-label="View match">
                                                            <ArrowUpRight size={16} />
                                                        </Link>

                                                        {hasPermission("matches.edit") && <Link href={`/next_panel/matches/${match.id}/edit`} className="btn btn-outline-secondary" aria-label="Edit match">
                                                            <Edit size={16} />
                                                        </Link>}
                                                        {hasPermission("matches.delete") &&
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-danger"
                                                                onClick={() => handleDelete(match)}
                                                                disabled={deletingId === match.id}
                                                                aria-label="Delete match"
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
