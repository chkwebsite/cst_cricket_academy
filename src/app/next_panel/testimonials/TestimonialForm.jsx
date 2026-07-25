"use client";

import dynamic from "next/dynamic";

const JoditEditor = dynamic(() => import("jodit-react"), {
    ssr: false,
    loading: () => <div className="border rounded-3 p-4 text-muted">Loading editor...</div>,
});

const emptyTestimonial = {
    user_id: "",
    branch_id: "",
    student_name: "",
    parent_name: "",
    email: "",
    contact: "",
    designation: "",
    presented: "",
    testimonial: "",
    rating: 5,
    display_order: 0,
    featured: 0,
    video_url: "",
    status: 1,
    profile_image: null,
};

export function getEmptyTestimonial() {
    return { ...emptyTestimonial };
}

export function testimonialToFormValues(testimonial) {
    return {
        user_id: testimonial.user_id ?? "",
        branch_id: testimonial.branch_id ?? "",
        student_name: testimonial.student_name || "",
        parent_name: testimonial.parent_name || "",
        email: testimonial.email || "",
        contact: testimonial.contact || "",
        designation: testimonial.designation || "",
        presented: testimonial.presented || "",
        testimonial: testimonial.testimonial || "",
        rating: testimonial.rating ?? 5,
        display_order: testimonial.display_order ?? 0,
        featured: testimonial.featured ?? 0,
        video_url: testimonial.video_url || "",
        status: testimonial.status ?? 1,
        profile_image: null,
    };
}

export function buildTestimonialFormData(values) {
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
export function getUserName(user) {
    if (!user) return "";
    return [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username || user.email || `User #${user.id}`;
}
export default function TestimonialForm({
    formId,
    values,
    onChange,
    onSubmit,
    users = [],
    branches = [],
    error,
    loading = false,
    imagePreview = null,
    existingImage = null,
}) {
    const editorConfig = {
        readonly: loading,
        height: 260,
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

        const numericFields = ["user_id", "branch_id", "rating", "display_order", "featured", "status"];
        const value = numericFields.includes(field) ? Number(event.target.value) : event.target.value;
        onChange({ ...values, [field]: value });
    };

    const handleTestimonialChange = (content) => {
        onChange({ ...values, testimonial: content });
    };

    const previewSrc = imagePreview || existingImage;

    return (
        <form id={formId} onSubmit={onSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="row g-3">
                <div className="col-md-4">
                    <label className="form-label">User</label>
                    <select className="form-select" value={values.user_id} onChange={handleChange("user_id")} required disabled={loading}>
                        <option value="">Select user</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>{getUserName(user)}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-4">
                    <label className="form-label">Branch</label>
                    <select className="form-select" value={values.branch_id} onChange={handleChange("branch_id")} required disabled={loading}>
                        <option value="">Select branch</option>
                        {branches.map((branch) => (
                            <option key={branch.id} value={branch.id}>{branch.branch_name}</option>
                        ))}
                    </select>
                </div>
                <div className="col-md-4">
                    <label className="form-label">Student Name</label>
                    <input className="form-control" value={values.student_name} onChange={handleChange("student_name")} required disabled={loading} />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Parent Name</label>
                    <input className="form-control" value={values.parent_name} onChange={handleChange("parent_name")} required disabled={loading} />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Designation</label>
                    <input className="form-control" value={values.designation} onChange={handleChange("designation")} disabled={loading} placeholder="e.g. Alumni, Student" />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={values.email} onChange={handleChange("email")} disabled={loading} />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Contact</label>
                    <input className="form-control" value={values.contact} onChange={handleChange("contact")} disabled={loading} />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Presented</label>
                    <input className="form-control" value={values.presented} onChange={handleChange("presented")} disabled={loading} placeholder="e.g. Batch of 2024" />
                </div>

                <div className="col-12">
                    <label className="form-label">Testimonial</label>
                    <JoditEditor
                        value={values.testimonial}
                        config={editorConfig}
                        onBlur={handleTestimonialChange}
                    />
                </div>

                <div className="col-md-3">
                    <label className="form-label">Rating</label>
                    <select className="form-select" value={values.rating} onChange={handleChange("rating")} disabled={loading}>
                        {[1, 2, 3, 4, 5].map((r) => (
                            <option key={r} value={r}>{r} Star{r > 1 ? "s" : ""}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-3">
                    <label className="form-label">Display Order</label>
                    <input type="number" className="form-control" value={values.display_order} onChange={handleChange("display_order")} disabled={loading} />
                </div>

                <div className="col-md-3">
                    <label className="form-label">Featured</label>
                    <select className="form-select" value={values.featured} onChange={handleChange("featured")} disabled={loading}>
                        <option value={0}>No</option>
                        <option value={1}>Yes</option>
                    </select>
                </div>

                <div className="col-md-3">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={values.status} onChange={handleChange("status")} disabled={loading}>
                        <option value={1}>Active</option>
                        <option value={0}>Inactive</option>
                    </select>
                </div>

                <div className="col-md-6">
                    <label className="form-label">Video URL</label>
                    <input className="form-control" value={values.video_url} onChange={handleChange("video_url")} disabled={loading} placeholder="https://..." />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Profile Image</label>
                    <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="form-control" onChange={handleChange("profile_image")} disabled={loading} />
                    <div className="form-text">JPG, PNG or WEBP under 2 MB.</div>
                </div>

                {previewSrc && (
                    <div className="col-12">
                        <div className="border rounded-3 p-3 d-inline-block bg-light">
                            <img src={previewSrc} alt="Testimonial preview" className="img-fluid rounded-3" style={{ maxHeight: 180, maxWidth: 260, objectFit: "cover" }} />
                        </div>
                    </div>
                )}
            </div>
        </form>
    );
}
