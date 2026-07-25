"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import MatchScorecardForm, { getEmptyScorecard, normalizeScorecardPayload } from "../MatchScorecardForm";

export default function NewMatchScorecardPage() {
    const [values, setValues] = useState(getEmptyScorecard());
    const [innings, setInnings] = useState([]);
    const [matchPlayers, setMatchPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        async function loadFormData() {
            try {
                const [inningsRes, playersRes] = await Promise.all([
                    fetch("/api/match-innings"),
                    fetch("/api/match-team-players"),
                ]);
                const inningsJson = await inningsRes.json();
                const playersJson = await playersRes.json();

                if (!inningsRes.ok) throw new Error(inningsJson.message || "Unable to load innings.");
                if (!playersRes.ok) throw new Error(playersJson.message || "Unable to load match players.");

                setInnings(inningsJson.data || []);
                setMatchPlayers(playersJson.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadFormData();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const res = await fetch("/api/match-scorecard", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(normalizeScorecardPayload(values)),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to add scorecard entry.");
            router.push("/next_panel/match-scorecard");
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
                                <Link href="/next_panel/match-scorecard" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Match Scorecard
                                </Link>
                                <h1 className="h4 mb-2">Add Scorecard Entry</h1>
                                <p className="text-muted mb-0">Record a batter's performance for an innings.</p>
                            </div>
                            <button className="btn btn-primary" type="submit" form="matchScorecardForm" disabled={saving || loading}>
                                <Plus size={16} className="me-2" /> {saving ? "Saving..." : "Save Entry"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading form data...</div>
                        ) : (
                            <MatchScorecardForm
                                formId="matchScorecardForm"
                                values={values}
                                innings={innings}
                                matchPlayers={matchPlayers}
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
