"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2, ListChecks } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";

export default function MatchTypeDetailPage() {
    const { user } = useAuth();
    const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
    const hasPermission = (permission) => {
        if (Number(user?.role_id) === 1 || Number(user?.role_id) === 7) return true;
        return permissions.includes(permission);
    };
    const [matchType, setMatchType] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        async function loadMatchType() {
            try {
                const matchTypeRes = await fetch(`/api/match-types/${params.id}`);
                const matchTypeJson = await matchTypeRes.json();

                if (!matchTypeRes.ok) throw new Error(matchTypeJson.message || "Unable to load match type.");

                setMatchType(matchTypeJson.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadMatchType();
    }, [params.id]);

    const handleDelete = async () => {
        if (!confirm("Delete this match type?")) return;

        setDeleting(true);
        setError(null);

        try {
            const res = await fetch(`/api/match-types/${params.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete match type.");
            router.push("/next_panel/match-types");
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
                                <Link href="/next_panel/match-types" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Match Types
                                </Link>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <ListChecks size={24} />
                                    <h1 className="h4 mb-0">{matchType?.match_type || "Match Type Details"}</h1>
                                </div>
                                <p className="text-muted mb-0">View and manage this match type.</p>
                            </div>
                            <div className="d-flex gap-2">
                                {hasPermission("match_types.edit") && <Link href={`/next_panel/match-types/${params.id}/edit`} className="btn btn-primary">
                                    <Edit size={16} className="me-2" /> Edit
                                </Link>}
                                {hasPermission("match_types.delete") && <button className="btn btn-outline-danger" onClick={handleDelete} disabled={deleting}>
                                    <Trash2 size={16} className="me-2" /> {deleting ? "Deleting..." : "Delete"}
                                </button>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading match type details...</div>
                        ) : error ? (
                            <div className="alert alert-danger">{error}</div>
                        ) : (
                            <div className="row gy-4">
                                <div className="col-12">
                                    <div className="d-flex flex-wrap align-items-center gap-2">
                                        <span className={`badge ${matchType.status === 1 ? "bg-success" : "bg-secondary"}`}>
                                            {matchType.status === 1 ? "Active" : "Inactive"}
                                        </span>
                                        <span className="text-muted small">ID: {matchType.id}</span>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <h2 className="h6 mb-1">Match Type</h2>
                                    <p className="mb-0 text-muted">{matchType.match_type || "Not provided"}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

