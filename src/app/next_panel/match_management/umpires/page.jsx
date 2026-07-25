"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Edit, Plus, Trash2, Users } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";

export default function UmpirePage() {
    const { user } = useAuth();
    const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
    const hasPermission = (permission) => {
        if (Number(user?.role_id) === 1 || Number(user?.role_id) === 7) return true;
        return permissions.includes(permission);
    };
    const [umpires, setUmpires] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadUmpires() {
            try {
                const umpireRes = await fetch("/api/umpires");
                const umpireJson = await umpireRes.json();

                if (!umpireRes.ok) throw new Error(umpireJson.message || "Unable to load umpires.");

                setUmpires(umpireJson.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadUmpires();
    }, []);

    const handleDelete = async (umpire) => {
        if (!confirm(`Delete umpire "${umpire.name}"?`)) return;

        setDeletingId(umpire.id);
        setError(null);

        try {
            const res = await fetch(`/api/umpires/${umpire.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete umpire.");
            setUmpires((current) => current.filter((item) => item.id !== umpire.id));
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
                                    <Users size={24} />
                                    <h1 className="h4 mb-0">Umpires</h1>
                                </div>
                                <p className="text-muted mb-0">Manage umpire contact details and experience.</p>
                            </div>

                            {hasPermission("umpires.create") &&
                                <Link href="/next_panel/umpires/new" className="btn btn-primary fw-semibold">
                                    <Plus size={16} className="me-2" /> New Umpire
                                </Link>
                            }
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-3">
                        {error && <div className="alert alert-danger">{error}</div>}

                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading umpires...</div>
                        ) : umpires.length === 0 ? (
                            <div className="text-center py-5 text-muted">No umpires found yet.</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th scope="col">Umpire</th>
                                            <th scope="col">Email</th>
                                            <th scope="col">Phone</th>
                                            <th scope="col">Experience</th>
                                            <th scope="col">Status</th>
                                            <th scope="col" className="text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {umpires.map((umpire) => (
                                            <tr key={umpire.id}>
                                                <td className="fw-semibold">{umpire.name}</td>
                                                <td className="text-muted">{umpire.email}</td>
                                                <td className="text-muted">{umpire.phone}</td>
                                                <td className="text-muted">{umpire.experience || "Not provided"}</td>
                                                <td>
                                                    <span className={`badge ${umpire.status === 1 ? "bg-success" : "bg-secondary"}`}>
                                                        {umpire.status === 1 ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td className="text-end">
                                                    <div className="btn-group btn-group-sm" role="group">
                                                        <Link href={`/next_panel/umpires/${umpire.id}`} className="btn btn-outline-primary" aria-label="View umpire">
                                                            <ArrowUpRight size={16} />
                                                        </Link>

                                                        {hasPermission("umpires.edit") && <Link href={`/next_panel/umpires/${umpire.id}/edit`} className="btn btn-outline-secondary" aria-label="Edit umpire">
                                                            <Edit size={16} />
                                                        </Link>}
                                                        {hasPermission("umpires.delete") &&
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-danger"
                                                                onClick={() => handleDelete(umpire)}
                                                                disabled={deletingId === umpire.id}
                                                                aria-label="Delete umpire"
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
