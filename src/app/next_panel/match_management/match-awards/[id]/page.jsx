"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Award, Edit, Trash2 } from "lucide-react";

export default function MatchAwardDetailPage() {
    const [row, setRow] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        async function loadRow() {
            try {
                const res = await fetch(`/api/match-awards/${params.id}`);
                const json = await res.json();

                if (!res.ok) throw new Error(json.message || "Unable to load award.");

                setRow(json.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadRow();
    }, [params.id]);

    const handleDelete = async () => {
        if (!confirm("Delete this award?")) return;

        setDeleting(true);
        setError(null);

        try {
            const res = await fetch(`/api/match-awards/${params.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete award.");
            router.push("/next_panel/match-awards");
        } catch (err) {
            setError(err.message);
        } finally {
            setDeleting(false);
        }
    };

    const getPlayerName = (r) => r?.academy_player?.trim() || r?.outside_player || `Player #${r?.player_id}`;

    return (
        <div className="container-fluid">
            <div className="row g-4">
                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                            <div>
                                <Link href="/next_panel/match-awards" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Match Awards
                                </Link>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <Award size={24} />
                                    <h1 className="h4 mb-0">{row?.award_type || "Award Details"}</h1>
                                </div>
                                <p className="text-muted mb-0">View this award's details.</p>
                            </div>
                            <div className="d-flex gap-2">
                                <Link href={`/next_panel/match-awards/${params.id}/edit`} className="btn btn-primary">
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
                            <div className="text-center py-5 text-muted">Loading award details...</div>
                        ) : error ? (
                            <div className="alert alert-danger">{error}</div>
                        ) : (
                            <div className="row gy-4">
                                <div className="col-md-4">
                                    <h2 className="h6 mb-1">Match</h2>
                                    <p className="mb-0 text-muted">{row.match_no ? `Match #${row.match_no}` : `Match #${row.match_id}`}</p>
                                </div>

                                <div className="col-md-4">
                                    <h2 className="h6 mb-1">Award Type</h2>
                                    <p className="mb-0 text-muted">{row.award_type}</p>
                                </div>

                                <div className="col-md-4">
                                    <h2 className="h6 mb-1">Player</h2>
                                    <p className="mb-0 text-muted">{getPlayerName(row)}</p>
                                </div>

                                <div className="col-12">
                                    <h2 className="h6 mb-1">Remarks</h2>
                                    <p className="mb-0 text-muted">{row.remarks || "Not provided"}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
