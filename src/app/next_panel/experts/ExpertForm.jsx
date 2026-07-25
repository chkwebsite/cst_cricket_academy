"use client";

import dynamic from "next/dynamic";

const JoditEditor = dynamic(() => import("jodit-react"), {
    ssr: false,
    loading: () => <div className="border rounded-3 p-4 text-muted">Loading editor...</div>,
});

const emptyExpert = {
    branch_id: "",
    expert_name: "",
    designation: "",
    about: "",
    status: 1,
    profile_image: null,
};

export function getEmptyExpert() {
    return { ...emptyExpert };
}

export function expertToFormValues(expert) {
    return {
        branch_id: expert.branch_id || "",
        expert_name: expert.expert_name || "",
        designation: expert.designation || "",
        about: expert.about || "",
        status: expert.status ?? 1,
        profile_image: null,
    };
}

export function buildExpertFormData(values) {
    const formData = new FormData();

    Object.entries(values).forEach(([key, value]) => {
        if (key === "profile_image") {
            if (value instanceof File) formData.append(key, value);
            return;
        }

        formData.append(key, value ?? "");
    });

    return formData;
}

export function getBranchName(branches, branchId) {
    const branch = branches.find((item) => Number(item.id) === Number(branchId));
    return branch?.branch_name || "";
}

export default function ExpertForm({
    formId,
    values,
    branches = [],
    onChange,
    onSubmit,
    error,
    loading = false,
    imagePreview = null,
    existingImage = null,
}) {
    const editorConfig = {
        readonly: loading,
        height: 300,
        toolbarAdaptive: false,
        buttons: [
            "bold",
            "italic",
            "underline",
            "|",
            "ul",
            "ol",
            "|",
            "font",
            "fontsize",
            "brush",
            "|",
            "align",
            "link",
            "|",
            "undo",
            "redo",
            "|",
            "hr",
            "eraser",
            "source",
        ],
    };

    const handleChange = (field) => (event) => {
        if (field === "profile_image") {
            onChange({ ...values, profile_image: event.target.files?.[0] || null });
            return;
        }

        const numericFields = ["branch_id", "status"];
        const value = numericFields.includes(field) ? Number(event.target.value) : event.target.value;
        onChange({ ...values, [field]: value });
    };

    const handleAboutChange = (content) => {
        onChange({ ...values, about: content });
    };

    const previewSrc = imagePreview || existingImage;

    return (
        <form id={formId} onSubmit={onSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="row g-3">
                <div className="col-md-4">
                    <label className="form-label">Branch</label>
                    <select className="form-select" value={values.branch_id} onChange={handleChange("branch_id")} disabled={loading}>
                        <option value="">Select branch</option>
                        {branches.map((branch) => (
                            <option key={branch.id} value={branch.id}>{branch.branch_name}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-4">
                    <label className="form-label">Expert Name</label>
                    <input className="form-control" value={values.expert_name} onChange={handleChange("expert_name")} required disabled={loading} />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Designation</label>
                    <input className="form-control" value={values.designation} onChange={handleChange("designation")} required disabled={loading} />
                </div>

                <div className="col-md-8">
                    <label className="form-label">Profile Image</label>
                    <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="form-control" onChange={handleChange("profile_image")} disabled={loading} />
                    <div className="form-text">JPG, PNG or WEBP under 2 MB.</div>
                </div>

                <div className="col-md-4">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={values.status} onChange={handleChange("status")} disabled={loading}>
                        <option value={1}>Active</option>
                        <option value={0}>Inactive</option>
                    </select>
                </div>

                {previewSrc && (
                    <div className="col-12">
                        <div className="border rounded-3 p-3 d-inline-block bg-light">
                            <img src={previewSrc} alt="Expert preview" className="img-fluid rounded-3" style={{ maxHeight: 180, maxWidth: 260, objectFit: "cover" }} />
                        </div>
                    </div>
                )}

                <div className="col-12">
                    <label className="form-label">About</label>
                    <JoditEditor
                        value={values.about}
                        config={editorConfig}
                        onBlur={handleAboutChange}
                    />
                </div>
            </div>
        </form>
    );
}
