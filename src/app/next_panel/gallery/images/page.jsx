"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Edit, Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";

export default function GalleryImagesPage() {
    const { user } = useAuth();
    const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
    const hasPermission = (permission) => {
        if (Number(user?.role_id) === 1 || Number(user?.role_id) === 7) return true;
        return permissions.includes(permission);
    };

    const searchParams = useSearchParams();
    const router = useRouter();
    const albumIdFilter = searchParams.get("album_id") || "";

    const [images, setImages] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadImages() {
            setLoading(true);
            try {
                const query = albumIdFilter ? `?album_id=${albumIdFilter}` : "";
                const [imagesRes, albumsRes] = await Promise.all([
                    fetch(`/api/gallery/images${query}`),
                    fetch("/api/gallery/albums"),
                ]);
                const imagesJson = await imagesRes.json();
                const albumsJson = await albumsRes.json();

                if (!imagesRes.ok) throw new Error(imagesJson.message || "Unable to load images.");

                setImages(imagesJson.data || []);
                setAlbums(albumsJson.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadImages();
    }, [albumIdFilter]);

    const handleAlbumFilterChange = (event) => {
        const value = event.target.value;
        router.push(value ? `/next_panel/gallery/images?album_id=${value}` : "/next_panel/gallery/images");
    };

    const handleDelete = async (image) => {
        if (!confirm("Delete this image?")) return;

        setDeletingId(image.id);
        setError(null);

        try {
            const res = await fetch(`/api/gallery/images/${image.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete image.");
            setImages((current) => current.filter((item) => item.id !== image.id));
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
                                    <ImageIcon size={24} />
                                    <h1 className="h4 mb-0">Gallery Images</h1>
                                </div>
                                <p className="text-muted mb-0">Photos uploaded across gallery albums.</p>
                            </div>

                            {hasPermission("gallery.images.create") && (
                                <Link
                                    href={albumIdFilter ? `/next_panel/gallery/images/new?album_id=${albumIdFilter}` : "/next_panel/gallery/images/new"}
                                    className="btn btn-primary fw-semibold"
                                >
                                    <Plus size={16} className="me-2" /> Upload Images
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
                                style={{ maxWidth: 260 }}
                                value={albumIdFilter}
                                onChange={handleAlbumFilterChange}
                            >
                                <option value="">All albums</option>
                                {albums.map((album) => (
                                    <option key={album.id} value={album.id}>{album.album_title}</option>
                                ))}
                            </select>
                        </div>

                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading images...</div>
                        ) : images.length === 0 ? (
                            <div className="text-center py-5 text-muted">No images found.</div>
                        ) : (
                            <div className="row g-3">
                                {images.map((image) => (
                                    <div className="col-6 col-md-3 col-lg-2" key={image.id}>
                                        <div className="card h-100 border">
                                            <img
                                                src={image.image_path}
                                                alt={image.image_caption || "Gallery image"}
                                                className="card-img-top"
                                                style={{ height: 110, objectFit: "cover" }}
                                            />
                                            <div className="card-body p-2">
                                                <div className="small text-truncate">{image.image_caption || "—"}</div>
                                                <div className="text-muted" style={{ fontSize: 11 }}>
                                                    {image.album_title || "No album"}
                                                </div>
                                                <span className={`badge mt-1 ${image.status === 1 ? "bg-success" : "bg-secondary"}`}>
                                                    {image.status === 1 ? "Active" : "Inactive"}
                                                </span>
                                                <div className="btn-group btn-group-sm w-100 mt-2" role="group">
                                                    {hasPermission("gallery.images.edit") && (
                                                        <Link
                                                            href={`/next_panel/gallery/images/${image.id}/edit`}
                                                            className="btn btn-outline-secondary"
                                                        >
                                                            <Edit size={12} />
                                                        </Link>
                                                    )}
                                                    {hasPermission("gallery.images.delete") && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-danger"
                                                            onClick={() => handleDelete(image)}
                                                            disabled={deletingId === image.id}
                                                        >
                                                            <Trash2 size={12} />
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
