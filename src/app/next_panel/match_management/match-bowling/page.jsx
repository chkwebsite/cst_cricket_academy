"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Edit, Plus, Target, Trash2 } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";

export default function MatchBowlingPage() {
    const { user } = useAuth();
    const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
    const hasPermission = (permission) => {
        if (Number(user?.role_id) === 1 || Number(user?.role_id) === 7) return true;
        return permissions.includes(permission);
    };
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadRecords() {
            try {
                const res = await fetch("/api/match-bowling");
                const json = await res.json();

                if (!res.ok) throw new Error(json.message || "Unable to load bowling records.");

                setRecords(json.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadRecords();
    }, []);

    const getBowlerName = (row) => row.academy_player?.trim() || row.outside_player || `Player #${row.bowler_id}`;

    const handleDelete = async (row) => {
        if (!confirm(`Delete bowling record for "${getBowlerName(row)}"?`)) return;

        setDeletingId(row.id);
        setError(null);

        try {
            const res = await fetch(`/api/match-bowling/${row.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete bowling record.");
            setRecords((current) => current.filter((item) => item.id !== row.id));
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
                                    <Target size={24} />
                                    <h1 className="h4 mb-0">Match Bowling</h1>
                                </div>
                                <p className="text-muted mb-0">Manage bowling figures for each innings.</p>
                            </div>

                            {hasPermission("match-bowling.create") &&
                                <Link href="/next_panel/match-bowling/new" className="btn btn-primary fw-semibold">
                                    <Plus size={16} className="me-2" /> Add Record
                                </Link>
                            }
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-3">
                        {error && <div className="alert alert-danger">{error}</div>}

                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading bowling records...</div>
                        ) : records.length === 0 ? (
                            <div className="text-center py-5 text-muted">No bowling records yet.</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th scope="col">Innings</th>
                                            <th scope="col">Bowler</th>
                                            <th scope="col">Overs</th>
                                            <th scope="col">Maidens</th>
                                            <th scope="col">Runs</th>
                                            <th scope="col">Wickets</th>
                                            <th scope="col">Wides</th>
                                            <th scope="col">No Balls</th>
                                            <th scope="col">Economy</th>
                                            <th scope="col" className="text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {records.map((row) => (
                                            <tr key={row.id}>
                                                <td>{row.innings_no === 1 ? "1st" : row.innings_no === 2 ? "2nd" : row.innings_no || `#${row.innings_id}`}</td>
                                                <td className="fw-semibold">{getBowlerName(row)}</td>
                                                <td>{row.overs ?? 0}</td>
                                                <td>{row.maidens ?? 0}</td>
                                                <td>{row.runs ?? 0}</td>
                                                <td className="fw-semibold">{row.wickets ?? 0}</td>
                                                <td className="text-muted">{row.wides ?? 0}</td>
                                                <td className="text-muted">{row.no_balls ?? 0}</td>
                                                <td>{row.economy ?? 0}</td>
                                                <td className="text-end">
                                                    <div className="btn-group btn-group-sm" role="group">
                                                        <Link href={`/next_panel/match-bowling/${row.id}`} className="btn btn-outline-primary" aria-label="View bowling record">
                                                            <ArrowUpRight size={16} />
                                                        </Link>

                                                        {hasPermission("match-bowling.edit") && <Link href={`/next_panel/match-bowling/${row.id}/edit`} className="btn btn-outline-secondary" aria-label="Edit bowling record">
                                                            <Edit size={16} />
                                                        </Link>}
                                                        {hasPermission("match-bowling.delete") &&
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-danger"
                                                                onClick={() => handleDelete(row)}
                                                                disabled={deletingId === row.id}
                                                                aria-label="Delete bowling record"
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
