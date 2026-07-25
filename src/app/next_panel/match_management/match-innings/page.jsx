"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Edit, ListOrdered, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";

export default function MatchInningsPage() {
    const { user } = useAuth();
    const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
    const hasPermission = (permission) => {
        if (Number(user?.role_id) === 1 || Number(user?.role_id) === 7) return true;
        return permissions.includes(permission);
    };
    const [innings, setInnings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadInnings() {
            try {
                const res = await fetch("/api/match-innings");
                const json = await res.json();

                if (!res.ok) throw new Error(json.message || "Unable to load match innings.");

                setInnings(json.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadInnings();
    }, []);

    const handleDelete = async (inning) => {
        if (!confirm(`Delete innings #${inning.innings_no} for Match #${inning.match_no || inning.match_id}?`)) return;

        setDeletingId(inning.id);
        setError(null);

        try {
            const res = await fetch(`/api/match-innings/${inning.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete innings.");
            setInnings((current) => current.filter((item) => item.id !== inning.id));
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
                                    <ListOrdered size={24} />
                                    <h1 className="h4 mb-0">Match Innings</h1>
                                </div>
                                <p className="text-muted mb-0">Manage innings scores for each match.</p>
                            </div>

                            {hasPermission("match-innings.create") &&
                                <Link href="/next_panel/match-innings/new" className="btn btn-primary fw-semibold">
                                    <Plus size={16} className="me-2" /> Add Innings
                                </Link>
                            }
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-3">
                        {error && <div className="alert alert-danger">{error}</div>}

                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading match innings...</div>
                        ) : innings.length === 0 ? (
                            <div className="text-center py-5 text-muted">No innings recorded yet.</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th scope="col">Match</th>
                                            <th scope="col">Innings</th>
                                            <th scope="col">Batting Team</th>
                                            <th scope="col">Bowling Team</th>
                                            <th scope="col">Score</th>
                                            <th scope="col">Overs</th>
                                            <th scope="col">Target</th>
                                            <th scope="col" className="text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {innings.map((inning) => (
                                            <tr key={inning.id}>
                                                <td>{inning.match_no ? `Match #${inning.match_no}` : `Match #${inning.match_id}`}</td>
                                                <td>
                                                    <span className="badge bg-light text-dark border">
                                                        {inning.innings_no === 1 ? "1st" : inning.innings_no === 2 ? "2nd" : inning.innings_no}
                                                    </span>
                                                </td>
                                                <td>{inning.batting_team || `Team #${inning.batting_team_id}`}</td>
                                                <td>{inning.bowling_team || `Team #${inning.bowling_team_id}`}</td>
                                                <td className="fw-semibold">{inning.total_runs ?? 0}/{inning.wickets ?? 0}</td>
                                                <td className="text-muted">{inning.overs ?? 0}</td>
                                                <td className="text-muted">{inning.target || "—"}</td>
                                                <td className="text-end">
                                                    <div className="btn-group btn-group-sm" role="group">
                                                        <Link href={`/next_panel/match-innings/${inning.id}`} className="btn btn-outline-primary" aria-label="View innings">
                                                            <ArrowUpRight size={16} />
                                                        </Link>

                                                        {hasPermission("match-innings.edit") && <Link href={`/next_panel/match-innings/${inning.id}/edit`} className="btn btn-outline-secondary" aria-label="Edit innings">
                                                            <Edit size={16} />
                                                        </Link>}
                                                        {hasPermission("match-innings.delete") &&
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-danger"
                                                                onClick={() => handleDelete(inning)}
                                                                disabled={deletingId === inning.id}
                                                                aria-label="Delete innings"
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
