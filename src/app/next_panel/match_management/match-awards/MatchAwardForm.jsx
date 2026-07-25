"use client";

const awardTypes = [
    "Man of the Match",
    "Best Batsman",
    "Best Bowler",
    "Best Fielder",
    "Best Wicket Keeper",
    "Emerging Player",
];

const emptyAward = {
    match_id: "",
    award_type: "",
    player_id: "",
    remarks: "",
};

export function getEmptyAward() {
    return { ...emptyAward };
}

export function getMatchLabel(match) {
    if (!match) return "";
    return match.match_no ? `Match #${match.match_no}` : `Match #${match.id}`;
}

export function getMatchPlayerLabel(player) {
    if (!player) return "";
    const name = player.academy_player || player.outside_player || `Player #${player.id}`;
    const team = player.team_name ? ` (${player.team_name})` : "";
    return `${name}${team}`;
}

export function awardToFormValues(record) {
    return {
        match_id: record.match_id || "",
        award_type: record.award_type || "",
        player_id: record.player_id || "",
        remarks: record.remarks || "",
    };
}

export function normalizeAwardPayload(values) {
    return {
        match_id: Number(values.match_id),
        award_type: (values.award_type || "").trim(),
        player_id: Number(values.player_id),
        remarks: (values.remarks || "").trim() || null,
    };
}

export default function MatchAwardForm({
    formId,
    values,
    matches = [],
    matchPlayers = [],
    onChange,
    onSubmit,
    error,
    loading = false,
}) {
    const handleChange = (field) => (event) => {
        onChange({ ...values, [field]: event.target.value });
    };

    const filteredPlayers = values.match_id
        ? matchPlayers.filter((player) => String(player.match_id) === String(values.match_id))
        : matchPlayers;

    return (
        <form id={formId} onSubmit={onSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="row g-3">
                <div className="col-md-6">
                    <label className="form-label">Match</label>
                    <select className="form-select" value={values.match_id} onChange={handleChange("match_id")} required disabled={loading}>
                        <option value="">Select match</option>
                        {matches.map((match) => (
                            <option key={match.id} value={match.id}>{getMatchLabel(match)}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-6">
                    <label className="form-label">Award Type</label>
                    <input
                        className="form-control"
                        list="award-type-options"
                        value={values.award_type}
                        onChange={handleChange("award_type")}
                        placeholder="e.g. Man of the Match"
                        required
                        disabled={loading}
                    />
                    <datalist id="award-type-options">
                        {awardTypes.map((type) => (
                            <option key={type} value={type} />
                        ))}
                    </datalist>
                </div>

                <div className="col-md-6">
                    <label className="form-label">Player</label>
                    <select className="form-select" value={values.player_id} onChange={handleChange("player_id")} required disabled={loading}>
                        <option value="">{values.match_id ? "Select player" : "Select a match first"}</option>
                        {filteredPlayers.map((player) => (
                            <option key={player.id} value={player.id}>{getMatchPlayerLabel(player)}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-6">
                    <label className="form-label">Remarks</label>
                    <input className="form-control" value={values.remarks} onChange={handleChange("remarks")} disabled={loading} />
                </div>
            </div>
        </form>
    );
}
