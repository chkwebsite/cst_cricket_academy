"use client";

const howOutOptions = [
    "Not Out",
    "Bowled",
    "Caught",
    "LBW",
    "Run Out",
    "Stumped",
    "Hit Wicket",
    "Retired Hurt",
    "Retired Out",
];

const emptyScorecard = {
    innings_id: "",
    player_id: "",
    batting_position: "",
    runs: 0,
    balls: 0,
    fours: 0,
    sixes: 0,
    strike_rate: 0,
    how_out: "",
    bowler_id: "",
    fielder_id: "",
};

export function getEmptyScorecard() {
    return { ...emptyScorecard };
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

export function scorecardToFormValues(record) {
    return {
        innings_id: record.innings_id || "",
        player_id: record.player_id || "",
        batting_position: record.batting_position ?? "",
        runs: record.runs ?? 0,
        balls: record.balls ?? 0,
        fours: record.fours ?? 0,
        sixes: record.sixes ?? 0,
        strike_rate: record.strike_rate ?? 0,
        how_out: record.how_out || "",
        bowler_id: record.bowler_id || "",
        fielder_id: record.fielder_id || "",
    };
}

export function normalizeScorecardPayload(values) {
    return {
        innings_id: Number(values.innings_id),
        player_id: Number(values.player_id),
        batting_position: values.batting_position === "" ? null : Number(values.batting_position),
        runs: Number(values.runs) || 0,
        balls: Number(values.balls) || 0,
        fours: Number(values.fours) || 0,
        sixes: Number(values.sixes) || 0,
        strike_rate: Number(values.strike_rate) || 0,
        how_out: (values.how_out || "").trim() || null,
        bowler_id: values.bowler_id ? Number(values.bowler_id) : null,
        fielder_id: values.fielder_id ? Number(values.fielder_id) : null,
    };
}

export default function MatchScorecardForm({
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
                    <label className="form-label">Batter</label>
                    <select className="form-select" value={values.player_id} onChange={handleChange("player_id")} required disabled={loading}>
                        <option value="">Select batter</option>
                        {matchPlayers.map((player) => (
                            <option key={player.id} value={player.id}>{getMatchPlayerLabel(player)}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-3 col-6">
                    <label className="form-label">Batting Position</label>
                    <input type="number" min="1" className="form-control" value={values.batting_position} onChange={handleChange("batting_position")} disabled={loading} />
                </div>

                <div className="col-md-3 col-6">
                    <label className="form-label">Runs</label>
                    <input type="number" min="0" className="form-control" value={values.runs} onChange={handleChange("runs")} disabled={loading} />
                </div>

                <div className="col-md-3 col-6">
                    <label className="form-label">Balls</label>
                    <input type="number" min="0" className="form-control" value={values.balls} onChange={handleChange("balls")} disabled={loading} />
                </div>

                <div className="col-md-3 col-6">
                    <label className="form-label">Strike Rate</label>
                    <input type="number" min="0" step="0.01" className="form-control" value={values.strike_rate} onChange={handleChange("strike_rate")} disabled={loading} />
                </div>

                <div className="col-md-3 col-6">
                    <label className="form-label">Fours</label>
                    <input type="number" min="0" className="form-control" value={values.fours} onChange={handleChange("fours")} disabled={loading} />
                </div>

                <div className="col-md-3 col-6">
                    <label className="form-label">Sixes</label>
                    <input type="number" min="0" className="form-control" value={values.sixes} onChange={handleChange("sixes")} disabled={loading} />
                </div>

                <div className="col-md-6">
                    <label className="form-label">How Out</label>
                    <select className="form-select" value={values.how_out} onChange={handleChange("how_out")} disabled={loading}>
                        <option value="">Select dismissal</option>
                        {howOutOptions.map((option) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-6">
                    <label className="form-label">Bowler</label>
                    <select className="form-select" value={values.bowler_id} onChange={handleChange("bowler_id")} disabled={loading}>
                        <option value="">Not applicable</option>
                        {matchPlayers.map((player) => (
                            <option key={player.id} value={player.id}>{getMatchPlayerLabel(player)}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-6">
                    <label className="form-label">Fielder</label>
                    <select className="form-select" value={values.fielder_id} onChange={handleChange("fielder_id")} disabled={loading}>
                        <option value="">Not applicable</option>
                        {matchPlayers.map((player) => (
                            <option key={player.id} value={player.id}>{getMatchPlayerLabel(player)}</option>
                        ))}
                    </select>
                </div>
            </div>
        </form>
    );
}
