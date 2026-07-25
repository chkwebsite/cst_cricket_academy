"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, FolderKanban, Images, Trash2 } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";

export default function GalleryCategoryDetailPage() {
    const { user } = useAuth();
    const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
    const hasPermission = (permission) => {
        if (Number(user?.role_id) === 1 || Number(user?.role_id) === 7) return true;
        return permissions.includes(permission);
    };

    const [category, setCategory] = useState(null);
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        async function loadCategory() {
            try {
                const [catRes, albumsRes] = await Promise.all([
                    fetch(`/api/gallery/categories/${params.id}`),
                    fetch("/api/gallery/albums"),
                ]);
                const catJson = await catRes.json();
                const albumsJson = await albumsRes.json();

                if (!catRes.ok) throw new Error(catJson.message || "Unable to load category.");

                setCategory(catJson.data);
                setAlbums((albumsJson.data || []).filter((a) => String(a.category_id) === String(params.id)));
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadCategory();
    }, [params.id]);

    const handleDelete = async () => {
        if (!confirm("Delete this category?")) return;

        setDeleting(true);
        setError(null);

        try {
            const res = await fetch(`/api/gallery/categories/${params.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete category.");
            router.push("/next_panel/gallery/categories");
        } catch (err) {
            setError(err.message);
        } finally {
            setDeleting(false);
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
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    {category?.featured_image ? (
                                        <img
                                            src={category.featured_image}
                                            alt={category.category_name}
                                            className="rounded-3"
                                            style={{ width: 44, height: 44, objectFit: "cover" }}
                                        />
                                    ) : (
                                        <FolderKanban size={24} />
                                    )}
                                    <h1 className="h4 mb-0">{category?.category_name || "Category Details"}</h1>
                                </div>
                                <p className="text-muted mb-0">View category details and its albums.</p>
                            </div>
                            <div className="d-flex gap-2">
                                {hasPermission("gallery.categories.edit") && (
                                    <Link href={`/next_panel/gallery/categories/${params.id}/edit`} className="btn btn-primary">
                                        <Edit size={16} className="me-2" /> Edit
                                    </Link>
                                )}
                                {hasPermission("gallery.categories.delete") && (
                                    <button className="btn btn-outline-danger" onClick={handleDelete} disabled={deleting}>
                                        <Trash2 size={16} className="me-2" /> {deleting ? "Deleting..." : "Delete"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading category details...</div>
                        ) : error ? (
                            <div className="alert alert-danger">{error}</div>
                        ) : (
                            <div className="row gy-4">
                                <div className="col-12">
                                    <div className="d-flex flex-wrap align-items-center gap-2">
                                        <span className={`badge ${category.status === 1 ? "bg-success" : "bg-secondary"}`}>
                                            {category.status === 1 ? "Active" : "Inactive"}
                                        </span>
                                        <span className="text-muted small">ID: {category.id}</span>
                                        <span className="text-muted small">Slug: {category.slug || "—"}</span>
                                        <span className="text-muted small">Order: {category.sort_order ?? 0}</span>
                                        <span className="text-muted small">Created by: {category.created_by_name || "—"}</span>
                                    </div>
                                </div>

                                <div className="col-12">
                                    <h2 className="h6 mb-1">Description</h2>
                                    <p className="mb-0 text-muted">{category.description || "Not provided"}</p>
                                </div>

                                <div className="col-12">
                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        <h2 className="h6 mb-0 d-flex align-items-center gap-2">
                                            <Images size={16} /> Albums in this category ({albums.length})
                                        </h2>
                                        {hasPermission("gallery.albums.create") && (
                                            <Link
                                                href={`/next_panel/gallery/albums/new?category_id=${params.id}`}
                                                className="btn btn-sm btn-outline-primary"
                                            >
                                                + Add Album
                                            </Link>
                                        )}
                                    </div>

                                    {albums.length === 0 ? (
                                        <div className="text-muted small">No albums yet in this category.</div>
                                    ) : (
                                        <div className="row g-3">
                                            {albums.map((album) => (
                                                <div className="col-md-4 col-lg-3" key={album.id}>
                                                    <Link
                                                        href={`/next_panel/gallery/albums/${album.id}`}
                                                        className="card h-100 text-decoration-none border"
                                                    >
                                                        {album.cover_image && (
                                                            <img
                                                                src={album.cover_image}
                                                                alt={album.album_title}
                                                                className="card-img-top"
                                                                style={{ height: 120, objectFit: "cover" }}
                                                            />
                                                        )}
                                                        <div className="card-body p-2">
                                                            <div className="fw-semibold small text-dark">{album.album_title}</div>
                                                        </div>
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
