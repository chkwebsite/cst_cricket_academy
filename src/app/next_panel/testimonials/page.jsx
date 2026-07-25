"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Edit, MessageSquareQuote, Plus, Star, Trash2 } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";

export default function TestimonialsPage() {
    const { user } = useAuth();
    const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
    const hasPermission = (permission) => {
        if (Number(user?.role_id) === 1 || Number(user?.role_id) === 7) return true;
        return permissions.includes(permission);
    };

    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadTestimonials() {
            try {
                const res = await fetch("/api/testimonials");
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || "Unable to load testimonials.");
                setTestimonials(json.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadTestimonials();
    }, []);

    const handleDelete = async (testimonial) => {
        if (!confirm(`Delete testimonial from "${testimonial.student_name}"?`)) return;

        setDeletingId(testimonial.id);
        setError(null);

        try {
            const res = await fetch(`/api/testimonials/${testimonial.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete testimonial.");
            setTestimonials((current) => current.filter((item) => item.id !== testimonial.id));
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
                                    <MessageSquareQuote size={24} />
                                    <h1 className="h4 mb-0">Testimonials</h1>
                                </div>
                                <p className="text-muted mb-0">Manage student and parent testimonials shown across the academy.</p>
                            </div>
                            {hasPermission("testimonials.create") &&
                                <Link href="/next_panel/testimonials/new" className="btn btn-primary fw-semibold">
                                    <Plus size={16} className="me-2" /> New Testimonial
                                </Link>
                            }
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-3">
                        {error && <div className="alert alert-danger">{error}</div>}

                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading testimonials...</div>
                        ) : testimonials.length === 0 ? (
                            <div className="text-center py-5 text-muted">No testimonials found yet.</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th scope="col">Student</th>
                                            <th scope="col">Branch</th>
                                            <th scope="col">Rating</th>
                                            <th scope="col">Featured</th>
                                            <th scope="col">Order</th>
                                            <th scope="col">Status</th>
                                            <th scope="col" className="text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {testimonials.map((testimonial) => (
                                            <tr key={testimonial.id}>
                                                <td>
                                                    <div className="d-flex align-items-center gap-3">
                                                        <img
                                                            src={testimonial.profile_image || "/images/cst_white.png"}
                                                            alt={testimonial.student_name}
                                                            className="rounded-circle border"
                                                            width="48"
                                                            height="48"
                                                            style={{ objectFit: "cover" }}
                                                        />
                                                        <div>
                                                            <div className="fw-semibold">{testimonial.student_name}</div>
                                                            <small className="text-muted">{testimonial.parent_name ? `Parent: ${testimonial.parent_name}` : "No parent name"}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-muted">{testimonial.branch_name || "Not assigned"}</td>
                                                <td>
                                                    <span className="d-inline-flex align-items-center gap-1">
                                                        <Star size={14} className="text-warning" fill="currentColor" /> {testimonial.rating ?? 0}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${Number(testimonial.featured) === 1 ? "bg-info text-dark" : "bg-light text-muted border"}`}>
                                                        {Number(testimonial.featured) === 1 ? "Featured" : "Standard"}
                                                    </span>
                                                </td>
                                                <td>{testimonial.display_order ?? 0}</td>
                                                <td>
                                                    <span className={`badge ${Number(testimonial.status) === 1 ? "bg-success" : "bg-secondary"}`}>
                                                        {Number(testimonial.status) === 1 ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td className="text-end">
                                                    <div className="btn-group btn-group-sm" role="group">

                                                        {/* View */}
                                                        {hasPermission("testimonials.view") && (
                                                            <Link
                                                                href={`/next_panel/testimonials/${testimonial.id}/details`}
                                                                className="btn btn-outline-primary"
                                                                aria-label="View testimonial"
                                                            >
                                                                <ArrowUpRight size={16} />
                                                            </Link>
                                                        )}

                                                        {/* Edit */}
                                                        {hasPermission("testimonials.edit") && (
                                                            <Link
                                                                href={`/next_panel/testimonials/${testimonial.id}/edit`}
                                                                className="btn btn-outline-secondary"
                                                                aria-label="Edit testimonial"
                                                            >
                                                                <Edit size={16} />
                                                            </Link>
                                                        )}

                                                        {/* Delete */}
                                                        {hasPermission("testimonials.delete") && (
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-danger"
                                                                onClick={() => handleDelete(testimonial)}
                                                                disabled={deletingId === testimonial.id}
                                                                aria-label="Delete testimonial"
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
