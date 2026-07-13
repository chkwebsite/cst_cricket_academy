"use client";

import dynamic from "next/dynamic";
import Image from "next/image";

const JoditEditor = dynamic(() => import("jodit-react"), {
    ssr: false,
    loading: () => <div className="border rounded-3 p-4 text-muted">Loading editor...</div>,
});

const emptyCoachingProgram = {
    user_id: "",
    coach_id: "",
    branch_id: "",
    title: "",
    slug: "",
    designation: "",
    sub_designation: "",
    about_me: "",
    description: "",
    start_date: "",
    end_date: "",
    start_time: "",
    end_time: "",
    duration: "",
    days: "",
    age_group: "",
    skill_level: "",
    total_seats: "",
    available_seats: "",
    fees: "",
    display_order: 0,
    featured: 0,
    status: 1,
    program_image: null,
};

export function getEmptyProfile() {
    return { ...emptyCoachingProgram };
}

export function formatDateInput(value) {
    if (!value) return "";
    return String(value).slice(0, 10);
}

export function formatTimeInput(value) {
    if (!value) return "";
    return String(value).slice(0, 5);
}

export function profileToFormValues(program) {
    return {
        user_id: program.user_id || "",
        coach_id: program.coach_id || "",
        branch_id: program.branch_id || "",
        title: program.title || "",
        slug: program.slug || "",
        designation: program.designation || "",
        sub_designation: program.sub_designation || "",
        about_me: program.about_me || "",
        description: program.description || "",
        start_date: formatDateInput(program.start_date),
        end_date: formatDateInput(program.end_date),
        start_time: formatTimeInput(program.start_time),
        end_time: formatTimeInput(program.end_time),
        duration: program.duration || "",
        days: program.days || "",
        age_group: program.age_group || "",
        skill_level: program.skill_level || "",
        total_seats: program.total_seats ?? "",
        available_seats: program.available_seats ?? "",
        fees: program.fees ?? "",
        display_order: program.display_order ?? 0,
        featured: program.featured ?? 0,
        status: program.status ?? 1,
        program_image: null,
    };
}

