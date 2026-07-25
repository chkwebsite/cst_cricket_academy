"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import VideoForm, { getEmptyVideo, videoToFormValues, normalizeVideoPayload } from "../../VideoForm";

export default function EditGalleryVideoPage() {
    const [values, setValues] = useState(getEmptyVideo());
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        async function loadData() {
            try {
                const [videoRes, albumsRes] = await Promise.all([
                    fetch(`/api/gallery/videos/${params.id}`),
                    fetch("/api/gallery/albums"),
                ]);
                const videoJson = await videoRes.json();
                const albumsJson = await albumsRes.json();

                if (!videoRes.ok) throw new Error(videoJson.message || "Unable to load video.");

                setValues(videoToFormValues(videoJson.data));
                setAlbums(albumsJson.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [params.id]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const res = await fetch(`/api/gallery/videos/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(normalizeVideoPayload(values)),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to update video.");
            router.push(`/next_panel/gallery/videos?album_id=${values.album_id}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container-fluid">
            <div className="row g-4">
                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                            <div>
                                <Link href="/next_panel/gallery/videos" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Videos
                                </Link>
                                <h1 className="h4 mb-2">Edit Video</h1>
                                <p className="text-muted mb-0">Update video details.</p>
                            </div>
                            <button className="btn btn-primary" type="submit" form="videoEditForm" disabled={saving || loading}>
                                <Save size={16} className="me-2" /> {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading video details...</div>
                        ) : (
                            <VideoForm
                                formId="videoEditForm"
                                values={values}
                                albums={albums}
                                onChange={setValues}
                                onSubmit={handleSubmit}
                                error={error}
                                loading={saving}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

