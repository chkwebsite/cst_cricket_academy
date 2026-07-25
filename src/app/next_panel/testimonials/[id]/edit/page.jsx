"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import TestimonialForm, { buildTestimonialFormData, testimonialToFormValues, getEmptyTestimonial } from "../../TestimonialForm";

export default function EditTestimonialPage() {
    const [values, setValues] = useState(getEmptyTestimonial());
    const [existingImage, setExistingImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [branches, setBranches] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const params = useParams();
    const router = useRouter();
    useEffect(() => {
        async function loadFormData() {
            try {
                const [usersRes, branchesRes] = await Promise.all([
                    fetch("/api/users"),
                    fetch("/api/branch"),
                ]);
                const usersJson = await usersRes.json();
                const branchesJson = await branchesRes.json();

                if (!usersRes.ok) throw new Error(usersJson.message || "Unable to load users.");
                if (!branchesRes.ok) throw new Error(branchesJson.message || "Unable to load branches.");

                setUsers(usersJson.data || []);
                setBranches(branchesJson.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadFormData();
    }, []);
    useEffect(() => {
        async function loadTestimonial() {
            try {
                const res = await fetch(`/api/testimonials/${params.id}`);
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || "Unable to load testimonial.");
                setValues(testimonialToFormValues(json.data));
                setExistingImage(json.data.profile_image || null);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadTestimonial();
    }, [params.id]);

    const handleChange = (nextValues) => {
        if (preview) URL.revokeObjectURL(preview);
        setValues(nextValues);
        setPreview(nextValues.profile_image instanceof File ? URL.createObjectURL(nextValues.profile_image) : null);
    };

    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const res = await fetch(`/api/testimonials/${params.id}`, {
                method: "PUT",
                body: buildTestimonialFormData(values),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to update testimonial.");
            router.push(`/next_panel/testimonials/${params.id}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
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
                                <h1 className="h4 mb-2">Edit Testimonial</h1>
                                <p className="text-muted mb-0">Update this testimonial.</p>
                            </div>
                            <button className="btn btn-primary" type="submit" form="testimonialEditForm" disabled={saving || loading}>
                                <Save size={16} className="me-2" /> {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading testimonial details...</div>
                        ) : (
                            <TestimonialForm
                                formId="testimonialEditForm"
                                values={values}
                                onChange={handleChange}
                                onSubmit={handleSubmit}
                                error={error}
                                loading={saving}
                                users={users}
                                branches={branches}
                                imagePreview={preview}
                                existingImage={existingImage}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
