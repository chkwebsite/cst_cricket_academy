"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";
import CategoryForm, { getEmptyCategory, normalizeCategoryPayload } from "../CategoryForm";

export default function NewGalleryCategoryPage() {
    const { user } = useAuth();
    const [values, setValues] = useState(getEmptyCategory());
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const res = await fetch("/api/gallery/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(normalizeCategoryPayload(values, user?.id)),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to create category.");
            router.push("/next_panel/gallery/categories");
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
                                <h1 className="h4 mb-2">Create Category</h1>
                                <p className="text-muted mb-0">Add a new gallery category.</p>
                            </div>
                            <button className="btn btn-primary" type="submit" form="categoryForm" disabled={saving}>
                                <Plus size={16} className="me-2" /> {saving ? "Saving..." : "Save Category"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        <CategoryForm
                            formId="categoryForm"
                            values={values}
                            onChange={setValues}
                            onSubmit={handleSubmit}
                            error={error}
                            loading={saving}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