export function buildCoachingProgramFormData(values) {
    const formData = new FormData();

    Object.entries(values).forEach(([key, value]) => {
        if (key === "program_image") {
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

export function getImageSrc(path) {
    if (!path) return null;
    if (String(path).startsWith("http") || String(path).startsWith("/")) return path;
    return `/${String(path).replace(/^public[\\/]/, "").replace(/\\/g, "/")}`;
}

export default function ProfileForm({
    formId,
    values,
    users = [],
    branches = [],
    coaches = [],
    onChange,
    onSubmit,
    error,
    loading = false,
    imagePreview = null,
    existingImage = null,
}) {
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
        if (field === "program_image") {
            onChange({ ...values, program_image: event.target.files?.[0] || null });
            return;
        }

        const numericFields = ["user_id", "coach_id", "branch_id", "total_seats", "available_seats", "fees", "display_order", "featured", "status"];
        const value = numericFields.includes(field) ? event.target.value : event.target.value;
        onChange({ ...values, [field]: value });
    };

    const handleEditorChange = (field) => (content) => {
        onChange({ ...values, [field]: content });
    };

    const previewSrc = imagePreview || getImageSrc(existingImage);

    return (
        <form id={formId} onSubmit={onSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="row g-3">
                <div className="col-md-4">
                    <label className="form-label">Program Owner</label>
                    <select className="form-select" value={values.user_id} onChange={handleChange("user_id")} disabled={loading}>
                        <option value="">Select user</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>{getUserName(user)}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-4">
                    <label className="form-label">Coach</label>
                    <select className="form-select" value={values.coach_id} onChange={handleChange("coach_id")} disabled={loading}>
                        <option value="">Select coach</option>
                        {coaches.map((coach) => (
                            <option key={coach.id} value={coach.id}>
                                {[coach.title, getUserName(coach)].filter(Boolean).join(" - ") || `Coach #${coach.id}`}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-md-4">
                    <label className="form-label">Branch</label>
                    <select className="form-select" value={values.branch_id} onChange={handleChange("branch_id")} disabled={loading}>
                        <option value="">Select branch</option>
                        {branches.map((branch) => (
                            <option key={branch.id} value={branch.id}>{branch.branch_name}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-6">
                    <label className="form-label">Title</label>
                    <input className="form-control" value={values.title} onChange={handleChange("title")} required disabled={loading} />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Slug</label>
                    <input className="form-control" value={values.slug} onChange={handleChange("slug")} disabled={loading} />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Designation</label>
                    <input className="form-control" value={values.designation} onChange={handleChange("designation")} required disabled={loading} />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Sub Designation</label>
                    <input className="form-control" value={values.sub_designation} onChange={handleChange("sub_designation")} disabled={loading} />
                </div>

                <div className="col-md-3">
                    <label className="form-label">Start Date</label>
                    <input type="date" className="form-control" value={values.start_date} onChange={handleChange("start_date")} disabled={loading} />
                </div>

                <div className="col-md-3">
                    <label className="form-label">End Date</label>
                    <input type="date" className="form-control" value={values.end_date} onChange={handleChange("end_date")} disabled={loading} />
                </div>

                <div className="col-md-3">
                    <label className="form-label">Start Time</label>
                    <input type="time" className="form-control" value={values.start_time} onChange={handleChange("start_time")} disabled={loading} />
                </div>

                <div className="col-md-3">
                    <label className="form-label">End Time</label>
                    <input type="time" className="form-control" value={values.end_time} onChange={handleChange("end_time")} disabled={loading} />
                </div>

                <div className="col-md-3">
                    <label className="form-label">Duration</label>
                    <input className="form-control" value={values.duration} onChange={handleChange("duration")} disabled={loading} placeholder="8 weeks" />
                </div>

                <div className="col-md-3">
                    <label className="form-label">Days</label>
                    <input className="form-control" value={values.days} onChange={handleChange("days")} disabled={loading} placeholder="Mon, Wed, Fri" />
                </div>

                <div className="col-md-3">
                    <label className="form-label">Age Group</label>
                    <input className="form-control" value={values.age_group} onChange={handleChange("age_group")} disabled={loading} placeholder="Under 16" />
                </div>

                <div className="col-md-3">
                    <label className="form-label">Skill Level</label>
                    <input className="form-control" value={values.skill_level} onChange={handleChange("skill_level")} disabled={loading} placeholder="Beginner" />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Total Seats</label>
                    <input type="number" min="0" className="form-control" value={values.total_seats} onChange={handleChange("total_seats")} disabled={loading} />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Available Seats</label>
                    <input type="number" min="0" className="form-control" value={values.available_seats} onChange={handleChange("available_seats")} disabled={loading} />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Fees</label>
                    <input type="number" min="0" step="0.01" className="form-control" value={values.fees} onChange={handleChange("fees")} disabled={loading} />
                </div>

                <div className="col-md-6">
                    <label className="form-label">About Program</label>
                    <JoditEditor value={values.about_me} config={editorConfig} onBlur={handleEditorChange("about_me")} />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Description</label>
                    <JoditEditor value={values.description} config={editorConfig} onBlur={handleEditorChange("description")} />
                </div>

                <div className="col-md-3">
                    <label className="form-label">Display Order</label>
                    <input type="number" className="form-control" value={values.display_order} onChange={handleChange("display_order")} disabled={loading} />
                </div>

                <div className="col-md-3">
                    <label className="form-label">Featured</label>
                    <select className="form-select" value={values.featured} onChange={handleChange("featured")} disabled={loading}>
                        <option value={1}>Yes</option>
                        <option value={0}>No</option>
                    </select>
                </div>

                <div className="col-md-3">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={values.status} onChange={handleChange("status")} disabled={loading}>
                        <option value={1}>Active</option>
                        <option value={0}>Inactive</option>
                    </select>
                </div>

                <div className="col-md-3">
                    <label className="form-label">Program Image</label>
                    <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="form-control" onChange={handleChange("program_image")} disabled={loading} />
                    <div className="form-text">JPG, PNG or WEBP under 2 MB.</div>
                </div>

                {previewSrc && (
                    <div className="col-12">
                        <div className="border rounded-3 p-3 d-inline-block bg-light">
                            <Image src={previewSrc} alt="Program preview" width={280} height={180} className="img-fluid rounded-3" style={{ objectFit: "cover" }} unoptimized />
                        </div>
                    </div>
                )}
            </div>
        </form>
    );
}
