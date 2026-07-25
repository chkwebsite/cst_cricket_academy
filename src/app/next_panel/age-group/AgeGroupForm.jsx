"use client";

const emptyAgeGroup = {
    age_group: "",
    min_age: "",
    max_age: "",
    status: 1,
};

export function getEmptyAgeGroup() {
    return { ...emptyAgeGroup };
}

export function normalizeAgeGroupPayload(values) {
    return {
        age_group: values.age_group.trim(),
        min_age: values.min_age === "" ? null : Number(values.min_age),
        max_age: values.max_age === "" ? null : Number(values.max_age),
        status: Number(values.status),
    };
}

export default function AgeGroupForm({ formId, values, onChange, onSubmit, error, loading = false }) {
    const handleChange = (field) => (event) => {
        const value = field === "status" ? Number(event.target.value) : event.target.value;
        onChange({ ...values, [field]: value });
    };

    return (
        <form id={formId} onSubmit={onSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="row g-3">
                <div className="col-md-4">
                    <label className="form-label">Age Group Name</label>
                    <input
                        className="form-control"
                        placeholder="e.g. Under 12"
                        value={values.age_group}
                        onChange={handleChange("age_group")}
                        disabled={loading}
                    />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Min Age</label>
                    <input
                        type="number"
                        min="0"
                        className="form-control"
                        value={values.min_age}
                        onChange={handleChange("min_age")}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Max Age</label>
                    <input
                        type="number"
                        min="0"
                        className="form-control"
                        value={values.max_age}
                        onChange={handleChange("max_age")}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="col-md-4">
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
