"use client";

const emptyTournament = {
    tournament_name: "",
    season: "",
    start_date: "",
    end_date: "",
    status: 1,
};

export function getEmptyTournament() {
    return { ...emptyTournament };
}

export function formatDateInput(value) {
    if (!value) return "";
    return String(value).slice(0, 10);
}

export function tournamentToFormValues(tournament) {
    return {
        tournament_name: tournament.tournament_name || "",
        season: tournament.season || "",
        start_date: formatDateInput(tournament.start_date),
        end_date: formatDateInput(tournament.end_date),
        status: tournament.status ?? 1,
    };
}

export function normalizeTournamentPayload(values) {
    return {
        tournament_name: values.tournament_name.trim(),
        season: values.season.trim(),
        start_date: values.start_date || null,
        end_date: values.end_date || null,
        status: Number(values.status),
    };
}

export default function TournamentForm({ formId, values, onChange, onSubmit, error, loading = false }) {
    const handleChange = (field) => (event) => {
        const numericFields = ["status"];
        const value = numericFields.includes(field) ? Number(event.target.value) : event.target.value;
        onChange({ ...values, [field]: value });
    };

    return (
        <form id={formId} onSubmit={onSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="row g-3">
                <div className="col-md-6">
                    <label className="form-label">Tournament Name</label>
                    <input className="form-control" value={values.tournament_name} onChange={handleChange("tournament_name")} required disabled={loading} />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Season</label>
                    <input className="form-control" value={values.season} onChange={handleChange("season")} disabled={loading} />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Start Date</label>
                    <input type="date" className="form-control" value={values.start_date} onChange={handleChange("start_date")} required disabled={loading} />
                </div>

                <div className="col-md-6">
                    <label className="form-label">End Date</label>
                    <input type="date" className="form-control" value={values.end_date} onChange={handleChange("end_date")} disabled={loading} />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={values.status} onChange={handleChange("status")} disabled={loading}>
                        <option value={1}>Active</option>
                        <option value={0}>Inactive</option>
                    </select>
                </div>
            </div>
        </form>
    );
}
