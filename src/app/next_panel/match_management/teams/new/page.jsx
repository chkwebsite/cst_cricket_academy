"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import TeamForm, { getEmptyTeam, buildTeamFormData } from "../TeamForm";

export default function NewTeamPage() {
    const [values, setValues] = useState(getEmptyTeam());
    const [logoFile, setLogoFile] = useState(null);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        async function loadBranches() {
            try {
                const branchesRes = await fetch("/api/branch");
                const branchesJson = await branchesRes.json();

                if (!branchesRes.ok) throw new Error(branchesJson.message || "Unable to load branches.");

                setBranches(branchesJson.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadBranches();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const res = await fetch("/api/teams", {
                method: "POST",
                body: buildTeamFormData(values, logoFile),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to create team.");
            router.push("/next_panel/teams");
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
                                <h1 className="h4 mb-2">Create Team</h1>
                                <p className="text-muted mb-0">Add a new team, coach, and logo.</p>
                            </div>
                            <button className="btn btn-primary" type="submit" form="teamForm" disabled={saving || loading}>
                                <Plus size={16} className="me-2" /> {saving ? "Saving..." : "Save Team"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading form data...</div>
                        ) : (
                            <TeamForm
                                formId="teamForm"
                                values={values}
                                branches={branches}
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
