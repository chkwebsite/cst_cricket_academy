"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import ExpertForm, { buildExpertFormData, expertToFormValues, getEmptyExpert } from "../../ExpertForm";

export default function EditExpertPage() {
    const [values, setValues] = useState(getEmptyExpert());
    const [branches, setBranches] = useState([]);
    const [existingImage, setExistingImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        async function loadData() {
            try {
                const [expertRes, branchesRes] = await Promise.all([
                    fetch(`/api/experts/${params.id}`),
                    fetch("/api/branch"),
                ]);
                const expertJson = await expertRes.json();
                const branchesJson = await branchesRes.json();

                if (!expertRes.ok) throw new Error(expertJson.message || "Unable to load expert.");
                if (!branchesRes.ok) throw new Error(branchesJson.message || "Unable to load branches.");

                setValues(expertToFormValues(expertJson.data));
                setExistingImage(expertJson.data.profile_image || null);
                setBranches(branchesJson.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [params.id]);

    const handleChange = (nextValues) => {
        if (preview) URL.revokeObjectURL(preview);
        setValues(nextValues);
        setPreview(nextValues.profile_image instanceof File ? URL.createObjectURL(nextValues.profile_image) : null);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const res = await fetch(`/api/experts/${params.id}`, {
                method: "PUT",
                body: buildExpertFormData(values),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to update expert.");
            router.push(`/next_panel/experts/${params.id}`);
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
                                <Link href="/next_panel/experts" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Experts
                                </Link>
                                <h1 className="h4 mb-2">Edit Expert</h1>
                                <p className="text-muted mb-0">Update expert details and image.</p>
                            </div>
                            <button className="btn btn-primary" type="submit" form="expertEditForm" disabled={saving || loading}>
                                <Save size={16} className="me-2" /> {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading expert details...</div>
                        ) : (
                            <ExpertForm
                                formId="expertEditForm"
                                values={values}
                                branches={branches}
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
