"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ClipboardList, Edit, Trash2 } from "lucide-react";

export default function MatchScorecardDetailPage() {
    const [row, setRow] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        async function loadRow() {
            try {
                const res = await fetch(`/api/match-scorecard/${params.id}`);
                const json = await res.json();

                if (!res.ok) throw new Error(json.message || "Unable to load scorecard entry.");

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
        if (!confirm("Delete this scorecard entry?")) return;

        setDeleting(true);
        setError(null);

        try {
            const res = await fetch(`/api/match-scorecard/${params.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete scorecard entry.");
            router.push("/next_panel/match-scorecard");
        } catch (err) {
            setError(err.message);
        } finally {
            setDeleting(false);
        }
    };

    const getBatterName = (r) => r?.batter_name?.trim() || r?.batter_outside_name || `Player #${r?.player_id}`;
    const getBowlerName = (r) => r?.bowler_name?.trim() || r?.bowler_outside_name || (r?.bowler_id ? `Player #${r.bowler_id}` : "Not applicable");
    const getFielderName = (r) => r?.fielder_name?.trim() || r?.fielder_outside_name || (r?.fielder_id ? `Player #${r.fielder_id}` : "Not applicable");

    return (
        <div className="container-fluid">
            <div className="row g-4">
                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                            <div>
                                <Link href="/next_panel/match-scorecard" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Match Scorecard
                                </Link>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <ClipboardList size={24} />
                                    <h1 className="h4 mb-0">{row ? getBatterName(row) : "Scorecard Entry"}</h1>
                                </div>
                                <p className="text-muted mb-0">View this batter's innings performance.</p>
                            </div>
                            <div className="d-flex gap-2">
                                <Link href={`/next_panel/match-scorecard/${params.id}/edit`} className="btn btn-primary">
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
                            <div className="text-center py-5 text-muted">Loading scorecard details...</div>
                        ) : error ? (
                            <div className="alert alert-danger">{error}</div>
                        ) : (
                            <div className="row gy-4">
                                <div className="col-md-4">
                                    <h2 className="h6 mb-1">Innings</h2>
                                    <p className="mb-0 text-muted">{row.innings_no === 1 ? "1st Innings" : row.innings_no === 2 ? "2nd Innings" : `Innings #${row.innings_id}`}</p>
                                </div>

                                <div className="col-md-4">
                                    <h2 className="h6 mb-1">Batting Position</h2>
                                    <p className="mb-0 text-muted">{row.batting_position ?? "Not provided"}</p>
                                </div>

                                <div className="col-md-4">
                                    <h2 className="h6 mb-1">How Out</h2>
                                    <p className="mb-0 text-muted">{row.how_out || "Not provided"}</p>
                                </div>

                                <div className="col-md-3 col-6">
                                    <h2 className="h6 mb-1">Runs</h2>
                                    <p className="mb-0 text-muted">{row.runs ?? 0}</p>
                                </div>

                                <div className="col-md-3 col-6">
                                    <h2 className="h6 mb-1">Balls</h2>
                                    <p className="mb-0 text-muted">{row.balls ?? 0}</p>
                                </div>

                                <div className="col-md-3 col-6">
                                    <h2 className="h6 mb-1">4s / 6s</h2>
                                    <p className="mb-0 text-muted">{row.fours ?? 0} / {row.sixes ?? 0}</p>
                                </div>

                                <div className="col-md-3 col-6">
                                    <h2 className="h6 mb-1">Strike Rate</h2>
                                    <p className="mb-0 text-muted">{row.strike_rate ?? 0}</p>
                                </div>

                                <div className="col-md-6">
                                    <h2 className="h6 mb-1">Bowler</h2>
                                    <p className="mb-0 text-muted">{getBowlerName(row)}</p>
                                </div>

                                <div className="col-md-6">
                                    <h2 className="h6 mb-1">Fielder</h2>
                                    <p className="mb-0 text-muted">{getFielderName(row)}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
