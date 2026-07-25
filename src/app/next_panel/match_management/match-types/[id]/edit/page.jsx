"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import MatchTypeForm, { getEmptyMatchType, normalizeMatchTypePayload, matchTypeToFormValues } from "../../MatchTypeForm";

export default function EditMatchTypePage() {
    const [values, setValues] = useState(getEmptyMatchType());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        async function loadData() {
            try {
                const matchTypeRes = await fetch(`/api/match-types/${params.id}`);
                const matchTypeJson = await matchTypeRes.json();

                if (!matchTypeRes.ok) throw new Error(matchTypeJson.message || "Unable to load match type.");

                setValues(matchTypeToFormValues(matchTypeJson.data));
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [params.id]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const res = await fetch(`/api/match-types/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(normalizeMatchTypePayload(values)),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to update match type.");
            router.push(`/next_panel/match-types/${params.id}`);
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
                                <h1 className="h4 mb-2">Edit Match Type</h1>
                                <p className="text-muted mb-0">Update match type details.</p>
                            </div>
                            <button className="btn btn-primary" type="submit" form="matchTypeEditForm" disabled={saving || loading}>
                                <Save size={16} className="me-2" /> {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading match type details...</div>
                        ) : (
                            <MatchTypeForm
                                formId="matchTypeEditForm"
                                values={values}
                                onChange={setValues}
                                onSubmit={handleSubmit}
                                error={error}
                                loading={saving}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
