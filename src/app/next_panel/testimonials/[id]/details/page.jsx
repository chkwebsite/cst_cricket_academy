"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, MessageSquareQuote, Star, Trash2 } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";

const fields = [
    ["Parent Name", "parent_name"],
    ["Designation", "designation"],
    ["Email", "email"],
    ["Contact", "contact"],
    ["Presented", "presented"],
    ["Branch", "branch_name"],
    ["Display Order", "display_order"],
    ["Video URL", "video_url"],
];

export default function TestimonialDetailPage() {
    const { user } = useAuth();
    const [testimonial, setTestimonial] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        async function loadTestimonial() {
            try {
                const res = await fetch(`/api/testimonials/${params.id}`);
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || "Unable to load testimonial.");
                setTestimonial(json.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadTestimonial();
    }, [params.id]);

    const handleDelete = async () => {
        if (!confirm("Delete this testimonial?")) return;

        setDeleting(true);
        setError(null);

        try {
            const res = await fetch(`/api/testimonials/${params.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete testimonial.");
            router.push("/next_panel/testimonials");
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
                                <Link href="/next_panel/testimonials" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Testimonials
                                </Link>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <MessageSquareQuote size={24} />
                                    <h1 className="h4 mb-0">{testimonial?.student_name || "Testimonial Details"}</h1>
                                </div>
                                <p className="text-muted mb-0">View and manage this testimonial.</p>
                            </div>
                            <div className="d-flex gap-2">
                                {user.permissions.includes("testimonials.edit") && <Link href={`/next_panel/testimonials/${params.id}/edit`} className="btn btn-primary">
                                    <Edit size={16} className="me-2" /> Edit
                                </Link>}
                                {user.permissions.includes("testimonials.delete") && <button className="btn btn-outline-danger" onClick={handleDelete} disabled={deleting}>
                                    <Trash2 size={16} className="me-2" /> {deleting ? "Deleting..." : "Delete"}
                                </button>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading testimonial details...</div>
                        ) : error ? (
                            <div className="alert alert-danger">{error}</div>
                        ) : (
                            <div className="row gy-4">
                                <div className="col-md-4 text-center">
                                    <img
                                        src={testimonial.profile_image || "/images/cst_white.png"}
                                        alt={testimonial.student_name}
                                        className="img-fluid rounded-circle border mb-3"
                                        style={{ width: 170, height: 170, objectFit: "cover" }}
                                    />
                                    <h2 className="h5 mb-1">{testimonial.student_name}</h2>
                                    <p className="text-muted mb-2">{testimonial.designation}</p>
                                    <div className="d-flex justify-content-center align-items-center gap-2 mb-2">
                                        <span className="d-inline-flex align-items-center gap-1">
                                            <Star size={16} className="text-warning" fill="currentColor" /> {testimonial.rating ?? 0}
                                        </span>
                                        {Number(testimonial.featured) === 1 && (
                                            <span className="badge bg-info text-dark">Featured</span>
                                        )}
                                    </div>
                                    <span className={`badge ${Number(testimonial.status) === 1 ? "bg-success" : "bg-secondary"}`}>
                                        {Number(testimonial.status) === 1 ? "Active" : "Inactive"}
                                    </span>
                                </div>

                                <div className="col-md-8">
                                    <div className="row g-3">
                                        {fields.map(([label, key]) => (
                                            <div className="col-md-6" key={key}>
                                                <h3 className="h6 mb-1">{label}</h3>
                                                <p className="mb-0 text-muted">{testimonial[key] || "Not provided"}</p>
                                            </div>
                                        ))}

                                        <div className="col-12">
                                            <h3 className="h6 mb-1">Testimonial</h3>
                                            <p className="mb-0 text-muted"
                                                dangerouslySetInnerHTML={{ __html: testimonial.testimonial }}></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

