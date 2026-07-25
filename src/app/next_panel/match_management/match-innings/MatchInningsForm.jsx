"use client";

const emptyMatchInnings = {
    match_id: "",
    innings_no: "",
    batting_team_id: "",
    bowling_team_id: "",
    total_runs: 0,
    wickets: 0,
    overs: 0,
    extras: 0,
    target: 0,
    remarks: "",
};

export function getEmptyMatchInnings() {
    return { ...emptyMatchInnings };
}

export function getMatchLabel(match) {
    if (!match) return "";
    return match.match_no ? `Match #${match.match_no}` : `Match #${match.id}`;
}

export function matchInningsToFormValues(record) {
    return {
        match_id: record.match_id || "",
        innings_no: record.innings_no || "",
        batting_team_id: record.batting_team_id || "",
        bowling_team_id: record.bowling_team_id || "",
        total_runs: record.total_runs ?? 0,
        wickets: record.wickets ?? 0,
        overs: record.overs ?? 0,
        extras: record.extras ?? 0,
        target: record.target ?? 0,
        remarks: record.remarks || "",
    };
}

export function normalizeMatchInningsPayload(values) {
    return {
        match_id: Number(values.match_id),
        innings_no: Number(values.innings_no),
        batting_team_id: Number(values.batting_team_id),
        bowling_team_id: Number(values.bowling_team_id),
        total_runs: Number(values.total_runs) || 0,
        wickets: Number(values.wickets) || 0,
        overs: Number(values.overs) || 0,
        extras: Number(values.extras) || 0,
        target: Number(values.target) || 0,
        remarks: (values.remarks || "").trim() || null,
    };
}

export default function MatchInningsForm({
    formId,
    values,
    matches = [],
    teams = [],
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
                    <label className="form-label">Match</label>
                    <select className="form-select" value={values.match_id} onChange={handleChange("match_id")} required disabled={loading}>
                        <option value="">Select match</option>
                        {matches.map((match) => (
                            <option key={match.id} value={match.id}>{getMatchLabel(match)}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-6">
                    <label className="form-label">Innings No</label>
                    <select className="form-select" value={values.innings_no} onChange={handleChange("innings_no")} required disabled={loading}>
                        <option value="">Select innings</option>
                        <option value={1}>1st Innings</option>
                        <option value={2}>2nd Innings</option>
                    </select>
                </div>

                <div className="col-md-6">
                    <label className="form-label">Batting Team</label>
                    <select className="form-select" value={values.batting_team_id} onChange={handleChange("batting_team_id")} required disabled={loading}>
                        <option value="">Select batting team</option>
                        {teams.map((team) => (
                            <option key={team.id} value={team.id}>{team.team_name}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-6">
                    <label className="form-label">Bowling Team</label>
                    <select className="form-select" value={values.bowling_team_id} onChange={handleChange("bowling_team_id")} required disabled={loading}>
                        <option value="">Select bowling team</option>
                        {teams.map((team) => (
                            <option key={team.id} value={team.id}>{team.team_name}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-3 col-6">
                    <label className="form-label">Total Runs</label>
                    <input type="number" min="0" className="form-control" value={values.total_runs} onChange={handleChange("total_runs")} disabled={loading} />
                </div>

                <div className="col-md-3 col-6">
                    <label className="form-label">Wickets</label>
                    <input type="number" min="0" max="10" className="form-control" value={values.wickets} onChange={handleChange("wickets")} disabled={loading} />
                </div>

                <div className="col-md-3 col-6">
                    <label className="form-label">Overs</label>
                    <input type="number" min="0" step="0.1" className="form-control" value={values.overs} onChange={handleChange("overs")} disabled={loading} />
                </div>

                <div className="col-md-3 col-6">
                    <label className="form-label">Extras</label>
                    <input type="number" min="0" className="form-control" value={values.extras} onChange={handleChange("extras")} disabled={loading} />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Target</label>
                    <input type="number" min="0" className="form-control" value={values.target} onChange={handleChange("target")} disabled={loading} />
                </div>

                <div className="col-md-8">
                    <label className="form-label">Remarks</label>
                    <input className="form-control" value={values.remarks} onChange={handleChange("remarks")} disabled={loading} />
                </div>
            </div>
        </form>
    );
}
