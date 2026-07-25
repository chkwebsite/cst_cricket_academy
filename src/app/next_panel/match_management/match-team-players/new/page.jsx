"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import MatchTeamPlayerForm, { getEmptyMatchTeamPlayer, normalizeMatchTeamPlayerPayload } from "../MatchTeamPlayerForm";

export default function NewMatchTeamPlayerPage() {
    const [values, setValues] = useState(getEmptyMatchTeamPlayer());
    const [matches, setMatches] = useState([]);
    const [teams, setTeams] = useState([]);
    const [academyPlayers, setAcademyPlayers] = useState([]);
    const [outsidePlayers, setOutsidePlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        async function loadFormData() {
            try {
                const [matchesRes, teamsRes, usersRes, outsideRes] = await Promise.all([
                    fetch("/api/matches"),
                    fetch("/api/teams"),
                    fetch("/api/users"),
                    fetch("/api/outside-player"),
                ]);
                const matchesJson = await matchesRes.json();
                const teamsJson = await teamsRes.json();
                const usersJson = await usersRes.json();
                const outsideJson = await outsideRes.json();

                if (!matchesRes.ok) throw new Error(matchesJson.message || "Unable to load matches.");
                if (!teamsRes.ok) throw new Error(teamsJson.message || "Unable to load teams.");
                if (!usersRes.ok) throw new Error(usersJson.message || "Unable to load academy players.");
                if (!outsideRes.ok) throw new Error(outsideJson.message || "Unable to load outside players.");

                setMatches(matchesJson.data || []);
                setTeams(teamsJson.data || []);
                setAcademyPlayers(usersJson.data || []);
                setOutsidePlayers(outsideJson.data || []);
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
            const res = await fetch("/api/match-team-players", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(normalizeMatchTeamPlayerPayload(values)),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to add player.");
            router.push("/next_panel/match-team-players");
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
                                <Link href="/next_panel/match-team-players" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Match Team Players
                                </Link>
                                <h1 className="h4 mb-2">Add Player to Match</h1>
                                <p className="text-muted mb-0">Select the match, team, and player details.</p>
                            </div>
                            <button className="btn btn-primary" type="submit" form="matchTeamPlayerForm" disabled={saving || loading}>
                                <Plus size={16} className="me-2" /> {saving ? "Saving..." : "Save Player"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading form data...</div>
                        ) : (
                            <MatchTeamPlayerForm
                                formId="matchTeamPlayerForm"
                                values={values}
                                matches={matches}
                                teams={teams}
                                academyPlayers={academyPlayers}
                                outsidePlayers={outsidePlayers}
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
