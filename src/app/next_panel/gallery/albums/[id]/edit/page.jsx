"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";
import AlbumForm, { getEmptyAlbum, albumToFormValues, buildAlbumFormData } from "../../AlbumForm";

export default function EditGalleryAlbumPage() {
    const { user } = useAuth();
    const [values, setValues] = useState(getEmptyAlbum());
    const [coverImageFile, setCoverImageFile] = useState(null);
    const [existingCoverImage, setExistingCoverImage] = useState("");
    const [categories, setCategories] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        async function loadData() {
            try {
                const [albumRes, categoriesRes, branchesRes] = await Promise.all([
                    fetch(`/api/gallery/albums/${params.id}`),
                    fetch("/api/gallery/categories"),
                    fetch("/api/branch"),
                ]);
                const albumJson = await albumRes.json();
                const categoriesJson = await categoriesRes.json();
                const branchesJson = await branchesRes.json();

                if (!albumRes.ok) throw new Error(albumJson.message || "Unable to load album.");
                if (!categoriesRes.ok) throw new Error(categoriesJson.message || "Unable to load categories.");
                if (!branchesRes.ok) throw new Error(branchesJson.message || "Unable to load branches.");

                setValues(albumToFormValues(albumJson.data));
                setExistingCoverImage(albumJson.data.cover_image || "");
                setCategories(categoriesJson.data || []);
                setBranches(branchesJson.data || []);
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
            const formData = buildAlbumFormData(values, coverImageFile, { created_by: user?.id });

            const res = await fetch(`/api/gallery/albums/${params.id}`, {
                method: "PUT",
                body: formData,
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to update album.");
            router.push(`/next_panel/gallery/albums/${params.id}`);
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
                                <Link href="/next_panel/gallery/albums" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Albums
                                </Link>
                                <h1 className="h4 mb-2">Edit Album</h1>
                                <p className="text-muted mb-0">Update album details and cover image.</p>
                            </div>
                            <button className="btn btn-primary" type="submit" form="albumEditForm" disabled={saving || loading}>
                                <Save size={16} className="me-2" /> {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading album details...</div>
                        ) : (
                            <AlbumForm
                                formId="albumEditForm"
                                values={values}
                                categories={categories}
                                branches={branches}
                                onChange={setValues}
                                onSubmit={handleSubmit}
                                onCoverImageFileChange={setCoverImageFile}
                                existingCoverImage={existingCoverImage}
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
