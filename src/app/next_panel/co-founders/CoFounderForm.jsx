"use client";

import dynamic from "next/dynamic";

const JoditEditor = dynamic(() => import("jodit-react"), {
    ssr: false,
    loading: () => <div className="border rounded-3 p-4 text-muted">Loading editor...</div>,
});

const emptyCoFounder = {
    title: "",
    name: "",
    designation: "",
    sub_designation: "",
    description: "",
    experience: "",
    qualification: "",
    display_order: 0,
    status: 1,
    profile_image: null,
};

export function getEmptyCoFounder() {
    return { ...emptyCoFounder };
}

export function coFounderToFormValues(coFounder) {
    return {
        title: coFounder.title || "",
        name: coFounder.name || "",
        designation: coFounder.designation || "",
        sub_designation: coFounder.sub_designation || "",
        description: coFounder.description || "",
        experience: coFounder.experience || "",
        qualification: coFounder.qualification || "",
        display_order: coFounder.display_order ?? 0,
        status: coFounder.status ?? 1,
        profile_image: null,
    };
}

export function buildCoFounderFormData(values) {
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

export default function CoFounderForm({
    formId,
    values,
    onChange,
    onSubmit,
    error,
    loading = false,
    imagePreview = null,
    existingImage = null,
}) {
    const editorConfig = {
        readonly: loading,
        height: 320,
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

        const numericFields = ["display_order", "status"];
        const value = numericFields.includes(field) ? Number(event.target.value) : event.target.value;
        onChange({ ...values, [field]: value });
    };

    const previewSrc = imagePreview || existingImage;
    const handleDescriptionChange = (content) => {
        onChange({ ...values, description: content });
    };

    return (
        <form id={formId} onSubmit={onSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="row g-3">
                <div className="col-md-4">
                    <label className="form-label">Title</label>
                    <input className="form-control" value={values.title} onChange={handleChange("title")} disabled={loading} placeholder="Mr, Ms, Dr" />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Name</label>
                    <input className="form-control" value={values.name} onChange={handleChange("name")} required disabled={loading} />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Designation</label>
                    <input className="form-control" value={values.designation} onChange={handleChange("designation")} required disabled={loading} />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Sub Designation</label>
                    <input className="form-control" value={values.sub_designation} onChange={handleChange("sub_designation")} disabled={loading} />
                </div>

                <div className="col-md-3">
                    <label className="form-label">Experience</label>
                    <input className="form-control" value={values.experience} onChange={handleChange("experience")} disabled={loading} placeholder="15 years" />
                </div>

                <div className="col-md-3">
                    <label className="form-label">Qualification</label>
                    <input className="form-control" value={values.qualification} onChange={handleChange("qualification")} disabled={loading} />
                </div>

                <div className="col-12">
                    <label className="form-label">Description</label>
                    <JoditEditor
                        value={values.description}
                        config={editorConfig}
                        onBlur={handleDescriptionChange}
                    />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Display Order</label>
                    <input type="number" className="form-control" value={values.display_order} onChange={handleChange("display_order")} disabled={loading} />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={values.status} onChange={handleChange("status")} disabled={loading}>
                        <option value={1}>Active</option>
                        <option value={0}>Inactive</option>
                    </select>
                </div>

                <div className="col-md-4">
                    <label className="form-label">Profile Image</label>
                    <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="form-control" onChange={handleChange("profile_image")} disabled={loading} />
                    <div className="form-text">JPG, PNG or WEBP under 2 MB.</div>
                </div>

                {previewSrc && (
                    <div className="col-12">
                        <div className="border rounded-3 p-3 d-inline-block bg-light">
                            <img src={previewSrc} alt="Co-founder preview" className="img-fluid rounded-3" style={{ maxHeight: 180, maxWidth: 260, objectFit: "cover" }} />
                        </div>
                    </div>
                )}
            </div>
        </form>
    );
}
