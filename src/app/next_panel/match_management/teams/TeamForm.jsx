"use client";

import { useEffect, useState } from "react";

const emptyTeam = {
    branch_id: "",
    team_name: "",
    team_code: "",
    category: "U-14",
    coach_name: "",
    status: 1,
};

const categoryOptions = ["U-10", "U-12", "U-14", "U-16", "U-19", "Senior"];

export function getEmptyTeam() {
    return { ...emptyTeam };
}

export function teamToFormValues(team) {
    return {
        branch_id: team.branch_id || "",
        team_name: team.team_name || "",
        team_code: team.team_code || "",
        category: team.category || "U-14",
        coach_name: team.coach_name || "",
        status: team.status ?? 1,
    };
}

export function getTeamLogoUrl(team) {
    if (!team?.team_logo) return null;
    return `/images/uploads/teams/${team.team_logo}`;
}

export function buildTeamFormData(values, logoFile) {
    const formData = new FormData();
    formData.append("branch_id", values.branch_id || "");
    formData.append("team_name", values.team_name.trim());
    formData.append("team_code", values.team_code.trim());
    formData.append("category", values.category);
    formData.append("coach_name", values.coach_name.trim());
    formData.append("status", Number(values.status));

    if (logoFile) {
        formData.append("team_logo", logoFile);
    }

    return formData;
}

export default function TeamForm({ formId, values, branches = [], currentLogoUrl, onChange, onLogoChange, onSubmit, error, loading = false }) {
    const [logoFile, setLogoFile] = useState(null);
    const [preview, setPreview] = useState(currentLogoUrl || null);

    useEffect(() => {
        setPreview(currentLogoUrl || null);
    }, [currentLogoUrl]);

    const handleChange = (field) => (event) => {
        const numericFields = ["branch_id", "status"];
        const value = numericFields.includes(field) ? Number(event.target.value) : event.target.value;
        onChange({ ...values, [field]: value });
    };

    const handleLogoChange = (event) => {
        const file = event.target.files?.[0] || null;
        setLogoFile(file);
        onLogoChange(file);

        if (file) {
            setPreview(URL.createObjectURL(file));
        } else {
            setPreview(currentLogoUrl || null);
        }
    };

    return (
        <form id={formId} onSubmit={onSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="row g-3">
                <div className="col-md-6">
                    <label className="form-label">Team Name</label>
                    <input className="form-control" value={values.team_name} onChange={handleChange("team_name")} required disabled={loading} />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Team Code</label>
                    <input className="form-control" value={values.team_code} onChange={handleChange("team_code")} disabled={loading} />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Branch</label>
                    <select className="form-select" value={values.branch_id} onChange={handleChange("branch_id")} disabled={loading}>
                        <option value="">Select branch</option>
                        {branches.map((branch) => (
                            <option key={branch.id} value={branch.id}>{branch.branch_name}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-6">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={values.category} onChange={handleChange("category")} disabled={loading}>
                        {categoryOptions.map((option) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-6">
                    <label className="form-label">Coach Name</label>
                    <input className="form-control" value={values.coach_name} onChange={handleChange("coach_name")} disabled={loading} />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={values.status} onChange={handleChange("status")} disabled={loading}>
                        <option value={1}>Active</option>
                        <option value={0}>Inactive</option>
                    </select>
                </div>

                <div className="col-md-6">
                    <label className="form-label">Team Logo</label>
                    <input type="file" accept="image/*" className="form-control" onChange={handleLogoChange} disabled={loading} />
                </div>

                {preview && (
                    <div className="col-md-6 d-flex align-items-end">
                        <img src={preview} alt="Team logo preview" className="rounded-3 border" style={{ height: "64px", width: "64px", objectFit: "cover" }} />
                    </div>
                )}
            </div>
        </form>
    );
}
