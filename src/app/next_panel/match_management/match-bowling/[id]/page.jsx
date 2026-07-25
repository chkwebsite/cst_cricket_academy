"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Target, Trash2 } from "lucide-react";

export default function MatchBowlingDetailPage() {
    const [row, setRow] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        async function loadRow() {
            try {
                const res = await fetch(`/api/match-bowling/${params.id}`);
                const json = await res.json();

                if (!res.ok) throw new Error(json.message || "Unable to load bowling record.");

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
        if (!confirm("Delete this bowling record?")) return;

        setDeleting(true);
        setError(null);

        try {
            const res = await fetch(`/api/match-bowling/${params.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete bowling record.");
            router.push("/next_panel/match-bowling");
        } catch (err) {
            setError(err.message);
        } finally {
            setDeleting(false);
        }
    };

    const getBowlerName = (r) => r?.academy_player?.trim() || r?.outside_player || `Player #${r?.bowler_id}`;

    return (
        <div className="container-fluid">
            <div className="row g-4">
                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                            <div>
                                <Link href="/next_panel/match-bowling" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Match Bowling
                                </Link>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <Target size={24} />
                                    <h1 className="h4 mb-0">{row ? getBowlerName(row) : "Bowling Record"}</h1>
                                </div>
                                <p className="text-muted mb-0">View this bowler's innings figures.</p>
                            </div>
                            <div className="d-flex gap-2">
                                <Link href={`/next_panel/match-bowling/${params.id}/edit`} className="btn btn-primary">
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
                            <div className="text-center py-5 text-muted">Loading bowling record details...</div>
                        ) : error ? (
                            <div className="alert alert-danger">{error}</div>
                        ) : (
                            <div className="row gy-4">
                                <div className="col-md-6">
                                    <h2 className="h6 mb-1">Innings</h2>
                                    <p className="mb-0 text-muted">{row.innings_no === 1 ? "1st Innings" : row.innings_no === 2 ? "2nd Innings" : `Innings #${row.innings_id}`}</p>
                                </div>

                                <div className="col-md-6">
                                    <h2 className="h6 mb-1">Bowler</h2>
                                    <p className="mb-0 text-muted">{getBowlerName(row)}</p>
                                </div>

                                <div className="col-md-3 col-6">
                                    <h2 className="h6 mb-1">Overs</h2>
                                    <p className="mb-0 text-muted">{row.overs ?? 0}</p>
                                </div>

                                <div className="col-md-3 col-6">
                                    <h2 className="h6 mb-1">Maidens</h2>
                                    <p className="mb-0 text-muted">{row.maidens ?? 0}</p>
                                </div>

                                <div className="col-md-3 col-6">
                                    <h2 className="h6 mb-1">Runs</h2>
                                    <p className="mb-0 text-muted">{row.runs ?? 0}</p>
                                </div>

                                <div className="col-md-3 col-6">
                                    <h2 className="h6 mb-1">Wickets</h2>
                                    <p className="mb-0 text-muted">{row.wickets ?? 0}</p>
                                </div>

                                <div className="col-md-4">
                                    <h2 className="h6 mb-1">Wides</h2>
                                    <p className="mb-0 text-muted">{row.wides ?? 0}</p>
                                </div>

                                <div className="col-md-4">
                                    <h2 className="h6 mb-1">No Balls</h2>
                                    <p className="mb-0 text-muted">{row.no_balls ?? 0}</p>
                                </div>

                                <div className="col-md-4">
                                    <h2 className="h6 mb-1">Economy</h2>
                                    <p className="mb-0 text-muted">{row.economy ?? 0}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

