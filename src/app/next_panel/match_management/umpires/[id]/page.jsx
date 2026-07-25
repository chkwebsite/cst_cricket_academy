"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2, Users } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";

const umpireFields = [
    ["Email", "email"],
    ["Phone", "phone"],
    ["Experience", "experience"],
];

export default function UmpireDetailPage() {
    const { user } = useAuth();
    const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
    const hasPermission = (permission) => {
        if (Number(user?.role_id) === 1 || Number(user?.role_id) === 7) return true;
        return permissions.includes(permission);
    };
    const [umpire, setUmpire] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        async function loadUmpire() {
            try {
                const umpireRes = await fetch(`/api/umpires/${params.id}`);
                const umpireJson = await umpireRes.json();

                if (!umpireRes.ok) throw new Error(umpireJson.message || "Unable to load umpire.");

                setUmpire(umpireJson.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadUmpire();
    }, [params.id]);

    const handleDelete = async () => {
        if (!confirm("Delete this umpire?")) return;

        setDeleting(true);
        setError(null);

        try {
            const res = await fetch(`/api/umpires/${params.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete umpire.");
            router.push("/next_panel/umpires");
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
                                <Link href="/next_panel/umpires" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Umpires
                                </Link>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <Users size={24} />
                                    <h1 className="h4 mb-0">{umpire?.name || "Umpire Details"}</h1>
                                </div>
                                <p className="text-muted mb-0">View and manage this umpire.</p>
                            </div>
                            <div className="d-flex gap-2">
                                {hasPermission("umpires.edit") && <Link href={`/next_panel/umpires/${params.id}/edit`} className="btn btn-primary">
                                    <Edit size={16} className="me-2" /> Edit
                                </Link>}
                                {hasPermission("umpires.delete") && <button className="btn btn-outline-danger" onClick={handleDelete} disabled={deleting}>
                                    <Trash2 size={16} className="me-2" /> {deleting ? "Deleting..." : "Delete"}
                                </button>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading umpire details...</div>
                        ) : error ? (
                            <div className="alert alert-danger">{error}</div>
                        ) : (
                            <div className="row gy-4">
                                <div className="col-12">
                                    <div className="d-flex flex-wrap align-items-center gap-2">
                                        <span className={`badge ${umpire.status === 1 ? "bg-success" : "bg-secondary"}`}>
                                            {umpire.status === 1 ? "Active" : "Inactive"}
                                        </span>
                                        <span className="text-muted small">ID: {umpire.id}</span>
                                    </div>
                                </div>

                                {umpireFields.map(([label, key]) => (
                                    <div className="col-md-6" key={key}>
                                        <h2 className="h6 mb-1">{label}</h2>
                                        <p className="mb-0 text-muted">{umpire[key] || "Not provided"}</p>
                                    </div>
                                ))}

                                <div className="col-12">
                                    <h2 className="h6 mb-1">About</h2>
                                    <p className="mb-0 text-muted">{umpire.about || "Not provided"}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
