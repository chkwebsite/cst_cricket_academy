"use client";

const bollowerTypes = [
    "Right Arm Fast",
    "Right Arm Medium",
    "Right Arm Off Spin",
    "Right Arm Leg Spin",
    "Left Arm Fast",
    "Left Arm Medium",
    "Left Arm Spin (Orthodox)",
    "Left Arm Chinaman",
];

const emptyMatchTeamPlayer = {
    match_id: "",
    team_id: "",
    player_type: "academy", // "academy" | "outside" (client-only helper field)
    user_id: "",
    player_id: "",
    is_playing11: 1,
    is_captain: 0,
    is_wicket_keeper: 0,
    is_bollower: 0,
    is_bollower_type: "",
    is_allrounder: 0,
};

export function getEmptyMatchTeamPlayer() {
    return { ...emptyMatchTeamPlayer };
}

export function getMatchLabel(match) {
    if (!match) return "";
    return match.match_no ? `Match #${match.match_no}` : `Match #${match.id}`;
}

export function getAcademyPlayerName(player) {
    if (!player) return "";
    return player.full_name || player.name || player.username || player.email || `User #${player.id}`;
}

export function getOutsidePlayerName(player) {
    if (!player) return "";
    return player.name || `Player #${player.id}`;
}

export function matchTeamPlayerToFormValues(record) {
    return {
        match_id: record.match_id || "",
        team_id: record.team_id || "",
        player_type: record.user_id ? "academy" : "outside",
        user_id: record.user_id || "",
        player_id: record.player_id || "",
        is_playing11: record.is_playing11 ?? 1,
        is_captain: record.is_captain ?? 0,
        is_wicket_keeper: record.is_wicket_keeper ?? 0,
        is_bollower: record.is_bollower ?? 0,
        is_bollower_type: record.is_bollower_type || "",
        is_allrounder: record.is_allrounder ?? 0,
    };
}

export function normalizeMatchTeamPlayerPayload(values) {
    const isAcademy = values.player_type === "academy";

    return {
        match_id: Number(values.match_id),
        team_id: Number(values.team_id),
        user_id: isAcademy ? Number(values.user_id) : null,
        player_id: !isAcademy ? Number(values.player_id) : null,
        is_playing11: Number(values.is_playing11) ? 1 : 0,
        is_captain: Number(values.is_captain) ? 1 : 0,
        is_wicket_keeper: Number(values.is_wicket_keeper) ? 1 : 0,
        is_bollower: Number(values.is_bollower) ? 1 : 0,
        is_bollower_type: Number(values.is_bollower) ? (values.is_bollower_type || "").trim() || null : null,
        is_allrounder: Number(values.is_allrounder) ? 1 : 0,
    };
}

