"use client";

const emptyBranch = {
    branch_name: "",
    branch_code: "",
    contact_person: "",
    mobile: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    latitude: "",
    longitude: "",
    status: 1,
};

export function getEmptyBranch() {
    return { ...emptyBranch };
}

export function normalizeBranchPayload(values) {
    return {
        branch_name: values.branch_name.trim(),
        branch_code: values.branch_code.trim(),
        contact_person: values.contact_person.trim(),
        mobile: values.mobile.trim(),
        email: values.email.trim(),
        address: values.address.trim(),
        city: values.city.trim(),
        state: values.state.trim(),
        pincode: values.pincode.trim(),
        latitude: values.latitude === "" ? null : values.latitude,
        longitude: values.longitude === "" ? null : values.longitude,
        status: Number(values.status),
    };
}

export default function BranchForm({ formId, values, onChange, onSubmit, error, loading = false }) {
    const handleChange = (field) => (event) => {
        const value = field === "status" ? Number(event.target.value) : event.target.value;
        onChange({ ...values, [field]: value });
    };

    return (
        <form id={formId} onSubmit={onSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="row g-3">
                <div className="col-md-6">
                    <label className="form-label">Branch Name</label>
                    <input
                        className="form-control"
                        value={values.branch_name}
                        onChange={handleChange("branch_name")}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Branch Code</label>
                    <input
                        className="form-control"
                        value={values.branch_code}
                        onChange={handleChange("branch_code")}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Contact Person</label>
                    <input className="form-control" value={values.contact_person} onChange={handleChange("contact_person")} disabled={loading} />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Mobile</label>
                    <input className="form-control" value={values.mobile} onChange={handleChange("mobile")} disabled={loading} />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={values.email} onChange={handleChange("email")} disabled={loading} />
                </div>

                <div className="col-12">
                    <label className="form-label">Address</label>
                    <textarea className="form-control" rows={3} value={values.address} onChange={handleChange("address")} disabled={loading} />
                </div>

                <div className="col-md-4">
                    <label className="form-label">City</label>
                    <input className="form-control" value={values.city} onChange={handleChange("city")} disabled={loading} />
                </div>

                <div className="col-md-4">
                    <label className="form-label">State</label>
                    <input className="form-control" value={values.state} onChange={handleChange("state")} disabled={loading} />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Pincode</label>
                    <input className="form-control" value={values.pincode} onChange={handleChange("pincode")} disabled={loading} />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Latitude</label>
                    <input type="number" step="any" className="form-control" value={values.latitude ?? ""} onChange={handleChange("latitude")} disabled={loading} />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Longitude</label>
                    <input type="number" step="any" className="form-control" value={values.longitude ?? ""} onChange={handleChange("longitude")} disabled={loading} />
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
