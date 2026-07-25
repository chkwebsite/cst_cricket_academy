"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import CoFounderForm, { buildCoFounderFormData, coFounderToFormValues, getEmptyCoFounder } from "../../CoFounderForm";

export default function EditCoFounderPage() {
    const [values, setValues] = useState(getEmptyCoFounder());
    const [existingImage, setExistingImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        async function loadCoFounder() {
            try {
                const res = await fetch(`/api/co-founders/${params.id}`);
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || "Unable to load co-founder.");
                setValues(coFounderToFormValues(json.data));
                setExistingImage(json.data.profile_image || null);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadCoFounder();
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
            const res = await fetch(`/api/co-founders/${params.id}`, {
                method: "PUT",
                body: buildCoFounderFormData(values),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to update co-founder.");
            router.push(`/next_panel/co-founders/${params.id}`);
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
                                <Link href="/next_panel/co-founders" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Co-Founders
                                </Link>
                                <h1 className="h4 mb-2">Edit Co-Founder</h1>
                                <p className="text-muted mb-0">Update this leadership profile.</p>
                            </div>
                            <button className="btn btn-primary" type="submit" form="coFounderEditForm" disabled={saving || loading}>
                                <Save size={16} className="me-2" /> {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading co-founder details...</div>
                        ) : (
                            <CoFounderForm
                                formId="coFounderEditForm"
                                values={values}
                                onChange={handleChange}
                                onSubmit={handleSubmit}
                                error={error}
                                loading={saving}
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
