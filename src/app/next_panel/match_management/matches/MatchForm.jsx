"use client";

const emptyMatch = {
    match_no: "",
    tournament_id: "",
    branch_id: "",
    team_a_id: "",
    team_b_id: "",
    match_type_id: "",
    match_date: "",
    match_time: "",
    overs: "",
    toss_winner_team_id: "",
    toss_decision: "",
    umpire1_id: "",
    umpire2_id: "",
    status: "Upcoming",
    winner_team_id: "",
    result: "",
    man_of_the_match: "",
    remarks: "",
};

const statusOptions = ["Upcoming", "Live", "Completed", "Cancelled"];
const tossDecisionOptions = ["Bat", "Bowl"];

export function getEmptyMatch() {
    return { ...emptyMatch };
}

export function formatDateInput(value) {
    if (!value) return "";
    return String(value).slice(0, 10);
}

export function formatTimeInput(value) {
    if (!value) return "";
    return String(value).slice(0, 5);
}

export function matchToFormValues(match) {
    return {
        match_no: match.match_no || "",
        tournament_id: match.tournament_id || "",
        branch_id: match.branch_id || "",
        team_a_id: match.team_a_id || "",
        team_b_id: match.team_b_id || "",
        match_type_id: match.match_type_id || "",
        match_date: formatDateInput(match.match_date),
        match_time: formatTimeInput(match.match_time),
        overs: match.overs ?? "",
        toss_winner_team_id: match.toss_winner_team_id || "",
        toss_decision: match.toss_decision || "",
        umpire1_id: match.umpire1_id || "",
        umpire2_id: match.umpire2_id || "",
        status: match.status || "Upcoming",
        winner_team_id: match.winner_team_id || "",
        result: match.result || "",
        man_of_the_match: match.man_of_the_match || "",
        remarks: match.remarks || "",
    };
}

export function validateMatchValues(values) {
    if (!values.team_a_id || !values.team_b_id || !values.match_date) {
        return "Team A, Team B and Match Date are required.";
    }

    if (Number(values.team_a_id) === Number(values.team_b_id)) {
        return "Team A and Team B cannot be the same.";
    }

    if (
        values.toss_winner_team_id &&
        Number(values.toss_winner_team_id) !== Number(values.team_a_id) &&
        Number(values.toss_winner_team_id) !== Number(values.team_b_id)
    ) {
        return "Toss winner must be Team A or Team B.";
    }

    if (
        values.winner_team_id &&
        Number(values.winner_team_id) !== Number(values.team_a_id) &&
        Number(values.winner_team_id) !== Number(values.team_b_id)
    ) {
        return "Winner team must be Team A or Team B.";
    }

    return null;
}

export function normalizeMatchPayload(values) {
    return {
        match_no: values.match_no.trim() || null,
        tournament_id: values.tournament_id ? Number(values.tournament_id) : null,
        branch_id: values.branch_id ? Number(values.branch_id) : null,
        team_a_id: Number(values.team_a_id),
        team_b_id: Number(values.team_b_id),
        match_type_id: values.match_type_id ? Number(values.match_type_id) : null,
        match_date: values.match_date || null,
        match_time: values.match_time || null,
        overs: values.overs ? Number(values.overs) : null,
        toss_winner_team_id: values.toss_winner_team_id ? Number(values.toss_winner_team_id) : null,
        toss_decision: values.toss_decision || null,
        umpire1_id: values.umpire1_id ? Number(values.umpire1_id) : null,
        umpire2_id: values.umpire2_id ? Number(values.umpire2_id) : null,
        status: values.status || "Upcoming",
        winner_team_id: values.winner_team_id ? Number(values.winner_team_id) : null,
        result: values.result.trim() || null,
        man_of_the_match: values.man_of_the_match.trim() || null,
        remarks: values.remarks.trim() || null,
    };
}

