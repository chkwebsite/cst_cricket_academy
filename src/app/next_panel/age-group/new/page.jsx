"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import AgeGroupForm, { getEmptyAgeGroup, normalizeAgeGroupPayload } from "../AgeGroupForm";

export default function NewAgeGroupPage() {
    const [values, setValues] = useState(getEmptyAgeGroup());
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const res = await fetch("/api/age_groups", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(normalizeAgeGroupPayload(values)),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to create age group.");
            router.push("/next_panel/age-group");
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
                                <Link href="/next_panel/age-group" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Age Groups
                                </Link>
                                <h1 className="h4 mb-2">Create Age Group</h1>
                                <p className="text-muted mb-0">Add a new player age group bracket.</p>
                            </div>
                            <button className="btn btn-primary" type="submit" form="ageGroupForm" disabled={saving}>
                                <Plus size={16} className="me-2" /> {saving ? "Saving..." : "Save Age Group"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        <AgeGroupForm
                            formId="ageGroupForm"
                            values={values}
                            onChange={setValues}
                            onSubmit={handleSubmit}
                            error={error}
                            loading={saving}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
