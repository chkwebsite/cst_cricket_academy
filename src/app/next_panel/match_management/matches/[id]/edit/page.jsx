"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import MatchForm, { getEmptyMatch, normalizeMatchPayload, matchToFormValues, validateMatchValues } from "../../MatchForm";

export default function EditMatchPage() {
    const [values, setValues] = useState(getEmptyMatch());
    const [tournaments, setTournaments] = useState([]);
    const [branches, setBranches] = useState([]);
    const [teams, setTeams] = useState([]);
    const [matchTypes, setMatchTypes] = useState([]);
    const [umpires, setUmpires] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        async function loadData() {
            try {
                const [matchRes, tournamentsRes, branchesRes, teamsRes, matchTypesRes, umpiresRes] = await Promise.all([
                    fetch(`/api/matches/${params.id}`),
                    fetch("/api/tournaments"),
                    fetch("/api/branch"),
                    fetch("/api/teams"),
                    fetch("/api/match-types"),
                    fetch("/api/umpires"),
                ]);
                const matchJson = await matchRes.json();
                const tournamentsJson = await tournamentsRes.json();
                const branchesJson = await branchesRes.json();
                const teamsJson = await teamsRes.json();
                const matchTypesJson = await matchTypesRes.json();
                const umpiresJson = await umpiresRes.json();

                if (!matchRes.ok) throw new Error(matchJson.message || "Unable to load match.");
                if (!tournamentsRes.ok) throw new Error(tournamentsJson.message || "Unable to load tournaments.");
                if (!branchesRes.ok) throw new Error(branchesJson.message || "Unable to load branches.");
                if (!teamsRes.ok) throw new Error(teamsJson.message || "Unable to load teams.");
                if (!matchTypesRes.ok) throw new Error(matchTypesJson.message || "Unable to load match types.");
                if (!umpiresRes.ok) throw new Error(umpiresJson.message || "Unable to load umpires.");

                setValues(matchToFormValues(matchJson.data));
                setTournaments(tournamentsJson.data || []);
                setBranches(branchesJson.data || []);
                setTeams(teamsJson.data || []);
                setMatchTypes(matchTypesJson.data || []);
                setUmpires(umpiresJson.data || []);
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
        setError(null);

        const validationError = validateMatchValues(values);
        if (validationError) {
            setError(validationError);
            return;
        }

        setSaving(true);

        try {
            const res = await fetch(`/api/matches/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(normalizeMatchPayload(values)),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to update match.");
            router.push(`/next_panel/matches/${params.id}`);
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
                                <Link href="/next_panel/matches" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Matches
                                </Link>
                                <h1 className="h4 mb-2">Edit Match</h1>
                                <p className="text-muted mb-0">Update match details and results.</p>
                            </div>
                            <button className="btn btn-primary" type="submit" form="matchEditForm" disabled={saving || loading}>
                                <Save size={16} className="me-2" /> {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading match details...</div>
                        ) : (
                            <MatchForm
                                formId="matchEditForm"
                                values={values}
                                tournaments={tournaments}
                                branches={branches}
                                teams={teams}
                                matchTypes={matchTypes}
                                umpires={umpires}
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

