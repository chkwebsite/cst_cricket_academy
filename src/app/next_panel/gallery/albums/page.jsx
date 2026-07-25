"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Edit, Images, Plus, Star, Trash2 } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";

export default function GalleryAlbumsPage() {
    const { user } = useAuth();
    const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
    const hasPermission = (permission) => {
        if (Number(user?.role_id) === 1 || Number(user?.role_id) === 7) return true;
        return permissions.includes(permission);
    };

    const [albums, setAlbums] = useState([]);
    const [categories, setCategories] = useState([]);
    const [categoryFilter, setCategoryFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadAlbums() {
            try {
                const [albumsRes, categoriesRes] = await Promise.all([
                    fetch("/api/gallery/albums"),
                    fetch("/api/gallery/categories"),
                ]);
                const albumsJson = await albumsRes.json();
                const categoriesJson = await categoriesRes.json();

                if (!albumsRes.ok) throw new Error(albumsJson.message || "Unable to load albums.");

                setAlbums(albumsJson.data || []);
                setCategories(categoriesJson.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadAlbums();
    }, []);

    const filteredAlbums = useMemo(() => {
        if (!categoryFilter) return albums;
        return albums.filter((album) => String(album.category_id) === String(categoryFilter));
    }, [albums, categoryFilter]);

    const handleDelete = async (album) => {
        if (!confirm(`Delete album "${album.album_title}"? This will also remove its images/videos references.`)) return;

        setDeletingId(album.id);
        setError(null);

        try {
            const res = await fetch(`/api/gallery/albums/${album.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete album.");
            setAlbums((current) => current.filter((item) => item.id !== album.id));
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
                                    <Images size={24} />
                                    <h1 className="h4 mb-0">Gallery Albums</h1>
                                </div>
                                <p className="text-muted mb-0">Collections of photos/videos, grouped by category.</p>
                            </div>

                            {hasPermission("gallery.albums.create") && (
                                <Link href="/next_panel/gallery/albums/new" className="btn btn-primary fw-semibold">
                                    <Plus size={16} className="me-2" /> New Album
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-3">
                        {error && <div className="alert alert-danger">{error}</div>}

                        <div className="d-flex justify-content-end mb-3">
                            <select
                                className="form-select form-select-sm"
                                style={{ maxWidth: 240 }}
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                            >
                                <option value="">All categories</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>{category.category_name}</option>
                                ))}
                            </select>
                        </div>

                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading albums...</div>
                        ) : filteredAlbums.length === 0 ? (
                            <div className="text-center py-5 text-muted">No albums found.</div>
                        ) : (
                            <div className="row g-3">
                                {filteredAlbums.map((album) => (
                                    <div className="col-md-4 col-lg-3" key={album.id}>
                                        <div className="card h-100 border">
                                            <div className="position-relative">
                                                {album.cover_image ? (
                                                    <img
                                                        src={album.cover_image}
                                                        alt={album.album_title}
                                                        className="card-img-top"
                                                        style={{ height: 140, objectFit: "cover" }}
                                                    />
                                                ) : (
                                                    <div
                                                        className="d-flex align-items-center justify-content-center bg-light"
                                                        style={{ height: 140 }}
                                                    >
                                                        <Images size={28} className="text-muted" />
                                                    </div>
                                                )}
                                                {Number(album.is_featured) === 1 && (
                                                    <span className="badge bg-warning text-dark position-absolute top-0 end-0 m-2">
                                                        <Star size={12} className="me-1" /> Featured
                                                    </span>
                                                )}
                                            </div>
                                            <div className="card-body p-3 d-flex flex-column">
                                                <div className="fw-semibold small mb-1">{album.album_title}</div>
                                                <div className="text-muted small mb-2">
                                                    {album.category_name || "Uncategorized"}
                                                    {album.branch_name ? ` · ${album.branch_name}` : ""}
                                                </div>
                                                <span className={`badge align-self-start mb-2 ${album.status === 1 ? "bg-success" : "bg-secondary"}`}>
                                                    {album.status === 1 ? "Active" : "Inactive"}
                                                </span>

                                                <div className="btn-group btn-group-sm mt-auto" role="group">
                                                    <Link
                                                        href={`/next_panel/gallery/albums/${album.id}`}
                                                        className="btn btn-outline-primary"
                                                        aria-label="View album"
                                                    >
                                                        <ArrowUpRight size={14} />
                                                    </Link>
                                                    {hasPermission("gallery.albums.edit") && (
                                                        <Link
                                                            href={`/next_panel/gallery/albums/${album.id}/edit`}
                                                            className="btn btn-outline-secondary"
                                                            aria-label="Edit album"
                                                        >
                                                            <Edit size={14} />
                                                        </Link>
                                                    )}
                                                    {hasPermission("gallery.albums.delete") && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-danger"
                                                            onClick={() => handleDelete(album)}
                                                            disabled={deletingId === album.id}
                                                            aria-label="Delete album"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
