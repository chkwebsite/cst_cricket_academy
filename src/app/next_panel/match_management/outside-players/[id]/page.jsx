"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2, UserPlus } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";

const playerFields = [
    ["Email", "email"],
    ["Phone", "phone"],
    ["Academy Name", "academy_name"],
];

export default function OutsidePlayerDetailPage() {
    const { user } = useAuth();
    const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
    const hasPermission = (permission) => {
        if (Number(user?.role_id) === 1 || Number(user?.role_id) === 7) return true;
        return permissions.includes(permission);
    };
    const [player, setPlayer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        async function loadPlayer() {
            try {
                const playerRes = await fetch(`/api/outside-players/${params.id}`);
                const playerJson = await playerRes.json();

                if (!playerRes.ok) throw new Error(playerJson.message || "Unable to load outside player.");

                setPlayer(playerJson.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadPlayer();
    }, [params.id]);

    const handleDelete = async () => {
        if (!confirm("Delete this outside player?")) return;

        setDeleting(true);
        setError(null);

        try {
            const res = await fetch(`/api/outside-players/${params.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete outside player.");
            router.push("/next_panel/outside-players");
        } catch (err) {
            setError(err.message);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="container-fluid">
            <div className="row g-4">
                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                            <div>
                                <Link href="/next_panel/outside-players" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Outside Players
                                </Link>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <UserPlus size={24} />
                                    <h1 className="h4 mb-0">{player?.name || "Outside Player Details"}</h1>
                                </div>
                                <p className="text-muted mb-0">View and manage this outside player.</p>
                            </div>
                            <div className="d-flex gap-2">
                                {hasPermission("outside_players.edit") && <Link href={`/next_panel/outside-players/${params.id}/edit`} className="btn btn-primary">
                                    <Edit size={16} className="me-2" /> Edit
                                </Link>}
                                {hasPermission("outside_players.delete") && <button className="btn btn-outline-danger" onClick={handleDelete} disabled={deleting}>
                                    <Trash2 size={16} className="me-2" /> {deleting ? "Deleting..." : "Delete"}
                                </button>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading outside player details...</div>
                        ) : error ? (
                            <div className="alert alert-danger">{error}</div>
                        ) : (
                            <div className="row gy-4">
                                <div className="col-12">
                                    <span className="text-muted small">ID: {player.id}</span>
                                </div>

                                {playerFields.map(([label, key]) => (
                                    <div className="col-md-6" key={key}>
                                        <h2 className="h6 mb-1">{label}</h2>
                                        <p className="mb-0 text-muted">{player[key] || "Not provided"}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

