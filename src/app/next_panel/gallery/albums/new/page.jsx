"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";
import AlbumForm, { getEmptyAlbum, buildAlbumFormData } from "../AlbumForm";

export default function NewGalleryAlbumPage() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const [values, setValues] = useState(getEmptyAlbum());
    const [coverImageFile, setCoverImageFile] = useState(null);
    const [categories, setCategories] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        async function loadFormData() {
            try {
                const [categoriesRes, branchesRes] = await Promise.all([
                    fetch("/api/gallery/categories"),
                    fetch("/api/branch"),
                ]);
                const categoriesJson = await categoriesRes.json();
                const branchesJson = await branchesRes.json();

                if (!categoriesRes.ok) throw new Error(categoriesJson.message || "Unable to load categories.");
                if (!branchesRes.ok) throw new Error(branchesJson.message || "Unable to load branches.");

                setCategories(categoriesJson.data || []);
                setBranches(branchesJson.data || []);

                const presetCategoryId = searchParams.get("category_id");
                if (presetCategoryId) {
                    setValues((prev) => ({ ...prev, category_id: Number(presetCategoryId) }));
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadFormData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const formData = buildAlbumFormData(values, coverImageFile, { created_by: user?.id });

            const res = await fetch("/api/gallery/albums", {
                method: "POST",
                body: formData,
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to create album.");
            router.push("/next_panel/gallery/albums");
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
                                <h1 className="h4 mb-2">Create Album</h1>
                                <p className="text-muted mb-0">Add a new album under a gallery category.</p>
                            </div>
                            <button className="btn btn-primary" type="submit" form="albumForm" disabled={saving || loading}>
                                <Plus size={16} className="me-2" /> {saving ? "Saving..." : "Save Album"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading form data...</div>
                        ) : (
                            <AlbumForm
                                formId="albumForm"
                                values={values}
                                categories={categories}
                                branches={branches}
                                onChange={setValues}
                                onSubmit={handleSubmit}
                                onCoverImageFileChange={setCoverImageFile}
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
