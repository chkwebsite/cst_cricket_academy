"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";
import VideoForm, { getEmptyVideo, normalizeVideoPayload } from "../VideoForm";

export default function NewGalleryVideoPage() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const [values, setValues] = useState(getEmptyVideo());
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        async function loadAlbums() {
            try {
                const res = await fetch("/api/gallery/albums");
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || "Unable to load albums.");
                setAlbums(json.data || []);

                const presetAlbumId = searchParams.get("album_id");
                if (presetAlbumId) {
                    setValues((prev) => ({ ...prev, album_id: Number(presetAlbumId) }));
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadAlbums();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const res = await fetch("/api/gallery/videos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(normalizeVideoPayload(values, { uploaded_by: user?.id })),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to create video.");
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
                                <h1 className="h4 mb-2">Add Video</h1>
                                <p className="text-muted mb-0">Attach a video (link or upload) to an album.</p>
                            </div>
                            <button className="btn btn-primary" type="submit" form="videoForm" disabled={saving || loading}>
                                <Plus size={16} className="me-2" /> {saving ? "Saving..." : "Save Video"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading albums...</div>
                        ) : (
                            <VideoForm
                                formId="videoForm"
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
