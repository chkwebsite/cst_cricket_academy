"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import MatchTeamPlayerForm, { getEmptyMatchTeamPlayer, normalizeMatchTeamPlayerPayload, matchTeamPlayerToFormValues } from "../../MatchTeamPlayerForm";

export default function EditMatchTeamPlayerPage() {
    const [values, setValues] = useState(getEmptyMatchTeamPlayer());
    const [matches, setMatches] = useState([]);
    const [teams, setTeams] = useState([]);
    const [academyPlayers, setAcademyPlayers] = useState([]);
    const [outsidePlayers, setOutsidePlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        async function loadData() {
            try {
                const [playerRes, matchesRes, teamsRes, usersRes, outsideRes] = await Promise.all([
                    fetch(`/api/match-team-players/${params.id}`),
                    fetch("/api/matches"),
                    fetch("/api/teams"),
                    fetch("/api/users"),
                    fetch("/api/outside-player"),
                ]);
                const playerJson = await playerRes.json();
                const matchesJson = await matchesRes.json();
                const teamsJson = await teamsRes.json();
                const usersJson = await usersRes.json();
                const outsideJson = await outsideRes.json();

                if (!playerRes.ok) throw new Error(playerJson.message || "Unable to load record.");
                if (!matchesRes.ok) throw new Error(matchesJson.message || "Unable to load matches.");
                if (!teamsRes.ok) throw new Error(teamsJson.message || "Unable to load teams.");
                if (!usersRes.ok) throw new Error(usersJson.message || "Unable to load academy players.");
                if (!outsideRes.ok) throw new Error(outsideJson.message || "Unable to load outside players.");

                setValues(matchTeamPlayerToFormValues(playerJson.data));
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

        loadData();
    }, [params.id]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const res = await fetch(`/api/match-team-players/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(normalizeMatchTeamPlayerPayload(values)),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to update record.");
            router.push(`/next_panel/match-team-players/${params.id}`);
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
                                <h1 className="h4 mb-2">Edit Player</h1>
                                <p className="text-muted mb-0">Update match, team, and role details.</p>
                            </div>
                            <button className="btn btn-primary" type="submit" form="matchTeamPlayerEditForm" disabled={saving || loading}>
                                <Save size={16} className="me-2" /> {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading player details...</div>
                        ) : (
                            <MatchTeamPlayerForm
                                formId="matchTeamPlayerEditForm"
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
