"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import CoFounderForm, { buildCoFounderFormData, getEmptyCoFounder } from "../CoFounderForm";

export default function NewCoFounderPage() {
    const [values, setValues] = useState(getEmptyCoFounder());
    const [preview, setPreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

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
            const res = await fetch("/api/co-founders", {
                method: "POST",
                body: buildCoFounderFormData(values),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to create co-founder.");
            router.push("/next_panel/co-founders");
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
                                <h1 className="h4 mb-2">Create Co-Founder</h1>
                                <p className="text-muted mb-0">Add a new academy leadership profile.</p>
                            </div>
                            <button className="btn btn-primary" type="submit" form="coFounderForm" disabled={saving}>
                                <Plus size={16} className="me-2" /> {saving ? "Saving..." : "Save Co-Founder"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        <CoFounderForm
                            formId="coFounderForm"
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
