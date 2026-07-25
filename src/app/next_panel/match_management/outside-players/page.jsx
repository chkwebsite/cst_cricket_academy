"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Edit, Plus, Trash2, UserPlus } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";

export default function OutsidePlayerPage() {
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
                const playerRes = await fetch("/api/outside-players");
                const playerJson = await playerRes.json();

                if (!playerRes.ok) throw new Error(playerJson.message || "Unable to load outside players.");

                setPlayers(playerJson.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadPlayers();
    }, []);

    const handleDelete = async (player) => {
        if (!confirm(`Delete outside player "${player.name}"?`)) return;

        setDeletingId(player.id);
        setError(null);

        try {
            const res = await fetch(`/api/outside-players/${player.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete outside player.");
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
                                    <UserPlus size={24} />
                                    <h1 className="h4 mb-0">Outside Players</h1>
                                </div>
                                <p className="text-muted mb-0">Manage guest players joining from outside academies.</p>
                            </div>

                            {hasPermission("outside_players.create") &&
                                <Link href="/next_panel/outside-players/new" className="btn btn-primary fw-semibold">
                                    <Plus size={16} className="me-2" /> New Outside Player
                                </Link>
                            }
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-3">
                        {error && <div className="alert alert-danger">{error}</div>}

                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading outside players...</div>
                        ) : players.length === 0 ? (
                            <div className="text-center py-5 text-muted">No outside players found yet.</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th scope="col">Name</th>
                                            <th scope="col">Email</th>
                                            <th scope="col">Phone</th>
                                            <th scope="col">Academy</th>
                                            <th scope="col" className="text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {players.map((player) => (
                                            <tr key={player.id}>
                                                <td className="fw-semibold">{player.name}</td>
                                                <td className="text-muted">{player.email}</td>
                                                <td className="text-muted">{player.phone}</td>
                                                <td className="text-muted">{player.academy_name || "Not provided"}</td>
                                                <td className="text-end">
                                                    <div className="btn-group btn-group-sm" role="group">
                                                        <Link href={`/next_panel/outside-players/${player.id}`} className="btn btn-outline-primary" aria-label="View outside player">
                                                            <ArrowUpRight size={16} />
                                                        </Link>

                                                        {hasPermission("outside_players.edit") && <Link href={`/next_panel/outside-players/${player.id}/edit`} className="btn btn-outline-secondary" aria-label="Edit outside player">
                                                            <Edit size={16} />
                                                        </Link>}
                                                        {hasPermission("outside_players.delete") &&
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-danger"
                                                                onClick={() => handleDelete(player)}
                                                                disabled={deletingId === player.id}
                                                                aria-label="Delete outside player"
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
