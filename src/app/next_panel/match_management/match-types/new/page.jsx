"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import MatchTypeForm, { getEmptyMatchType, normalizeMatchTypePayload } from "../MatchTypeForm";

export default function NewMatchTypePage() {
    const [values, setValues] = useState(getEmptyMatchType());
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const res = await fetch("/api/match-types", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(normalizeMatchTypePayload(values)),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to create match type.");
            router.push("/next_panel/match-types");
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
                                <Link href="/next_panel/match-types" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Match Types
                                </Link>
                                <h1 className="h4 mb-2">Create Match Type</h1>
                                <p className="text-muted mb-0">Add a new match type.</p>
                            </div>
                            <button className="btn btn-primary" type="submit" form="matchTypeForm" disabled={saving}>
                                <Plus size={16} className="me-2" /> {saving ? "Saving..." : "Save Match Type"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        <MatchTypeForm
                            formId="matchTypeForm"
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
