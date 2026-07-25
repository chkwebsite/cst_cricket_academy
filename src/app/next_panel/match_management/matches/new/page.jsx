"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import MatchForm, { getEmptyMatch, normalizeMatchPayload, validateMatchValues } from "../MatchForm";

export default function NewMatchPage() {
    const [values, setValues] = useState(getEmptyMatch());
    const [tournaments, setTournaments] = useState([]);
    const [branches, setBranches] = useState([]);
    const [teams, setTeams] = useState([]);
    const [matchTypes, setMatchTypes] = useState([]);
    const [umpires, setUmpires] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        async function loadFormData() {
            try {
                const [tournamentsRes, branchesRes, teamsRes, matchTypesRes, umpiresRes] = await Promise.all([
                    fetch("/api/tournaments"),
                    fetch("/api/branch"),
                    fetch("/api/teams"),
                    fetch("/api/match-types"),
                    fetch("/api/umpires"),
                ]);
                const tournamentsJson = await tournamentsRes.json();
                const branchesJson = await branchesRes.json();
                const teamsJson = await teamsRes.json();
                const matchTypesJson = await matchTypesRes.json();
                const umpiresJson = await umpiresRes.json();

                if (!tournamentsRes.ok) throw new Error(tournamentsJson.message || "Unable to load tournaments.");
                if (!branchesRes.ok) throw new Error(branchesJson.message || "Unable to load branches.");
                if (!teamsRes.ok) throw new Error(teamsJson.message || "Unable to load teams.");
                if (!matchTypesRes.ok) throw new Error(matchTypesJson.message || "Unable to load match types.");
                if (!umpiresRes.ok) throw new Error(umpiresJson.message || "Unable to load umpires.");

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

        loadFormData();
    }, []);

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
            const res = await fetch("/api/matches", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(normalizeMatchPayload(values)),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to create match.");
            router.push("/next_panel/matches");
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
                                <h1 className="h4 mb-2">Create Match</h1>
                                <p className="text-muted mb-0">Schedule a new match fixture.</p>
                            </div>
                            <button className="btn btn-primary" type="submit" form="matchForm" disabled={saving || loading}>
                                <Plus size={16} className="me-2" /> {saving ? "Saving..." : "Save Match"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading form data...</div>
                        ) : (
                            <MatchForm
                                formId="matchForm"
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
