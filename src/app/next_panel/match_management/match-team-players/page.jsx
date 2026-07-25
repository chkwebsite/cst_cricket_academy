"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Edit, Plus, Trash2, Users2 } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";

export default function MatchTeamPlayersPage() {
    const { user } = useAuth();
    const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
    const hasPermission = (permission) => {
        if (Number(user?.role_id) === 1 || Number(user?.role_id) === 7) return true;
        return permissions.includes(permission);
    };
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadPlayers() {
            try {
                const res = await fetch("/api/match-team-players");
                const json = await res.json();

                if (!res.ok) throw new Error(json.message || "Unable to load match team players.");

                setPlayers(json.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadPlayers();
    }, []);

    const handleDelete = async (player) => {
        const playerName = player.academy_player || player.outside_player || `Player #${player.id}`;
        if (!confirm(`Remove "${playerName}" from this match?`)) return;

        setDeletingId(player.id);
        setError(null);

        try {
            const res = await fetch(`/api/match-team-players/${player.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete record.");
            setPlayers((current) => current.filter((item) => item.id !== player.id));
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
                                    <Users2 size={24} />
                                    <h1 className="h4 mb-0">Match Team Players</h1>
                                </div>
                                <p className="text-muted mb-0">Manage players selected for each match and team.</p>
                            </div>

                            {hasPermission("match-team-players.create") &&
                                <Link href="/next_panel/match-team-players/new" className="btn btn-primary fw-semibold">
                                    <Plus size={16} className="me-2" /> Add Player
                                </Link>
                            }
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-3">
                        {error && <div className="alert alert-danger">{error}</div>}

                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading match team players...</div>
                        ) : players.length === 0 ? (
                            <div className="text-center py-5 text-muted">No players added yet.</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th scope="col">Match</th>
                                            <th scope="col">Team</th>
                                            <th scope="col">Player</th>
                                            <th scope="col">Roles</th>
                                            <th scope="col">Bowler Type</th>
                                            <th scope="col" className="text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {players.map((player) => (
                                            <tr key={player.id}>
                                                <td>{player.match_no ? `Match #${player.match_no}` : `Match #${player.match_id}`}</td>
                                                <td>{player.team_name || `Team #${player.team_id}`}</td>
                                                <td>
                                                    <div className="fw-semibold">{player.academy_player || player.outside_player || "Unknown player"}</div>
                                                    <small className="text-muted">{player.academy_player ? "Academy Player" : "Outside Player"}</small>
                                                </td>
                                                <td>
                                                    <div className="d-flex flex-wrap gap-1">
                                                        {!!player.is_playing11 && <span className="badge bg-success">Playing XI</span>}
                                                        {!!player.is_captain && <span className="badge bg-primary">Captain</span>}
                                                        {!!player.is_wicket_keeper && <span className="badge bg-info text-dark">Wicket Keeper</span>}
                                                        {!!player.is_allrounder && <span className="badge bg-warning text-dark">All Rounder</span>}
                                                        {!!player.is_bollower && <span className="badge bg-secondary">Bowler</span>}
                                                        {!player.is_playing11 && !player.is_captain && !player.is_wicket_keeper && !player.is_allrounder && !player.is_bollower && (
                                                            <span className="text-muted small">No roles set</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="text-muted">{player.is_bollower ? (player.is_bollower_type || "Not specified") : "—"}</td>
                                                <td className="text-end">
                                                    <div className="btn-group btn-group-sm" role="group">
                                                        <Link href={`/next_panel/match-team-players/${player.id}`} className="btn btn-outline-primary" aria-label="View player">
                                                            <ArrowUpRight size={16} />
                                                        </Link>

                                                        {hasPermission("match-team-players.edit") && <Link href={`/next_panel/match-team-players/${player.id}/edit`} className="btn btn-outline-secondary" aria-label="Edit player">
                                                            <Edit size={16} />
                                                        </Link>}
                                                        {hasPermission("match-team-players.delete") &&
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-danger"
                                                                onClick={() => handleDelete(player)}
                                                                disabled={deletingId === player.id}
                                                                aria-label="Delete player"
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
