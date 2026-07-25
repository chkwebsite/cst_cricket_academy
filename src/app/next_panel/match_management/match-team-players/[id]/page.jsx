"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2, Users2 } from "lucide-react";

export default function MatchTeamPlayerDetailPage() {
    const [player, setPlayer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        async function loadPlayer() {
            try {
                const res = await fetch(`/api/match-team-players/${params.id}`);
                const json = await res.json();

                if (!res.ok) throw new Error(json.message || "Unable to load record.");

                setPlayer(json.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadPlayer();
    }, [params.id]);

    const handleDelete = async () => {
        if (!confirm("Remove this player from the match?")) return;

        setDeleting(true);
        setError(null);

        try {
            const res = await fetch(`/api/match-team-players/${params.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete record.");
            router.push("/next_panel/match-team-players");
        } catch (err) {
            setError(err.message);
        } finally {
            setDeleting(false);
        }
    };

    const playerName = player?.academy_player || player?.outside_player;

    return (
        <div className="container-fluid">
            <div className="row g-4">
                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                            <div>
                                <Link href="/next_panel/match-team-players" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Match Team Players
                                </Link>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <Users2 size={24} />
                                    <h1 className="h4 mb-0">{playerName || "Player Details"}</h1>
                                </div>
                                <p className="text-muted mb-0">View this player's match and role details.</p>
                            </div>
                            <div className="d-flex gap-2">
                                <Link href={`/next_panel/match-team-players/${params.id}/edit`} className="btn btn-primary">
                                    <Edit size={16} className="me-2" /> Edit
                                </Link>
                                <button className="btn btn-outline-danger" onClick={handleDelete} disabled={deleting}>
                                    <Trash2 size={16} className="me-2" /> {deleting ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading player details...</div>
                        ) : error ? (
                            <div className="alert alert-danger">{error}</div>
                        ) : (
                            <div className="row gy-4">
                                <div className="col-md-4">
                                    <h2 className="h6 mb-1">Match</h2>
                                    <p className="mb-0 text-muted">{player.match_no ? `Match #${player.match_no}` : `Match #${player.match_id}`}</p>
                                </div>

                                <div className="col-md-4">
                                    <h2 className="h6 mb-1">Team</h2>
                                    <p className="mb-0 text-muted">{player.team_name || `Team #${player.team_id}`}</p>
                                </div>

                                <div className="col-md-4">
                                    <h2 className="h6 mb-1">Player Source</h2>
                                    <p className="mb-0 text-muted">{player.academy_player ? "Academy Player" : "Outside Player"}</p>
                                </div>

                                <div className="col-12">
                                    <h2 className="h6 mb-2">Roles</h2>
                                    <div className="d-flex flex-wrap gap-2">
                                        {!!player.is_playing11 && <span className="badge bg-success">Playing XI</span>}
                                        {!!player.is_captain && <span className="badge bg-primary">Captain</span>}
                                        {!!player.is_wicket_keeper && <span className="badge bg-info text-dark">Wicket Keeper</span>}
                                        {!!player.is_allrounder && <span className="badge bg-warning text-dark">All Rounder</span>}
                                        {!!player.is_bollower && <span className="badge bg-secondary">Bowler{player.is_bollower_type ? ` — ${player.is_bollower_type}` : ""}</span>}
                                        {!player.is_playing11 && !player.is_captain && !player.is_wicket_keeper && !player.is_allrounder && !player.is_bollower && (
                                            <span className="text-muted small">No roles set</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

