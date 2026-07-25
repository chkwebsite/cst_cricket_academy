"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import TestimonialForm, { buildTestimonialFormData, getEmptyTestimonial } from "../TestimonialForm";

export default function NewTestimonialPage() {
    const [values, setValues] = useState(getEmptyTestimonial());
    const [preview, setPreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [users, setUsers] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
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
            const res = await fetch("/api/testimonials", {
                method: "POST",
                body: buildTestimonialFormData(values),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to create testimonial.");
            router.push("/next_panel/testimonials");
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
                                <h1 className="h4 mb-2">Create Testimonial</h1>
                                <p className="text-muted mb-0">Add a new student or parent testimonial.</p>
                            </div>
                            <button className="btn btn-primary" type="submit" form="testimonialForm" disabled={saving}>
                                <Plus size={16} className="me-2" /> {saving ? "Saving..." : "Save Testimonial"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        <TestimonialForm
                            formId="testimonialForm"
                            users={users}
                            branches={branches}
                            values={values}
                            onChange={handleChange}
                            onSubmit={handleSubmit}
                            error={error}
                            loading={saving}
                            imagePreview={preview}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
