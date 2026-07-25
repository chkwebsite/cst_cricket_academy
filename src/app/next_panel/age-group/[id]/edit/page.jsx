"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import AgeGroupForm, { getEmptyAgeGroup, normalizeAgeGroupPayload } from "../../AgeGroupForm";

export default function EditAgeGroupPage() {
    const [values, setValues] = useState(getEmptyAgeGroup());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        async function loadAgeGroup() {
            try {
                const res = await fetch(`/api/age_groups/${params.id}`);
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || "Unable to load age group.");
                const ageGroup = json.data;
                setValues({
                    age_group: ageGroup.age_group || "",
                    min_age: ageGroup.min_age ?? "",
                    max_age: ageGroup.max_age ?? "",
                    status: ageGroup.status ?? 1,
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadAgeGroup();
    }, [params.id]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const res = await fetch(`/api/age_groups/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(normalizeAgeGroupPayload(values)),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to update age group.");
            router.push(`/next_panel/age-group/${params.id}`);
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
                                <h1 className="h4 mb-2">Edit Age Group</h1>
                                <p className="text-muted mb-0">Update this age group bracket's settings.</p>
                            </div>
                            <button className="btn btn-primary" type="submit" form="ageGroupEditForm" disabled={saving || loading}>
                                <Save size={16} className="me-2" /> {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading age group details...</div>
                        ) : (
                            <AgeGroupForm
                                formId="ageGroupEditForm"
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
