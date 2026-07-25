"use client";

import { useState } from "react";
import { slugify } from "../categories/CategoryForm";

const emptyAlbum = {
    category_id: "",
    branch_id: "",
    album_title: "",
    slug: "",
    description: "",
    event_date: "",
    location: "",
    is_featured: 0,
    sort_order: 0,
    status: 1,
};

export function getEmptyAlbum() {
    return { ...emptyAlbum };
}

export function formatDateInput(value) {
    if (!value) return "";
    return String(value).slice(0, 10);
}

export function albumToFormValues(album) {
    return {
        category_id: album.category_id || "",
        branch_id: album.branch_id || "",
        album_title: album.album_title || "",
        slug: album.slug || "",
        description: album.description || "",
        event_date: formatDateInput(album.event_date),
        location: album.location || "",
        is_featured: album.is_featured ?? 0,
        sort_order: album.sort_order ?? 0,
        status: album.status ?? 1,
    };
}

// Albums API expects multipart/form-data (cover_image file upload)
export function buildAlbumFormData(values, coverImageFile, extra = {}) {
    const formData = new FormData();

    formData.append("category_id", values.category_id);
    formData.append("branch_id", values.branch_id || "");
    formData.append("album_title", values.album_title.trim());
    formData.append("slug", (values.slug || slugify(values.album_title)).trim());
    formData.append("description", values.description.trim());
    formData.append("event_date", values.event_date || "");
    formData.append("location", values.location.trim());
    formData.append("is_featured", Number(values.is_featured) || 0);
    formData.append("sort_order", Number(values.sort_order) || 0);
    formData.append("status", Number(values.status));

    if (extra.created_by) {
        formData.append("created_by", extra.created_by);
    }

    if (coverImageFile) {
        formData.append("cover_image", coverImageFile);
    }

    return formData;
}

export default function AlbumForm({
    formId,
    values,
    categories = [],
    branches = [],
    onChange,
    onSubmit,
    error,
    loading = false,
    existingCoverImage = "",
    onCoverImageFileChange,
}) {
    const [previewUrl, setPreviewUrl] = useState("");

    const handleChange = (field) => (event) => {
        const numericFields = ["category_id", "branch_id", "is_featured", "sort_order", "status"];
        const value = numericFields.includes(field) ? Number(event.target.value) : event.target.value;
        const next = { ...values, [field]: value };

        if (field === "album_title" && !values.slug) {
            next.slug = slugify(event.target.value);
        }

        onChange(next);
    };

    const handleFileChange = (event) => {
        const file = event.target.files?.[0] || null;
        onCoverImageFileChange?.(file);
        setPreviewUrl(file ? URL.createObjectURL(file) : "");
    };

    return (
        <form id={formId} onSubmit={onSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="row g-3">
                <div className="col-md-6">
                    <label className="form-label">Category</label>
                    <select
                        className="form-select"
                        value={values.category_id}
                        onChange={handleChange("category_id")}
                        required
                        disabled={loading}
                    >
                        <option value="">Select category</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>{category.category_name}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-6">
                    <label className="form-label">Branch</label>
                    <select
                        className="form-select"
                        value={values.branch_id}
                        onChange={handleChange("branch_id")}
                        disabled={loading}
                    >
                        <option value="">All branches</option>
                        {branches.map((branch) => (
                            <option key={branch.id} value={branch.id}>{branch.branch_name}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-6">
                    <label className="form-label">Album Title</label>
                    <input
                        className="form-control"
                        value={values.album_title}
                        onChange={handleChange("album_title")}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Slug</label>
                    <input
                        className="form-control"
                        value={values.slug}
                        onChange={handleChange("slug")}
                        placeholder="auto-generated-from-title"
                        disabled={loading}
                    />
                </div>

                <div className="col-12">
                    <label className="form-label">Description</label>
                    <textarea
                        className="form-control"
                        rows={3}
                        value={values.description}
                        onChange={handleChange("description")}
                        disabled={loading}
                    />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Event Date</label>
                    <input
                        type="date"
                        className="form-control"
                        value={values.event_date}
                        onChange={handleChange("event_date")}
                        disabled={loading}
                    />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Location</label>
                    <input
                        className="form-control"
                        value={values.location}
                        onChange={handleChange("location")}
                        disabled={loading}
                    />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Featured Album?</label>
                    <select
                        className="form-select"
                        value={values.is_featured}
                        onChange={handleChange("is_featured")}
                        disabled={loading}
                    >
                        <option value={0}>No</option>
                        <option value={1}>Yes</option>
                    </select>
                </div>

                <div className="col-md-6">
                    <label className="form-label">Cover Image</label>
                    <input
                        type="file"
                        accept="image/*"
                        className="form-control"
                        onChange={handleFileChange}
                        disabled={loading}
                    />
                    {(previewUrl || existingCoverImage) && (
                        <img
                            src={previewUrl || existingCoverImage}
                            alt="cover preview"
                            className="mt-2 rounded-3 border"
                            style={{ height: 90, objectFit: "cover" }}
                        />
                    )}
                </div>

                <div className="col-md-3">
                    <label className="form-label">Sort Order</label>
                    <input
                        type="number"
                        className="form-control"
                        value={values.sort_order}
                        onChange={handleChange("sort_order")}
                        disabled={loading}
                    />
                </div>

                <div className="col-md-3">
                    <label className="form-label">Status</label>
                    <select
                        className="form-select"
                        value={values.status}
                        onChange={handleChange("status")}
                        disabled={loading}
                    >
                        <option value={1}>Active</option>
                        <option value={0}>Inactive</option>
                    </select>
                </div>
            </div>
        </form>
    );
}
