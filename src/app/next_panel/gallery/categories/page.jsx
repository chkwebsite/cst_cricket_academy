"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Edit, FolderKanban, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";

export default function GalleryCategoriesPage() {
    const { user } = useAuth();
    const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
    const hasPermission = (permission) => {
        if (Number(user?.role_id) === 1 || Number(user?.role_id) === 7) return true;
        return permissions.includes(permission);
    };

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadCategories() {
            try {
                const res = await fetch("/api/gallery/categories");
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || "Unable to load categories.");
                setCategories(json.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadCategories();
    }, []);

    const handleDelete = async (category) => {
        if (!confirm(`Delete category "${category.category_name}"?`)) return;

        setDeletingId(category.id);
        setError(null);

        try {
            const res = await fetch(`/api/gallery/categories/${category.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete category.");
            setCategories((current) => current.filter((item) => item.id !== category.id));
        } catch (err) {
            setError(err.message);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="container-fluid">
            <div className="row g-4">
                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                            <div>
                                <Link href="/next_panel/gallery" className="btn btn-sm btn-outline-secondary mb-3">
                                    ← Back to Gallery
                                </Link>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <FolderKanban size={24} />
                                    <h1 className="h4 mb-0">Gallery Categories</h1>
                                </div>
                                <p className="text-muted mb-0">Top-level groupings for gallery albums.</p>
                            </div>

                            {hasPermission("gallery.categories.create") && (
                                <Link href="/next_panel/gallery/categories/new" className="btn btn-primary fw-semibold">
                                    <Plus size={16} className="me-2" /> New Category
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-3">
                        {error && <div className="alert alert-danger">{error}</div>}

                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading categories...</div>
                        ) : categories.length === 0 ? (
                            <div className="text-center py-5 text-muted">No categories found yet.</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th scope="col">Category</th>
                                            <th scope="col">Slug</th>
                                            <th scope="col">Created By</th>
                                            <th scope="col">Order</th>
                                            <th scope="col">Status</th>
                                            <th scope="col" className="text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categories.map((category) => (
                                            <tr key={category.id}>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        {category.featured_image && (
                                                            <img
                                                                src={category.featured_image}
                                                                alt={category.category_name}
                                                                className="rounded-3"
                                                                style={{ width: 40, height: 40, objectFit: "cover" }}
                                                            />
                                                        )}
                                                        <div>
                                                            <div className="fw-semibold">{category.category_name}</div>
                                                            <small className="text-muted">
                                                                {category.description ? category.description.slice(0, 60) : "No description"}
                                                            </small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-muted">{category.slug || "—"}</td>
                                                <td>{category.created_by_name || "—"}</td>
                                                <td>{category.sort_order ?? 0}</td>
                                                <td>
                                                    <span className={`badge ${category.status === 1 ? "bg-success" : "bg-secondary"}`}>
                                                        {category.status === 1 ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td className="text-end">
                                                    <div className="btn-group btn-group-sm" role="group">
                                                        <Link
                                                            href={`/next_panel/gallery/categories/${category.id}`}
                                                            className="btn btn-outline-primary"
                                                            aria-label="View category"
                                                        >
                                                            <ArrowUpRight size={16} />
                                                        </Link>

                                                        {hasPermission("gallery.categories.edit") && (
                                                            <Link
                                                                href={`/next_panel/gallery/categories/${category.id}/edit`}
                                                                className="btn btn-outline-secondary"
                                                                aria-label="Edit category"
                                                            >
                                                                <Edit size={16} />
                                                            </Link>
                                                        )}

                                                        {hasPermission("gallery.categories.delete") && (
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-danger"
                                                                onClick={() => handleDelete(category)}
                                                                disabled={deletingId === category.id}
                                                                aria-label="Delete category"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
