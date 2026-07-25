"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import ExpertForm, { buildExpertFormData, getEmptyExpert } from "../ExpertForm";

export default function NewExpertPage() {
    const [values, setValues] = useState(getEmptyExpert());
    const [branches, setBranches] = useState([]);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        async function loadBranches() {
            try {
                const res = await fetch("/api/branch");
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || "Unable to load branches.");
                setBranches(json.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadBranches();
    }, []);

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
            const res = await fetch("/api/experts", {
                method: "POST",
                body: buildExpertFormData(values),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to create expert.");
            router.push("/next_panel/experts");
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
                                <h1 className="h4 mb-2">Create Expert</h1>
                                <p className="text-muted mb-0">Add a new expert profile.</p>
                            </div>
                            <button className="btn btn-primary" type="submit" form="expertForm" disabled={saving || loading}>
                                <Plus size={16} className="me-2" /> {saving ? "Saving..." : "Save Expert"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading branches...</div>
                        ) : (
                            <ExpertForm
                                formId="expertForm"
                                values={values}
                                branches={branches}
                                onChange={handleChange}
                                onSubmit={handleSubmit}
                                error={error}
                                loading={saving}
                                imagePreview={preview}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
