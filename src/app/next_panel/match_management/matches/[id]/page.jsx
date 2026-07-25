"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2, Swords } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";

const statusBadge = {
    Upcoming: "bg-primary",
    Live: "bg-warning text-dark",
    Completed: "bg-success",
    Cancelled: "bg-secondary",
};

const matchFields = [
    ["Tournament", "tournament_name"],
    ["Branch", "branch_name"],
    ["Match Type", "match_type"],
    ["Overs", "overs"],
    ["Toss Winner", "toss_winner_team"],
    ["Toss Decision", "toss_decision"],
    ["Umpire 1", "umpire1_name"],
    ["Umpire 2", "umpire2_name"],
    ["Winner Team", "winner_team"],
    ["Man of the Match", "man_of_the_match"],
];

export default function MatchDetailPage() {
    const { user } = useAuth();
    const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
    const hasPermission = (permission) => {
        if (Number(user?.role_id) === 1 || Number(user?.role_id) === 7) return true;
        return permissions.includes(permission);
    };
    const [match, setMatch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        async function loadMatch() {
            try {
                const matchRes = await fetch(`/api/matches/${params.id}`);
                const matchJson = await matchRes.json();

                if (!matchRes.ok) throw new Error(matchJson.message || "Unable to load match.");

                setMatch(matchJson.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadMatch();
    }, [params.id]);

    const handleDelete = async () => {
        if (!confirm("Delete this match?")) return;

        setDeleting(true);
        setError(null);

        try {
            const res = await fetch(`/api/matches/${params.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete match.");
            router.push("/next_panel/matches");
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
                                <Link href="/next_panel/matches" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Matches
                                </Link>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <Swords size={24} />
                                    <h1 className="h4 mb-0">
                                        {match ? `${match.team_a_name} vs ${match.team_b_name}` : "Match Details"}
                                    </h1>
                                </div>
                                <p className="text-muted mb-0">View and manage this match.</p>
                            </div>
                            <div className="d-flex gap-2">
                                {hasPermission("matches.edit") && <Link href={`/next_panel/matches/${params.id}/edit`} className="btn btn-primary">
                                    <Edit size={16} className="me-2" /> Edit
                                </Link>}
                                {hasPermission("matches.delete") && <button className="btn btn-outline-danger" onClick={handleDelete} disabled={deleting}>
                                    <Trash2 size={16} className="me-2" /> {deleting ? "Deleting..." : "Delete"}
                                </button>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading match details...</div>
                        ) : error ? (
                            <div className="alert alert-danger">{error}</div>
                        ) : (
                            <div className="row gy-4">
                                <div className="col-12">
                                    <div className="d-flex flex-wrap align-items-center gap-2">
                                        <span className={`badge ${statusBadge[match.status] || "bg-secondary"}`}>
                                            {match.status || "Upcoming"}
                                        </span>
                                        <span className="text-muted small">ID: {match.id}</span>
                                        <span className="text-muted small">Match No: {match.match_no || "Not provided"}</span>
                                        <span className="text-muted small">
                                            Date: {match.match_date ? String(match.match_date).slice(0, 10) : "Not provided"}
                                            {match.match_time ? ` ${String(match.match_time).slice(0, 5)}` : ""}
                                        </span>
                                    </div>
                                </div>

                                {matchFields.map(([label, key]) => (
                                    <div className="col-md-6" key={key}>
                                        <h2 className="h6 mb-1">{label}</h2>
                                        <p className="mb-0 text-muted">{match[key] || "Not provided"}</p>
                                    </div>
                                ))}

                                <div className="col-12">
                                    <h2 className="h6 mb-1">Result</h2>
                                    <p className="mb-0 text-muted">{match.result || "Not provided"}</p>
                                </div>

                                <div className="col-12">
                                    <h2 className="h6 mb-1">Remarks</h2>
                                    <p className="mb-0 text-muted">{match.remarks || "Not provided"}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

