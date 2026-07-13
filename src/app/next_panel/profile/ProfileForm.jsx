"use client";

import dynamic from "next/dynamic";

const JoditEditor = dynamic(() => import("jodit-react"), {
    ssr: false,
    loading: () => <div className="border rounded-3 p-4 text-muted">Loading editor...</div>,
});

const emptyProfile = {
    user_id: "",
    visiting_coaches: "",
    branch_id: "",
    title: "",
    designation: "",
    sub_designation: "",
    about_me: "",
    description: "",
    experience: "",
    qualification: "",
    specialization: "",
    achievements: "",
    date_of_joining: "",
    facebook_url: "",
    instagram_url: "",
    linkedin_url: "",
    twitter_url: "",
    youtube_url: "",
    website_url: "",
    display_order: 0,
    status: 1,
};

export function getEmptyProfile() {
    return { ...emptyProfile };
}

export function formatDateInput(value) {
    if (!value) return "";
    return String(value).slice(0, 10);
}

export function profileToFormValues(profile) {
    return {
        user_id: profile.user_id || "",
        visiting_coaches: profile.visiting_coaches || "",
        branch_id: profile.branch_id || "",
        title: profile.title || "",
        designation: profile.designation || "",
        sub_designation: profile.sub_designation || "",
        about_me: profile.about_me || "",
        description: profile.description || "",
        experience: profile.experience || "",
        qualification: profile.qualification || "",
        specialization: profile.specialization || "",
        achievements: profile.achievements || "",
        date_of_joining: formatDateInput(profile.date_of_joining),
        facebook_url: profile.facebook_url || "",
        instagram_url: profile.instagram_url || "",
        linkedin_url: profile.linkedin_url || "",
        twitter_url: profile.twitter_url || "",
        youtube_url: profile.youtube_url || "",
        website_url: profile.website_url || "",
        display_order: profile.display_order ?? 0,
        status: profile.status ?? 1,
    };
}

export function normalizeProfilePayload(values) {
    return {
        user_id: Number(values.user_id),
        branch_id: Number(values.branch_id),
        visiting_coaches: values.visiting_coaches.trim(),
        title: values.title.trim(),
        designation: values.designation.trim(),
        sub_designation: values.sub_designation.trim(),
        about_me: values.about_me.trim(),
        description: values.description.trim(),
        experience: values.experience.trim(),
        qualification: values.qualification.trim(),
        specialization: values.specialization.trim(),
        achievements: values.achievements.trim(),
        date_of_joining: values.date_of_joining || null,
        facebook_url: values.facebook_url.trim(),
        instagram_url: values.instagram_url.trim(),
        linkedin_url: values.linkedin_url.trim(),
        twitter_url: values.twitter_url.trim(),
        youtube_url: values.youtube_url.trim(),
        website_url: values.website_url.trim(),
        display_order: Number(values.display_order) || 0,
        status: Number(values.status),
    };
}

export function getUserName(user) {
    if (!user) return "";
    return [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username || user.email || `User #${user.id}`;
}

export default function ProfileForm({ formId, values, users = [], branches = [], onChange, onSubmit, error, loading = false }) {
    const editorConfig = {
        readonly: loading,
        height: 280,
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
        const numericFields = ["user_id", "branch_id", "display_order", "status"];
        const value = numericFields.includes(field) ? Number(event.target.value) : event.target.value;
        onChange({ ...values, [field]: value });
    };

    const handleEditorChange = (field) => (content) => {
        onChange({ ...values, [field]: content });
    };

    return (
        <form id={formId} onSubmit={onSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="row g-3">
                <div className="col-md-6">
                    <label className="form-label">User</label>
                    <select className="form-select" value={values.user_id} onChange={handleChange("user_id")} required disabled={loading}>
                        <option value="">Select user</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>{getUserName(user)}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-6">
                    <label className="form-label">Branch</label>
                    <select className="form-select" value={values.branch_id} onChange={handleChange("branch_id")} required disabled={loading}>
                        <option value="">Select branch</option>
                        {branches.map((branch) => (
                            <option key={branch.id} value={branch.id}>{branch.branch_name}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-6">
                    <label className="form-label">Visiting Coaches</label>
                    <select className="form-select" value={values.visiting_coaches} onChange={handleChange("visiting_coaches")} required disabled={loading}>
                        <option value="">Select visiting coach</option>
                        <option value={1}>Regular Coach</option>
                        <option value={0}>Visiting Coach</option>
                    </select>
                </div>

                <div className="col-md-6">
                    <label className="form-label">Title</label>
                    <input className="form-control" value={values.title} onChange={handleChange("title")} required disabled={loading} />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Designation</label>
                    <input className="form-control" value={values.designation} onChange={handleChange("designation")} disabled={loading} />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Sub Designation</label>
                    <input className="form-control" value={values.sub_designation} onChange={handleChange("sub_designation")} disabled={loading} />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Experience</label>
                    <input className="form-control" value={values.experience} onChange={handleChange("experience")} disabled={loading} />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Qualification</label>
                    <input className="form-control" value={values.qualification} onChange={handleChange("qualification")} disabled={loading} />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Date of Joining</label>
                    <input type="date" className="form-control" value={values.date_of_joining} onChange={handleChange("date_of_joining")} disabled={loading} />
                </div>

                <div className="col-12">
                    <label className="form-label">Specialization</label>
                    <input className="form-control" value={values.specialization} onChange={handleChange("specialization")} disabled={loading} />
                </div>

                <div className="col-md-6">
                    <label className="form-label">About Me</label>
                    <JoditEditor
                        value={values.about_me}
                        config={editorConfig}
                        onBlur={handleEditorChange("about_me")}
                    />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Description</label>
                    <JoditEditor
                        value={values.description}
                        config={editorConfig}
                        onBlur={handleEditorChange("description")}
                    />
                </div>

                <div className="col-12">
                    <label className="form-label">Achievements</label>
                    <textarea className="form-control" rows={3} value={values.achievements} onChange={handleChange("achievements")} disabled={loading} />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Facebook URL</label>
                    <input type="url" className="form-control" value={values.facebook_url} onChange={handleChange("facebook_url")} disabled={loading} />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Instagram URL</label>
                    <input type="url" className="form-control" value={values.instagram_url} onChange={handleChange("instagram_url")} disabled={loading} />
                </div>

                <div className="col-md-4">
                    <label className="form-label">LinkedIn URL</label>
                    <input type="url" className="form-control" value={values.linkedin_url} onChange={handleChange("linkedin_url")} disabled={loading} />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Twitter URL</label>
                    <input type="url" className="form-control" value={values.twitter_url} onChange={handleChange("twitter_url")} disabled={loading} />
                </div>

                <div className="col-md-4">
                    <label className="form-label">YouTube URL</label>
                    <input type="url" className="form-control" value={values.youtube_url} onChange={handleChange("youtube_url")} disabled={loading} />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Website URL</label>
                    <input type="url" className="form-control" value={values.website_url} onChange={handleChange("website_url")} disabled={loading} />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Display Order</label>
                    <input type="number" className="form-control" value={values.display_order} onChange={handleChange("display_order")} disabled={loading} />
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