export default function MatchTeamPlayerForm({
    formId,
    values,
    matches = [],
    teams = [],
    academyPlayers = [],
    outsidePlayers = [],
    onChange,
    onSubmit,
    error,
    loading = false,
}) {
    const handleChange = (field) => (event) => {
        const numericFields = ["match_id", "team_id", "user_id", "player_id"];
        const value = numericFields.includes(field) ? event.target.value : event.target.value;
        onChange({ ...values, [field]: value });
    };

    const handleCheckbox = (field) => (event) => {
        onChange({ ...values, [field]: event.target.checked ? 1 : 0 });
    };

    const handlePlayerTypeChange = (type) => () => {
        onChange({
            ...values,
            player_type: type,
            user_id: type === "academy" ? values.user_id : "",
            player_id: type === "outside" ? values.player_id : "",
        });
    };

    const handleBollowerToggle = (event) => {
        const checked = event.target.checked ? 1 : 0;
        onChange({
            ...values,
            is_bollower: checked,
            is_bollower_type: checked ? values.is_bollower_type : "",
        });
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
                    <label className="form-label">Team</label>
                    <select className="form-select" value={values.team_id} onChange={handleChange("team_id")} required disabled={loading}>
                        <option value="">Select team</option>
                        {teams.map((team) => (
                            <option key={team.id} value={team.id}>{team.team_name}</option>
                        ))}
                    </select>
                </div>

                <div className="col-12">
                    <label className="form-label d-block">Player Source</label>
                    <div className="btn-group" role="group">
                        <input
                            type="radio"
                            className="btn-check"
                            name="player_type"
                            id="player-type-academy"
                            checked={values.player_type === "academy"}
                            onChange={handlePlayerTypeChange("academy")}
                            disabled={loading}
                        />
                        <label className="btn btn-outline-primary" htmlFor="player-type-academy">Academy Player</label>

                        <input
                            type="radio"
                            className="btn-check"
                            name="player_type"
                            id="player-type-outside"
                            checked={values.player_type === "outside"}
                            onChange={handlePlayerTypeChange("outside")}
                            disabled={loading}
                        />
                        <label className="btn btn-outline-primary" htmlFor="player-type-outside">Outside Player</label>
                    </div>
                </div>

                {values.player_type === "academy" ? (
                    <div className="col-md-6">
                        <label className="form-label">Academy Player</label>
                        <select className="form-select" value={values.user_id} onChange={handleChange("user_id")} required disabled={loading}>
                            <option value="">Select academy player</option>
                            {academyPlayers.map((player) => (
                                <option key={player.id} value={player.id}>{getAcademyPlayerName(player)}</option>
                            ))}
                        </select>
                    </div>
                ) : (
                    <div className="col-md-6">
                        <label className="form-label">Outside Player</label>
                        <select className="form-select" value={values.player_id} onChange={handleChange("player_id")} required disabled={loading}>
                            <option value="">Select outside player</option>
                            {outsidePlayers.map((player) => (
                                <option key={player.id} value={player.id}>{getOutsidePlayerName(player)}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="col-12">
                    <hr className="my-2" />
                    <label className="form-label d-block mb-2">Player Roles</label>

                    <div className="row g-3">
                        <div className="col-md-3 col-6">
                            <div className="form-check form-switch">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    role="switch"
                                    id="is_playing11"
                                    checked={!!Number(values.is_playing11)}
                                    onChange={handleCheckbox("is_playing11")}
                                    disabled={loading}
                                />
                                <label className="form-check-label" htmlFor="is_playing11">Playing XI</label>
                            </div>
                        </div>

                        <div className="col-md-3 col-6">
                            <div className="form-check form-switch">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    role="switch"
                                    id="is_captain"
                                    checked={!!Number(values.is_captain)}
                                    onChange={handleCheckbox("is_captain")}
                                    disabled={loading}
                                />
                                <label className="form-check-label" htmlFor="is_captain">Captain</label>
                            </div>
                        </div>

                        <div className="col-md-3 col-6">
                            <div className="form-check form-switch">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    role="switch"
                                    id="is_wicket_keeper"
                                    checked={!!Number(values.is_wicket_keeper)}
                                    onChange={handleCheckbox("is_wicket_keeper")}
                                    disabled={loading}
                                />
                                <label className="form-check-label" htmlFor="is_wicket_keeper">Wicket Keeper</label>
                            </div>
                        </div>

                        <div className="col-md-3 col-6">
                            <div className="form-check form-switch">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    role="switch"
                                    id="is_allrounder"
                                    checked={!!Number(values.is_allrounder)}
                                    onChange={handleCheckbox("is_allrounder")}
                                    disabled={loading}
                                />
                                <label className="form-check-label" htmlFor="is_allrounder">All Rounder</label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="form-check form-switch">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="is_bollower"
                            checked={!!Number(values.is_bollower)}
                            onChange={handleBollowerToggle}
                            disabled={loading}
                        />
                        <label className="form-check-label" htmlFor="is_bollower">Bowler</label>
                    </div>
                </div>

                {!!Number(values.is_bollower) && (
                    <div className="col-md-6">
                        <label className="form-label">Bowler Type</label>
                        <select className="form-select" value={values.is_bollower_type} onChange={handleChange("is_bollower_type")} disabled={loading}>
                            <option value="">Select bowler type</option>
                            {bollowerTypes.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
        </form>
    );
}
