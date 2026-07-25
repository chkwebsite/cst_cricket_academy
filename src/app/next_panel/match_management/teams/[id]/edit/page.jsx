"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import TeamForm, { getEmptyTeam, buildTeamFormData, teamToFormValues, getTeamLogoUrl } from "../../TeamForm";

export default function EditTeamPage() {
    const [values, setValues] = useState(getEmptyTeam());
    const [logoFile, setLogoFile] = useState(null);
    const [currentLogoUrl, setCurrentLogoUrl] = useState(null);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        async function loadData() {
            try {
                const [teamRes, branchesRes] = await Promise.all([
                    fetch(`/api/teams/${params.id}`),
                    fetch("/api/branch"),
                ]);
                const teamJson = await teamRes.json();
                const branchesJson = await branchesRes.json();

                if (!teamRes.ok) throw new Error(teamJson.message || "Unable to load team.");
                if (!branchesRes.ok) throw new Error(branchesJson.message || "Unable to load branches.");

                setValues(teamToFormValues(teamJson.data));
                setCurrentLogoUrl(getTeamLogoUrl(teamJson.data));
                setBranches(branchesJson.data || []);
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
            const res = await fetch(`/api/teams/${params.id}`, {
                method: "PUT",
                body: buildTeamFormData(values, logoFile),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to update team.");
            router.push(`/next_panel/teams/${params.id}`);
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
                                <Link href="/next_panel/teams" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Teams
                                </Link>
                                <h1 className="h4 mb-2">Edit Team</h1>
                                <p className="text-muted mb-0">Update team details, coach, and logo.</p>
                            </div>
                            <button className="btn btn-primary" type="submit" form="teamEditForm" disabled={saving || loading}>
                                <Save size={16} className="me-2" /> {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading team details...</div>
                        ) : (
                            <TeamForm
                                formId="teamEditForm"
                                values={values}
                                branches={branches}
                                currentLogoUrl={currentLogoUrl}
                                onChange={setValues}
                                onLogoChange={setLogoFile}
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
