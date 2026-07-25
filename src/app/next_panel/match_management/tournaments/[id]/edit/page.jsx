"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import TournamentForm, { getEmptyTournament, normalizeTournamentPayload, tournamentToFormValues } from "../../TournamentForm";

export default function EditTournamentPage() {
    const [values, setValues] = useState(getEmptyTournament());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        async function loadData() {
            try {
                const tournamentRes = await fetch(`/api/tournaments/${params.id}`);
                const tournamentJson = await tournamentRes.json();

                if (!tournamentRes.ok) throw new Error(tournamentJson.message || "Unable to load tournament.");

                setValues(tournamentToFormValues(tournamentJson.data));
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
            const res = await fetch(`/api/tournaments/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(normalizeTournamentPayload(values)),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to update tournament.");
            router.push(`/next_panel/tournaments/${params.id}`);
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
                                <Link href="/next_panel/tournaments" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Tournaments
                                </Link>
                                <h1 className="h4 mb-2">Edit Tournament</h1>
                                <p className="text-muted mb-0">Update tournament details and schedule.</p>
                            </div>
                            <button className="btn btn-primary" type="submit" form="tournamentEditForm" disabled={saving || loading}>
                                <Save size={16} className="me-2" /> {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading tournament details...</div>
                        ) : (
                            <TournamentForm
                                formId="tournamentEditForm"
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

