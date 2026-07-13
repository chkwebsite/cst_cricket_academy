"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Edit, Plus, Trash2, Trophy } from "lucide-react";
import { getUserName } from "./ProfileForm";
import { useAuth } from "@/components/utils/AuthContext";

export default function ProfilePage() {
    const { user } = useAuth();
    const [coachingProgram, setCoachingProgram] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadProfiles() {
            try {
                const cpRes = await fetch("/api/coaching-program");
                const cpJson = await cpRes.json();

                if (!cpRes.ok || !cpJson.success) throw new Error(cpJson.message || "Unable to load coaching programs.");

                setCoachingProgram(cpJson.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadProfiles();
    }, []);

    const handleDelete = async (cp) => {
        if (!confirm(`Delete coaching program "${cp.title}"?`)) return;

        setDeletingId(cp.id);
        setError(null);

        try {
            const res = await fetch(`/api/coaching-program/${cp.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message || "Unable to delete coaching program.");
            setCoachingProgram((current) => current.filter((item) => item.id !== cp.id));
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
                                    <Trophy size={24} />
                                    <h1 className="h4 mb-0">Coaching Programs</h1>
                                </div>
                                <p className="text-muted mb-0">Manage academy coaching programs, schedules, seats, and fees.</p>
                            </div>

                            {user.permissions.includes("coaching_program.create") && <Link href="/next_panel/coaching_program/new" className="btn btn-primary fw-semibold">
                                <Plus size={16} className="me-2" /> New Coaching Program
                            </Link>}
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-3">
                        {error && <div className="alert alert-danger">{error}</div>}

                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading coaching programs...</div>
                        ) : coachingProgram.length === 0 ? (
                            <div className="text-center py-5 text-muted">No coaching programs found yet.</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th scope="col">Title</th>
                                            <th scope="col">Designation</th>
                                            <th scope="col">Branch</th>
                                            <th scope="col">Start Date</th>
                                            <th scope="col">Age Group</th>
                                            <th scope="col">Seats</th>
                                            <th scope="col">Status</th>
                                            <th scope="col" className="text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {coachingProgram.map((cp) => (
                                            <tr key={cp.id}>
                                                <td>
                                                    <div className="fw-semibold">{cp.title}</div>
                                                    <small className="text-muted">{getUserName(cp) || `User #${cp.user_id}`}</small>
                                                </td>
                                                <td>{cp.designation || "Not provided"}</td>
                                                <td>{cp.branch_name || "Not provided"}</td>
                                                <td className="text-muted">{cp.start_date ? String(cp.start_date).slice(0, 10) : "Not provided"}</td>
                                                <td>{cp.age_group || "Not provided"}</td>
                                                <td>{cp.available_seats ?? 0}/{cp.total_seats ?? 0}</td>
                                                <td>
                                                    <span className={`badge ${Number(cp.status) === 1 ? "bg-success" : "bg-secondary"}`}>
                                                        {Number(cp.status) === 1 ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td className="text-end">
                                                    <div className="btn-group btn-group-sm" role="group">
                                                        <Link href={`/next_panel/coaching_program/${cp.id}`} className="btn btn-outline-primary" aria-label="View coaching program">
                                                            <ArrowUpRight size={16} />
                                                        </Link>
                                                        {user.permissions.includes("coaching_program.edit") && (
                                                            <Link href={`/next_panel/coaching_program/${cp.id}/edit`} className="btn btn-outline-secondary" aria-label="Edit coaching program">
                                                                <Edit size={16} />
                                                            </Link>
                                                        )}
                                                        {user.permissions.includes("coaching_program.delete") && (
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-danger"
                                                                onClick={() => handleDelete(cp)}
                                                                disabled={deletingId === cp.id}
                                                                aria-label="Delete coaching program"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
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
