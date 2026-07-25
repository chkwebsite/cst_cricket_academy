"use client";

const emptyBowling = {
    innings_id: "",
    bowler_id: "",
    overs: 0,
    maidens: 0,
    runs: 0,
    wickets: 0,
    wides: 0,
    no_balls: 0,
    economy: 0,
};

export function getEmptyBowling() {
    return { ...emptyBowling };
}

export function getInningsLabel(innings) {
    if (!innings) return "";
    const matchLabel = innings.match_no ? `Match #${innings.match_no}` : `Match #${innings.match_id}`;
    const inningsLabel = innings.innings_no === 1 ? "1st Innings" : innings.innings_no === 2 ? "2nd Innings" : `Innings ${innings.innings_no}`;
    const teams = innings.batting_team && innings.bowling_team ? ` (${innings.batting_team} vs ${innings.bowling_team})` : "";
    return `${matchLabel} — ${inningsLabel}${teams}`;
}

export function getMatchPlayerLabel(player) {
    if (!player) return "";
    const name = player.academy_player || player.outside_player || `Player #${player.id}`;
    const team = player.team_name ? ` (${player.team_name})` : "";
    return `${name}${team}`;
}

export function bowlingToFormValues(record) {
    return {
        innings_id: record.innings_id || "",
        bowler_id: record.bowler_id || "",
        overs: record.overs ?? 0,
        maidens: record.maidens ?? 0,
        runs: record.runs ?? 0,
        wickets: record.wickets ?? 0,
        wides: record.wides ?? 0,
        no_balls: record.no_balls ?? 0,
        economy: record.economy ?? 0,
    };
}

export function normalizeBowlingPayload(values) {
    return {
        innings_id: Number(values.innings_id),
        bowler_id: Number(values.bowler_id),
        overs: Number(values.overs) || 0,
        maidens: Number(values.maidens) || 0,
        runs: Number(values.runs) || 0,
        wickets: Number(values.wickets) || 0,
        wides: Number(values.wides) || 0,
        no_balls: Number(values.no_balls) || 0,
        economy: Number(values.economy) || 0,
    };
}

export default function MatchBowlingForm({
    formId,
    values,
    innings = [],
    matchPlayers = [],
    onChange,
    onSubmit,
    error,
    loading = false,
}) {
    const handleChange = (field) => (event) => {
        onChange({ ...values, [field]: event.target.value });
    };

    return (
        <form id={formId} onSubmit={onSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="row g-3">
                <div className="col-md-6">
                    <label className="form-label">Innings</label>
                    <select className="form-select" value={values.innings_id} onChange={handleChange("innings_id")} required disabled={loading}>
                        <option value="">Select innings</option>
                        {innings.map((inning) => (
                            <option key={inning.id} value={inning.id}>{getInningsLabel(inning)}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-6">
                    <label className="form-label">Bowler</label>
                    <select className="form-select" value={values.bowler_id} onChange={handleChange("bowler_id")} required disabled={loading}>
                        <option value="">Select bowler</option>
                        {matchPlayers.map((player) => (
                            <option key={player.id} value={player.id}>{getMatchPlayerLabel(player)}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-3 col-6">
                    <label className="form-label">Overs</label>
                    <input type="number" min="0" step="0.1" className="form-control" value={values.overs} onChange={handleChange("overs")} disabled={loading} />
                </div>

                <div className="col-md-3 col-6">
                    <label className="form-label">Maidens</label>
                    <input type="number" min="0" className="form-control" value={values.maidens} onChange={handleChange("maidens")} disabled={loading} />
                </div>

                <div className="col-md-3 col-6">
                    <label className="form-label">Runs</label>
                    <input type="number" min="0" className="form-control" value={values.runs} onChange={handleChange("runs")} disabled={loading} />
                </div>

                <div className="col-md-3 col-6">
                    <label className="form-label">Wickets</label>
                    <input type="number" min="0" className="form-control" value={values.wickets} onChange={handleChange("wickets")} disabled={loading} />
                </div>

                <div className="col-md-3 col-6">
                    <label className="form-label">Wides</label>
                    <input type="number" min="0" className="form-control" value={values.wides} onChange={handleChange("wides")} disabled={loading} />
                </div>

                <div className="col-md-3 col-6">
                    <label className="form-label">No Balls</label>
                    <input type="number" min="0" className="form-control" value={values.no_balls} onChange={handleChange("no_balls")} disabled={loading} />
                </div>

                <div className="col-md-3 col-6">
                    <label className="form-label">Economy</label>
                    <input type="number" min="0" step="0.01" className="form-control" value={values.economy} onChange={handleChange("economy")} disabled={loading} />
                </div>
            </div>
        </form>
    );
}
