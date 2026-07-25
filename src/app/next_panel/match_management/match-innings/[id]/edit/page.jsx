"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import MatchInningsForm, { getEmptyMatchInnings, normalizeMatchInningsPayload, matchInningsToFormValues } from "../../MatchInningsForm";

export default function EditMatchInningsPage() {
    const [values, setValues] = useState(getEmptyMatchInnings());
    const [matches, setMatches] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        async function loadData() {
            try {
                const [inningRes, matchesRes, teamsRes] = await Promise.all([
                    fetch(`/api/match-innings/${params.id}`),
                    fetch("/api/matches"),
                    fetch("/api/teams"),
                ]);
                const inningJson = await inningRes.json();
                const matchesJson = await matchesRes.json();
                const teamsJson = await teamsRes.json();

                if (!inningRes.ok) throw new Error(inningJson.message || "Unable to load innings.");
                if (!matchesRes.ok) throw new Error(matchesJson.message || "Unable to load matches.");
                if (!teamsRes.ok) throw new Error(teamsJson.message || "Unable to load teams.");

                setValues(matchInningsToFormValues(inningJson.data));
                setMatches(matchesJson.data || []);
                setTeams(teamsJson.data || []);
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
            const res = await fetch(`/api/match-innings/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(normalizeMatchInningsPayload(values)),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to update innings.");
            router.push(`/next_panel/match-innings/${params.id}`);
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
                                <Link href="/next_panel/match-innings" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Match Innings
                                </Link>
                                <h1 className="h4 mb-2">Edit Innings</h1>
                                <p className="text-muted mb-0">Update innings score and details.</p>
                            </div>
                            <button className="btn btn-primary" type="submit" form="matchInningsEditForm" disabled={saving || loading}>
                                <Save size={16} className="me-2" /> {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading innings details...</div>
                        ) : (
                            <MatchInningsForm
                                formId="matchInningsEditForm"
                                values={values}
                                matches={matches}
                                teams={teams}
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
