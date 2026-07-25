"use client";

const emptyMatchType = {
    match_type: "",
    status: 1,
};

export function getEmptyMatchType() {
    return { ...emptyMatchType };
}

export function matchTypeToFormValues(matchType) {
    return {
        match_type: matchType.match_type || "",
        status: matchType.status ?? 1,
    };
}

export function normalizeMatchTypePayload(values) {
    return {
        match_type: values.match_type.trim(),
        status: Number(values.status),
    };
}

export default function MatchTypeForm({ formId, values, onChange, onSubmit, error, loading = false }) {
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
                    <label className="form-label">Match Type</label>
                    <input className="form-control" value={values.match_type} onChange={handleChange("match_type")} required disabled={loading} />
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