export default function MatchForm({
    formId,
    values,
    tournaments = [],
    branches = [],
    teams = [],
    matchTypes = [],
    umpires = [],
    onChange,
    onSubmit,
    error,
    loading = false,
}) {
    const stringFields = [
        "match_no", "match_date", "match_time", "toss_decision",
        "status", "result", "man_of_the_match", "remarks",
    ];

    const handleChange = (field) => (event) => {
        const value = stringFields.includes(field) ? event.target.value : (event.target.value ? Number(event.target.value) : "");
        onChange({ ...values, [field]: value });
    };

    const handleTextChange = (field) => (event) => {
        onChange({ ...values, [field]: event.target.value });
    };

    const teamAOptions = teams.filter((team) => Number(team.id) !== Number(values.team_b_id));
    const teamBOptions = teams.filter((team) => Number(team.id) !== Number(values.team_a_id));

    const matchTeams = teams.filter(
        (team) => Number(team.id) === Number(values.team_a_id) || Number(team.id) === Number(values.team_b_id)
    );

    return (
        <form id={formId} onSubmit={onSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="row g-3">
                <div className="col-md-4">
                    <label className="form-label">Match No</label>
                    <input className="form-control" value={values.match_no} onChange={handleTextChange("match_no")} disabled={loading} />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Tournament</label>
                    <select className="form-select" value={values.tournament_id} onChange={handleChange("tournament_id")} disabled={loading}>
                        <option value="">Select tournament</option>
                        {tournaments.map((tournament) => (
                            <option key={tournament.id} value={tournament.id}>{tournament.tournament_name}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-4">
                    <label className="form-label">Branch</label>
                    <select className="form-select" value={values.branch_id} onChange={handleChange("branch_id")} disabled={loading}>
                        <option value="">Select branch</option>
                        {branches.map((branch) => (
                            <option key={branch.id} value={branch.id}>{branch.branch_name}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-6">
                    <label className="form-label">Team A</label>
                    <select className="form-select" value={values.team_a_id} onChange={handleChange("team_a_id")} required disabled={loading}>
                        <option value="">Select team A</option>
                        {teamAOptions.map((team) => (
                            <option key={team.id} value={team.id}>{team.team_name}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-6">
                    <label className="form-label">Team B</label>
                    <select className="form-select" value={values.team_b_id} onChange={handleChange("team_b_id")} required disabled={loading}>
                        <option value="">Select team B</option>
                        {teamBOptions.map((team) => (
                            <option key={team.id} value={team.id}>{team.team_name}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-4">
                    <label className="form-label">Match Type</label>
                    <select className="form-select" value={values.match_type_id} onChange={handleChange("match_type_id")} disabled={loading}>
                        <option value="">Select match type</option>
                        {matchTypes.map((matchType) => (
                            <option key={matchType.id} value={matchType.id}>{matchType.match_type}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-4">
                    <label className="form-label">Match Date</label>
                    <input type="date" className="form-control" value={values.match_date} onChange={handleTextChange("match_date")} required disabled={loading} />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Match Time</label>
                    <input type="time" className="form-control" value={values.match_time} onChange={handleTextChange("match_time")} disabled={loading} />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Overs</label>
                    <input type="number" className="form-control" value={values.overs} onChange={handleChange("overs")} disabled={loading} />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Toss Winner</label>
                    <select className="form-select" value={values.toss_winner_team_id} onChange={handleChange("toss_winner_team_id")} disabled={loading || matchTeams.length === 0}>
                        <option value="">Select toss winner</option>
                        {matchTeams.map((team) => (
                            <option key={team.id} value={team.id}>{team.team_name}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-4">
                    <label className="form-label">Toss Decision</label>
                    <select className="form-select" value={values.toss_decision} onChange={handleTextChange("toss_decision")} disabled={loading}>
                        <option value="">Select decision</option>
                        {tossDecisionOptions.map((option) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-4">
                    <label className="form-label">Umpire 1</label>
                    <select className="form-select" value={values.umpire1_id} onChange={handleChange("umpire1_id")} disabled={loading}>
                        <option value="">Select umpire</option>
                        {umpires.map((umpire) => (
                            <option key={umpire.id} value={umpire.id}>{umpire.name}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-4">
                    <label className="form-label">Umpire 2</label>
                    <select className="form-select" value={values.umpire2_id} onChange={handleChange("umpire2_id")} disabled={loading}>
                        <option value="">Select umpire</option>
                        {umpires.map((umpire) => (
                            <option key={umpire.id} value={umpire.id}>{umpire.name}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-4">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={values.status} onChange={handleTextChange("status")} disabled={loading}>
                        {statusOptions.map((option) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-4">
                    <label className="form-label">Winner Team</label>
                    <select className="form-select" value={values.winner_team_id} onChange={handleChange("winner_team_id")} disabled={loading || matchTeams.length === 0}>
                        <option value="">Select winner</option>
                        {matchTeams.map((team) => (
                            <option key={team.id} value={team.id}>{team.team_name}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-4">
                    <label className="form-label">Man of the Match</label>
                    <input className="form-control" value={values.man_of_the_match} onChange={handleTextChange("man_of_the_match")} disabled={loading} />
                </div>

                <div className="col-12">
                    <label className="form-label">Result</label>
                    <input className="form-control" value={values.result} onChange={handleTextChange("result")} disabled={loading} />
                </div>

                <div className="col-12">
                    <label className="form-label">Remarks</label>
                    <textarea className="form-control" rows={3} value={values.remarks} onChange={handleTextChange("remarks")} disabled={loading} />
                </div>
            </div>
        </form>
    );
}
