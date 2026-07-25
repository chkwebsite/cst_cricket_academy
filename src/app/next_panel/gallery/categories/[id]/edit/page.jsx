"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";
import CategoryForm, { getEmptyCategory, normalizeCategoryPayload, categoryToFormValues } from "../../CategoryForm";

export default function EditGalleryCategoryPage() {
    const { user } = useAuth();
    const [values, setValues] = useState(getEmptyCategory());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        async function loadCategory() {
            try {
                const res = await fetch(`/api/gallery/categories/${params.id}`);
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || "Unable to load category.");
                setValues(categoryToFormValues(json.data));
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadCategory();
    }, [params.id]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const res = await fetch(`/api/gallery/categories/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(normalizeCategoryPayload(values, user?.id)),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to update category.");
            router.push(`/next_panel/gallery/categories/${params.id}`);
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
                                <Link href="/next_panel/gallery/categories" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Categories
                                </Link>
                                <h1 className="h4 mb-2">Edit Category</h1>
                                <p className="text-muted mb-0">Update category details.</p>
                            </div>
                            <button className="btn btn-primary" type="submit" form="categoryEditForm" disabled={saving || loading}>
                                <Save size={16} className="me-2" /> {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading category details...</div>
                        ) : (
                            <CategoryForm
                                formId="categoryEditForm"
                                values={values}
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
