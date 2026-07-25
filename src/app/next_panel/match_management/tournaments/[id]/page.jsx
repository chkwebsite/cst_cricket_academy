"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2, Trophy } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";
import { formatDateInput } from "../TournamentForm";

const tournamentFields = [
    ["Season", "season"],
    ["Start Date", "start_date"],
    ["End Date", "end_date"],
];

export default function TournamentDetailPage() {
    const { user } = useAuth();
    const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
    const hasPermission = (permission) => {
        if (Number(user?.role_id) === 1 || Number(user?.role_id) === 7) return true;
        return permissions.includes(permission);
    };
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        async function loadTournament() {
            try {
                const tournamentRes = await fetch(`/api/tournaments/${params.id}`);
                const tournamentJson = await tournamentRes.json();

                if (!tournamentRes.ok) throw new Error(tournamentJson.message || "Unable to load tournament.");

                setTournament(tournamentJson.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadTournament();
    }, [params.id]);

    const handleDelete = async () => {
        if (!confirm("Delete this tournament?")) return;

        setDeleting(true);
        setError(null);

        try {
            const res = await fetch(`/api/tournaments/${params.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete tournament.");
            router.push("/next_panel/tournaments");
        } catch (err) {
            setError(err.message);
        } finally {
            setDeleting(false);
        }
    };

    const getValue = (key) => (key === "start_date" || key === "end_date") ? formatDateInput(tournament[key]) : tournament[key];

    return (
        <div className="container-fluid">
            <div className="row g-4">
                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                            <div>
                                <Link href="/next_panel/tournaments" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Tournaments
                                </Link>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <Trophy size={24} />
                                    <h1 className="h4 mb-0">{tournament?.tournament_name || "Tournament Details"}</h1>
                                </div>
                                <p className="text-muted mb-0">View and manage this tournament.</p>
                            </div>
                            <div className="d-flex gap-2">
                                {hasPermission("tournaments.edit") && <Link href={`/next_panel/tournaments/${params.id}/edit`} className="btn btn-primary">
                                    <Edit size={16} className="me-2" /> Edit
                                </Link>}
                                {hasPermission("tournaments.delete") && <button className="btn btn-outline-danger" onClick={handleDelete} disabled={deleting}>
                                    <Trash2 size={16} className="me-2" /> {deleting ? "Deleting..." : "Delete"}
                                </button>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading tournament details...</div>
                        ) : error ? (
                            <div className="alert alert-danger">{error}</div>
                        ) : (
                            <div className="row gy-4">
                                <div className="col-12">
                                    <div className="d-flex flex-wrap align-items-center gap-2">
                                        <span className={`badge ${tournament.status === 1 ? "bg-success" : "bg-secondary"}`}>
                                            {tournament.status === 1 ? "Active" : "Inactive"}
                                        </span>
                                        <span className="text-muted small">ID: {tournament.id}</span>
                                    </div>
                                </div>

                                {tournamentFields.map(([label, key]) => (
                                    <div className="col-md-6" key={key}>
                                        <h2 className="h6 mb-1">{label}</h2>
                                        <p className="mb-0 text-muted">{getValue(key) || "Not provided"}</p>
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

