"use client";

import { useState } from "react";

const emptyImage = {
    album_id: "",
    image_caption: "",
    sort_order: 0,
    status: 1,
};

export function getEmptyImage() {
    return { ...emptyImage };
}

export function imageToFormValues(image) {
    return {
        album_id: image.album_id || "",
        image_caption: image.image_caption || "",
        sort_order: image.sort_order ?? 0,
        status: image.status ?? 1,
    };
}

// Used for the "new" (multi-upload) form: field name "images" (matches API's formData.getAll("images"))
export function buildNewImagesFormData(values, files, extra = {}) {
    const formData = new FormData();

    formData.append("album_id", values.album_id);
    formData.append("image_caption", values.image_caption.trim());
    formData.append("sort_order", Number(values.sort_order) || 0);
    formData.append("status", Number(values.status));

    if (extra.uploaded_by) {
        formData.append("uploaded_by", extra.uploaded_by);
    }

    (files || []).forEach((file) => {
        formData.append("images", file);
    });

    return formData;
}

// Used for the "edit" form: single field name "image" (matches API's formData.get("image"))
export function buildEditImageFormData(values, file) {
    const formData = new FormData();

    formData.append("album_id", values.album_id);
    formData.append("image_caption", values.image_caption.trim());
    formData.append("sort_order", Number(values.sort_order) || 0);
    formData.append("status", Number(values.status));

    if (file) {
        formData.append("image", file);
    }

    return formData;
}

export function ImageBaseFields({ values, albums = [], onChange, loading = false }) {
    const handleChange = (field) => (event) => {
        const numericFields = ["album_id", "sort_order", "status"];
        const value = numericFields.includes(field) ? Number(event.target.value) : event.target.value;
        onChange({ ...values, [field]: value });
    };

    return (
        <div className="row g-3">
            <div className="col-md-6">
                <label className="form-label">Album</label>
                <select
                    className="form-select"
                    value={values.album_id}
                    onChange={handleChange("album_id")}
                    required
                    disabled={loading}
                >
                    <option value="">Select album</option>
                    {albums.map((album) => (
                        <option key={album.id} value={album.id}>{album.album_title}</option>
                    ))}
                </select>
            </div>

            <div className="col-md-6">
                <label className="form-label">Caption</label>
                <input
                    className="form-control"
                    value={values.image_caption}
                    onChange={handleChange("image_caption")}
                    disabled={loading}
                />
            </div>

            <div className="col-md-6">
                <label className="form-label">Sort Order</label>
                <input
                    type="number"
                    className="form-control"
                    value={values.sort_order}
                    onChange={handleChange("sort_order")}
                    disabled={loading}
                />
            </div>

            <div className="col-md-6">
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
    );
}

// Multi-file picker used on the "new" page
export function MultiImagePicker({ onFilesChange, loading = false }) {
    const [previews, setPreviews] = useState([]);

    const handleChange = (event) => {
        const files = Array.from(event.target.files || []);
        onFilesChange(files);
        setPreviews(files.map((file) => URL.createObjectURL(file)));
    };

    return (
        <div className="col-12">
            <label className="form-label">Images</label>
            <input
                type="file"
                accept="image/*"
                multiple
                className="form-control"
                onChange={handleChange}
                disabled={loading}
                required
            />
            {previews.length > 0 && (
                <div className="d-flex flex-wrap gap-2 mt-2">
                    {previews.map((src, index) => (
                        <img
                            key={index}
                            src={src}
                            alt={`preview-${index}`}
                            className="rounded-3 border"
                            style={{ width: 80, height: 80, objectFit: "cover" }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// Single-file picker used on the "edit" page
export function SingleImagePicker({ existingImage, onFileChange, loading = false }) {
    const [preview, setPreview] = useState("");

    const handleChange = (event) => {
        const file = event.target.files?.[0] || null;
        onFileChange(file);
        setPreview(file ? URL.createObjectURL(file) : "");
    };

    return (
        <div className="col-12">
            <label className="form-label">Replace Image (optional)</label>
            <input
                type="file"
                accept="image/*"
                className="form-control"
                onChange={handleChange}
                disabled={loading}
            />
            {(preview || existingImage) && (
                <img
                    src={preview || existingImage}
                    alt="preview"
                    className="mt-2 rounded-3 border"
                    style={{ height: 100, objectFit: "cover" }}
                />
            )}
        </div>
    );
}
