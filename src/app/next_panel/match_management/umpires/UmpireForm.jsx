"use client";

const emptyUmpire = {
    name: "",
    email: "",
    phone: "",
    experience: "",
    about: "",
    status: 1,
};

export function getEmptyUmpire() {
    return { ...emptyUmpire };
}

export function umpireToFormValues(umpire) {
    return {
        name: umpire.name || "",
        email: umpire.email || "",
        phone: umpire.phone || "",
        experience: umpire.experience || "",
        about: umpire.about || "",
        status: umpire.status ?? 1,
    };
}

export function normalizeUmpirePayload(values) {
    return {
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        experience: values.experience.trim(),
        about: values.about.trim(),
        status: Number(values.status),
    };
}

export default function UmpireForm({ formId, values, onChange, onSubmit, error, loading = false }) {
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
                    <label className="form-label">Name</label>
                    <input className="form-control" value={values.name} onChange={handleChange("name")} required disabled={loading} />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={values.email} onChange={handleChange("email")} required disabled={loading} />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Phone</label>
                    <input type="tel" className="form-control" value={values.phone} onChange={handleChange("phone")} required disabled={loading} />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Experience</label>
                    <input className="form-control" value={values.experience} onChange={handleChange("experience")} disabled={loading} />
                </div>

                <div className="col-12">
                    <label className="form-label">About</label>
                    <textarea className="form-control" rows={4} value={values.about} onChange={handleChange("about")} disabled={loading} />
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
