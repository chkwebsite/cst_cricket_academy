"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import UmpireForm, { getEmptyUmpire, normalizeUmpirePayload, umpireToFormValues } from "../../UmpireForm";

export default function EditUmpirePage() {
    const [values, setValues] = useState(getEmptyUmpire());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        async function loadData() {
            try {
                const umpireRes = await fetch(`/api/umpires/${params.id}`);
                const umpireJson = await umpireRes.json();

                if (!umpireRes.ok) throw new Error(umpireJson.message || "Unable to load umpire.");

                setValues(umpireToFormValues(umpireJson.data));
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
            const res = await fetch(`/api/umpires/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(normalizeUmpirePayload(values)),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to update umpire.");
            router.push(`/next_panel/umpires/${params.id}`);
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
                                <Link href="/next_panel/umpires" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Umpires
                                </Link>
                                <h1 className="h4 mb-2">Edit Umpire</h1>
                                <p className="text-muted mb-0">Update umpire contact details and experience.</p>
                            </div>
                            <button className="btn btn-primary" type="submit" form="umpireEditForm" disabled={saving || loading}>
                                <Save size={16} className="me-2" /> {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading umpire details...</div>
                        ) : (
                            <UmpireForm
                                formId="umpireEditForm"
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
