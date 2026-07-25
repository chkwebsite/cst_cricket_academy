"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import MatchAwardForm, { getEmptyAward, normalizeAwardPayload } from "../MatchAwardForm";

export default function NewMatchAwardPage() {
    const [values, setValues] = useState(getEmptyAward());
    const [matches, setMatches] = useState([]);
    const [matchPlayers, setMatchPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        async function loadFormData() {
            try {
                const [matchesRes, playersRes] = await Promise.all([
                    fetch("/api/matches"),
                    fetch("/api/match-team-players"),
                ]);
                const matchesJson = await matchesRes.json();
                const playersJson = await playersRes.json();

                if (!matchesRes.ok) throw new Error(matchesJson.message || "Unable to load matches.");
                if (!playersRes.ok) throw new Error(playersJson.message || "Unable to load match players.");

                setMatches(matchesJson.data || []);
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
            const res = await fetch("/api/match-awards", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(normalizeAwardPayload(values)),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to add award.");
            router.push("/next_panel/match-awards");
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
                                <Link href="/next_panel/match-awards" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Match Awards
                                </Link>
                                <h1 className="h4 mb-2">Add Award</h1>
                                <p className="text-muted mb-0">Assign an award to a player for a match.</p>
                            </div>
                            <button className="btn btn-primary" type="submit" form="matchAwardForm" disabled={saving || loading}>
                                <Plus size={16} className="me-2" /> {saving ? "Saving..." : "Save Award"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading form data...</div>
                        ) : (
                            <MatchAwardForm
                                formId="matchAwardForm"
                                values={values}
                                matches={matches}
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
