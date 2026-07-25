"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ClipboardList, Edit, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";

export default function MatchScorecardPage() {
    const { user } = useAuth();
    const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
    const hasPermission = (permission) => {
        if (Number(user?.role_id) === 1 || Number(user?.role_id) === 7) return true;
        return permissions.includes(permission);
    };
    const [scorecards, setScorecards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadScorecards() {
            try {
                const res = await fetch("/api/match-scorecard");
                const json = await res.json();

                if (!res.ok) throw new Error(json.message || "Unable to load scorecards.");

                setScorecards(json.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadScorecards();
    }, []);

    const getBatterName = (row) => row.batter_name?.trim() || row.batter_outside_name || `Player #${row.player_id}`;
    const getBowlerName = (row) => row.bowler_name?.trim() || row.bowler_outside_name || (row.bowler_id ? `Player #${row.bowler_id}` : "—");
    const getFielderName = (row) => row.fielder_name?.trim() || row.fielder_outside_name || (row.fielder_id ? `Player #${row.fielder_id}` : "—");

    const handleDelete = async (row) => {
        if (!confirm(`Delete scorecard entry for "${getBatterName(row)}"?`)) return;

        setDeletingId(row.id);
        setError(null);

        try {
            const res = await fetch(`/api/match-scorecard/${row.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete scorecard.");
            setScorecards((current) => current.filter((item) => item.id !== row.id));
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
                                    <ClipboardList size={24} />
                                    <h1 className="h4 mb-0">Match Scorecard</h1>
                                </div>
                                <p className="text-muted mb-0">Manage batting entries for each innings.</p>
                            </div>

                            {hasPermission("match-scorecard.create") &&
                                <Link href="/next_panel/match-scorecard/new" className="btn btn-primary fw-semibold">
                                    <Plus size={16} className="me-2" /> Add Entry
                                </Link>
                            }
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-3">
                        {error && <div className="alert alert-danger">{error}</div>}

                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading scorecards...</div>
                        ) : scorecards.length === 0 ? (
                            <div className="text-center py-5 text-muted">No scorecard entries yet.</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th scope="col">Innings</th>
                                            <th scope="col">Batter</th>
                                            <th scope="col">Pos</th>
                                            <th scope="col">Runs</th>
                                            <th scope="col">Balls</th>
                                            <th scope="col">4s / 6s</th>
                                            <th scope="col">SR</th>
                                            <th scope="col">How Out</th>
                                            <th scope="col">Bowler</th>
                                            <th scope="col">Fielder</th>
                                            <th scope="col" className="text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {scorecards.map((row) => (
                                            <tr key={row.id}>
                                                <td>{row.innings_no === 1 ? "1st" : row.innings_no === 2 ? "2nd" : row.innings_no || `#${row.innings_id}`}</td>
                                                <td className="fw-semibold">{getBatterName(row)}</td>
                                                <td>{row.batting_position ?? "—"}</td>
                                                <td>{row.runs ?? 0}</td>
                                                <td>{row.balls ?? 0}</td>
                                                <td>{row.fours ?? 0} / {row.sixes ?? 0}</td>
                                                <td>{row.strike_rate ?? 0}</td>
                                                <td className="text-muted">{row.how_out || "—"}</td>
                                                <td className="text-muted">{getBowlerName(row)}</td>
                                                <td className="text-muted">{getFielderName(row)}</td>
                                                <td className="text-end">
                                                    <div className="btn-group btn-group-sm" role="group">
                                                        <Link href={`/next_panel/match-scorecard/${row.id}`} className="btn btn-outline-primary" aria-label="View scorecard entry">
                                                            <ArrowUpRight size={16} />
                                                        </Link>

                                                        {hasPermission("match-scorecard.edit") && <Link href={`/next_panel/match-scorecard/${row.id}/edit`} className="btn btn-outline-secondary" aria-label="Edit scorecard entry">
                                                            <Edit size={16} />
                                                        </Link>}
                                                        {hasPermission("match-scorecard.delete") &&
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-danger"
                                                                onClick={() => handleDelete(row)}
                                                                disabled={deletingId === row.id}
                                                                aria-label="Delete scorecard entry"
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
