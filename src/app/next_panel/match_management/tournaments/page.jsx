"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Edit, Plus, Trash2, Trophy } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";

export default function TournamentPage() {
    const { user } = useAuth();
    const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
    const hasPermission = (permission) => {
        if (Number(user?.role_id) === 1 || Number(user?.role_id) === 7) return true;
        return permissions.includes(permission);
    };
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadTournaments() {
            try {
                const tournamentRes = await fetch("/api/tournaments");
                const tournamentJson = await tournamentRes.json();

                if (!tournamentRes.ok) throw new Error(tournamentJson.message || "Unable to load tournaments.");

                setTournaments(tournamentJson.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadTournaments();
    }, []);

    const handleDelete = async (tournament) => {
        if (!confirm(`Delete tournament "${tournament.tournament_name}"?`)) return;

        setDeletingId(tournament.id);
        setError(null);

        try {
            const res = await fetch(`/api/tournaments/${tournament.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete tournament.");
            setTournaments((current) => current.filter((item) => item.id !== tournament.id));
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
                                    <Trophy size={24} />
                                    <h1 className="h4 mb-0">Tournaments</h1>
                                </div>
                                <p className="text-muted mb-0">Manage tournaments and their schedules.</p>
                            </div>

                            {hasPermission("tournaments.create") &&
                                <Link href="/next_panel/tournaments/new" className="btn btn-primary fw-semibold">
                                    <Plus size={16} className="me-2" /> New Tournament
                                </Link>
                            }
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-3">
                        {error && <div className="alert alert-danger">{error}</div>}

                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading tournaments...</div>
                        ) : tournaments.length === 0 ? (
                            <div className="text-center py-5 text-muted">No tournaments found yet.</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th scope="col">Tournament</th>
                                            <th scope="col">Season</th>
                                            <th scope="col">Start Date</th>
                                            <th scope="col">End Date</th>
                                            <th scope="col">Status</th>
                                            <th scope="col" className="text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tournaments.map((tournament) => (
                                            <tr key={tournament.id}>
                                                <td className="fw-semibold">{tournament.tournament_name}</td>
                                                <td>{tournament.season || "Not provided"}</td>
                                                <td className="text-muted">{tournament.start_date ? String(tournament.start_date).slice(0, 10) : "Not provided"}</td>
                                                <td className="text-muted">{tournament.end_date ? String(tournament.end_date).slice(0, 10) : "Not provided"}</td>
                                                <td>
                                                    <span className={`badge ${tournament.status === 1 ? "bg-success" : "bg-secondary"}`}>
                                                        {tournament.status === 1 ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td className="text-end">
                                                    <div className="btn-group btn-group-sm" role="group">
                                                        <Link href={`/next_panel/tournaments/${tournament.id}`} className="btn btn-outline-primary" aria-label="View tournament">
                                                            <ArrowUpRight size={16} />
                                                        </Link>

                                                        {hasPermission("tournaments.edit") && <Link href={`/next_panel/tournaments/${tournament.id}/edit`} className="btn btn-outline-secondary" aria-label="Edit tournament">
                                                            <Edit size={16} />
                                                        </Link>}
                                                        {hasPermission("tournaments.delete") &&
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-danger"
                                                                onClick={() => handleDelete(tournament)}
                                                                disabled={deletingId === tournament.id}
                                                                aria-label="Delete tournament"
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
