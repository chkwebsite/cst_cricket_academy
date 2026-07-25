"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { getEmptyImage, imageToFormValues, buildEditImageFormData, ImageBaseFields, SingleImagePicker } from "../../ImageForm";

export default function EditGalleryImagePage() {
    const [values, setValues] = useState(getEmptyImage());
    const [file, setFile] = useState(null);
    const [existingImage, setExistingImage] = useState("");
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        async function loadData() {
            try {
                const [imageRes, albumsRes] = await Promise.all([
                    fetch(`/api/gallery/images/${params.id}`),
                    fetch("/api/gallery/albums"),
                ]);
                const imageJson = await imageRes.json();
                const albumsJson = await albumsRes.json();

                if (!imageRes.ok) throw new Error(imageJson.message || "Unable to load image.");

                setValues(imageToFormValues(imageJson.data));
                setExistingImage(imageJson.data.image_path || "");
                setAlbums(albumsJson.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [params.id]);
    // console.log("albums", albums);
    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const formData = buildEditImageFormData(values, file);

            const res = await fetch(`/api/gallery/images/${params.id}`, {
                method: "PUT",
                body: formData,
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to update image.");
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
                                <h1 className="h4 mb-2">Edit Image</h1>
                                <p className="text-muted mb-0">Update caption, order, status, or replace the image file.</p>
                            </div>
                            <button className="btn btn-primary" type="submit" form="imageEditForm" disabled={saving || loading}>
                                <Save size={16} className="me-2" /> {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading image details...</div>
                        ) : (
                            <form id="imageEditForm" onSubmit={handleSubmit}>
                                {error && <div className="alert alert-danger">{error}</div>}
                                <ImageBaseFields values={values} albums={albums} onChange={setValues} loading={saving} />
                                <div className="row g-3 mt-1">
                                    <SingleImagePicker existingImage={existingImage} onFileChange={setFile} loading={saving} />
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
