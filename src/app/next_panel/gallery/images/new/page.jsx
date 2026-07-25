"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UploadCloud } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";
import { getEmptyImage, buildNewImagesFormData, ImageBaseFields, MultiImagePicker } from "../ImageForm";

export default function NewGalleryImagesPage() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const [values, setValues] = useState(getEmptyImage());
    const [files, setFiles] = useState([]);
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

        if (!files.length) {
            setError("Please select at least one image.");
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const formData = buildNewImagesFormData(values, files, { uploaded_by: user?.id });

            const res = await fetch("/api/gallery/images", {
                method: "POST",
                body: formData,
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to upload images.");
            router.push(`/next_panel/gallery/images?album_id=${values.album_id}`);
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
                                <Link href="/next_panel/gallery/images" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Images
                                </Link>
                                <h1 className="h4 mb-2">Upload Images</h1>
                                <p className="text-muted mb-0">Upload one or more photos to an album.</p>
                            </div>
                            <button className="btn btn-primary" type="submit" form="imagesForm" disabled={saving || loading}>
                                <UploadCloud size={16} className="me-2" /> {saving ? "Uploading..." : "Upload"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading albums...</div>
                        ) : (
                            <form id="imagesForm" onSubmit={handleSubmit}>
                                {error && <div className="alert alert-danger">{error}</div>}
                                <ImageBaseFields values={values} albums={albums} onChange={setValues} loading={saving} />
                                <div className="row g-3 mt-1">
                                    <MultiImagePicker onFilesChange={setFiles} loading={saving} />
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
