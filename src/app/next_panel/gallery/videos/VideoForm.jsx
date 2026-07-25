"use client";

const emptyVideo = {
    album_id: "",
    video_title: "",
    video_url: "",
    video_type: "Upload",
    duration: "",
    sort_order: 0,
    status: 1,
};

export function getEmptyVideo() {
    return { ...emptyVideo };
}

export function videoToFormValues(video) {
    return {
        album_id: video.album_id || "",
        video_title: video.video_title || "",
        video_url: video.video_url || "",
        video_type: video.video_type || "Upload",
        duration: video.duration || "",
        sort_order: video.sort_order ?? 0,
        status: video.status ?? 1,
    };
}

export function normalizeVideoPayload(values, extra = {}) {
    return {
        album_id: Number(values.album_id),
        video_title: values.video_title.trim(),
        video_url: values.video_url.trim(),
        video_type: values.video_type,
        duration: values.duration.trim(),
        sort_order: Number(values.sort_order) || 0,
        status: Number(values.status),
        uploaded_by: extra.uploaded_by || null,
    };
}

export default function VideoForm({ formId, values, albums = [], onChange, onSubmit, error, loading = false }) {
    const handleChange = (field) => (event) => {
        const numericFields = ["album_id", "sort_order", "status"];
        const value = numericFields.includes(field) ? Number(event.target.value) : event.target.value;
        onChange({ ...values, [field]: value });
    };

    return (
        <form id={formId} onSubmit={onSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}

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
                    <label className="form-label">Video Title</label>
                    <input
                        className="form-control"
                        value={values.video_title}
                        onChange={handleChange("video_title")}
                        disabled={loading}
                    />
                </div>

                <div className="col-md-8">
                    <label className="form-label">Video URL</label>
                    <input
                        type="url"
                        className="form-control"
                        value={values.video_url}
                        onChange={handleChange("video_url")}
                        placeholder="https://www.youtube.com/watch?v=... or /uploads/gallery/videos/..."
                        required
                        disabled={loading}
                    />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Video Type</label>
                    <select
                        className="form-select"
                        value={values.video_type}
                        onChange={handleChange("video_type")}
                        disabled={loading}
                    >
                        <option value="Upload">Upload</option>
                        <option value="YouTube">YouTube</option>
                        <option value="Vimeo">Vimeo</option>
                        <option value="Embed">Embed</option>
                    </select>
                </div>

                <div className="col-md-4">
                    <label className="form-label">Duration</label>
                    <input
                        className="form-control"
                        value={values.duration}
                        onChange={handleChange("duration")}
                        placeholder="e.g. 03:45"
                        disabled={loading}
                    />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Sort Order</label>
                    <input
                        type="number"
                        className="form-control"
                        value={values.sort_order}
                        onChange={handleChange("sort_order")}
                        disabled={loading}
                    />
                </div>

                <div className="col-md-4">
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
