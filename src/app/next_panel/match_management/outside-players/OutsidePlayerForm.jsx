"use client";

const emptyOutsidePlayer = {
    name: "",
    email: "",
    phone: "",
    academy_name: "",
};

export function getEmptyOutsidePlayer() {
    return { ...emptyOutsidePlayer };
}

export function outsidePlayerToFormValues(player) {
    return {
        name: player.name || "",
        email: player.email || "",
        phone: player.phone || "",
        academy_name: player.academy_name || "",
    };
}

export function normalizeOutsidePlayerPayload(values) {
    return {
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        academy_name: values.academy_name.trim(),
    };
}

export default function OutsidePlayerForm({ formId, values, onChange, onSubmit, error, loading = false }) {
    const handleChange = (field) => (event) => {
        onChange({ ...values, [field]: event.target.value });
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
                    <label className="form-label">Academy Name</label>
                    <input className="form-control" value={values.academy_name} onChange={handleChange("academy_name")} disabled={loading} />
                </div>
            </div>
        </form>
    );
}
