"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, ListOrdered, Trash2 } from "lucide-react";

export default function MatchInningsDetailPage() {
    const [inning, setInning] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        async function loadInning() {
            try {
                const res = await fetch(`/api/match-innings/${params.id}`);
                const json = await res.json();

                if (!res.ok) throw new Error(json.message || "Unable to load innings.");

                setInning(json.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadInning();
    }, [params.id]);

    const handleDelete = async () => {
        if (!confirm("Delete this innings?")) return;

        setDeleting(true);
        setError(null);

        try {
            const res = await fetch(`/api/match-innings/${params.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete innings.");
            router.push("/next_panel/match-innings");
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
                                <Link href="/next_panel/match-innings" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Match Innings
                                </Link>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <ListOrdered size={24} />
                                    <h1 className="h4 mb-0">
                                        {inning ? `${inning.innings_no === 1 ? "1st" : inning.innings_no === 2 ? "2nd" : inning.innings_no} Innings` : "Innings Details"}
                                    </h1>
                                </div>
                                <p className="text-muted mb-0">View this innings score and details.</p>
                            </div>
                            <div className="d-flex gap-2">
                                <Link href={`/next_panel/match-innings/${params.id}/edit`} className="btn btn-primary">
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
                            <div className="text-center py-5 text-muted">Loading innings details...</div>
                        ) : error ? (
                            <div className="alert alert-danger">{error}</div>
                        ) : (
                            <div className="row gy-4">
                                <div className="col-md-4">
                                    <h2 className="h6 mb-1">Match</h2>
                                    <p className="mb-0 text-muted">{inning.match_no ? `Match #${inning.match_no}` : `Match #${inning.match_id}`}</p>
                                </div>

                                <div className="col-md-4">
                                    <h2 className="h6 mb-1">Batting Team</h2>
                                    <p className="mb-0 text-muted">{inning.batting_team || `Team #${inning.batting_team_id}`}</p>
                                </div>

                                <div className="col-md-4">
                                    <h2 className="h6 mb-1">Bowling Team</h2>
                                    <p className="mb-0 text-muted">{inning.bowling_team || `Team #${inning.bowling_team_id}`}</p>
                                </div>

                                <div className="col-md-3 col-6">
                                    <h2 className="h6 mb-1">Score</h2>
                                    <p className="mb-0 text-muted">{inning.total_runs ?? 0}/{inning.wickets ?? 0}</p>
                                </div>

                                <div className="col-md-3 col-6">
                                    <h2 className="h6 mb-1">Overs</h2>
                                    <p className="mb-0 text-muted">{inning.overs ?? 0}</p>
                                </div>

                                <div className="col-md-3 col-6">
                                    <h2 className="h6 mb-1">Extras</h2>
                                    <p className="mb-0 text-muted">{inning.extras ?? 0}</p>
                                </div>

                                <div className="col-md-3 col-6">
                                    <h2 className="h6 mb-1">Target</h2>
                                    <p className="mb-0 text-muted">{inning.target || "Not set"}</p>
                                </div>

                                <div className="col-12">
                                    <h2 className="h6 mb-1">Remarks</h2>
                                    <p className="mb-0 text-muted">{inning.remarks || "Not provided"}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
