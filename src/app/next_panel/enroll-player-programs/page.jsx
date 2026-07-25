"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Edit, GraduationCap, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";

export default function EnrollmentPage() {
    const { user: userInfo } = useAuth();
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState(null);

    const loadEnrollments = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/enroll-player-programs?include_inactive=1");
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to load enrollments.");
            setEnrollments(json.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadEnrollments();
    }, []);

    const handleDelete = async (enrollment) => {
        if (!confirm(`Delete enrollment "${enrollment.enrollment_no}"?`)) return;

        setDeletingId(enrollment.id);
        setError(null);

        try {
            const res = await fetch(`/api/enroll-player-programs/${enrollment.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete enrollment.");
            setEnrollments((current) => current.filter((item) => item.id !== enrollment.id));
        } catch (err) {
            setError(err.message);
        } finally {
            setDeletingId(null);
        }
    };

    const statusBadge = (status) => {
        const map = {
            Active: "bg-success",
            Completed: "bg-primary",
            Hold: "bg-warning text-dark",
            Cancelled: "bg-secondary",
        };
        return map[status] || "bg-secondary";
    };

    return (
        <div className="container-fluid">
            <div className="row g-4">
                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                            <div>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <GraduationCap size={24} />
                                    <h1 className="h4 mb-0">Player Enrollments</h1>
                                </div>
                                <p className="text-muted mb-0">Manage player enrollments into coaching programs.</p>
                            </div>

                            {(userInfo?.permissions?.includes("enroll-player.create") ?? true) && (
                                <Link href="/next_panel/enroll-player-programs/new" className="btn btn-primary fw-semibold">
                                    <Plus size={16} className="me-2" /> New Enrollment
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-3">
                        {error && <div className="alert alert-danger">{error}</div>}

                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading enrollments...</div>
                        ) : enrollments.length === 0 ? (
                            <div className="text-center py-5 text-muted">No enrollments found yet.</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th scope="col">Enrollment No</th>
                                            <th scope="col">Student</th>
                                            <th scope="col">Branch</th>
                                            <th scope="col">Program</th>
                                            <th scope="col">Age Group</th>
                                            <th scope="col">Coach</th>
                                            <th scope="col">Final Fee</th>
                                            <th scope="col">Status</th>
                                            <th scope="col" className="text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {enrollments.map((enrollment) => (
                                            <tr key={enrollment.id}>
                                                <td className="fw-semibold">{enrollment.enrollment_no}</td>
                                                <td>
                                                    <div>{enrollment.student_name || "—"}</div>
                                                    <small className="text-muted">{enrollment.admission_no}</small>
                                                </td>
                                                <td>{enrollment.branch_name || "—"}</td>
                                                <td>{enrollment.program_name || "—"}</td>
                                                <td>{enrollment.age_group || "—"}</td>
                                                <td>{enrollment.coach_name || "—"}</td>
                                                <td>{enrollment.final_fee ?? "—"}</td>
                                                <td>
                                                    <span className={`badge ${statusBadge(enrollment.status)}`}>
                                                        {enrollment.status || "Unknown"}
                                                    </span>
                                                </td>
                                                <td className="text-end">
                                                    <div className="btn-group btn-group-sm" role="group">
                                                        <Link href={`/next_panel/enroll-player-programs/${enrollment.id}`} className="btn btn-outline-primary" aria-label="View enrollment">
                                                            <ArrowUpRight size={16} />
                                                        </Link>
                                                        {(userInfo?.permissions?.includes("enroll-player.edit") ?? true) && (
                                                            <Link href={`/next_panel/enroll-player-programs/${enrollment.id}/edit`} className="btn btn-outline-secondary" aria-label="Edit enrollment">
                                                                <Edit size={16} />
                                                            </Link>
                                                        )}
                                                        {(userInfo?.permissions?.includes("enroll-player.delete") ?? true) && (
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-danger"
                                                                onClick={() => handleDelete(enrollment)}
                                                                disabled={deletingId === enrollment.id}
                                                                aria-label="Delete enrollment"
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
