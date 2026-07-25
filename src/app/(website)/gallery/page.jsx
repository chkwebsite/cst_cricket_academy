"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Calendar, Images, MapPin, Star } from "lucide-react";

export default function PublicGalleryPage() {
    const [categories, setCategories] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [activeCategory, setActiveCategory] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadGallery() {
            try {
                const [categoriesRes, albumsRes] = await Promise.all([
                    fetch("/api/gallery/categories"),
                    fetch("/api/gallery/albums"),
                ]);
                const categoriesJson = await categoriesRes.json();
                const albumsJson = await albumsRes.json();

                if (!categoriesRes.ok) throw new Error(categoriesJson.message || "Unable to load gallery.");
                if (!albumsRes.ok) throw new Error(albumsJson.message || "Unable to load gallery.");

                // Public page: only show active categories/albums
                setCategories((categoriesJson.data || []).filter((c) => c.status === 1));
                setAlbums((albumsJson.data || []).filter((a) => a.status === 1));
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadGallery();
    }, []);

    const filteredAlbums = useMemo(() => {
        if (activeCategory === "all") return albums;
        return albums.filter((album) => String(album.category_id) === String(activeCategory));
    }, [albums, activeCategory]);

    return (
        <div className="container py-5">
            <div className="text-center mb-5">
                <h1 className="fw-bold mb-2">Gallery</h1>
                <p className="text-muted">Moments from our matches, camps, and events.</p>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
                <div className="text-center py-5 text-muted">Loading gallery...</div>
            ) : (
                <>
                    <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
                        <button
                            type="button"
                            className={`btn btn-sm rounded-pill ${activeCategory === "all" ? "btn-primary" : "btn-outline-secondary"}`}
                            onClick={() => setActiveCategory("all")}
                        >
                            All
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                type="button"
                                className={`btn btn-sm rounded-pill ${String(activeCategory) === String(category.id) ? "btn-primary" : "btn-outline-secondary"}`}
                                onClick={() => setActiveCategory(category.id)}
                            >
                                {category.category_name}
                            </button>
                        ))}
                    </div>

                    {filteredAlbums.length === 0 ? (
                        <div className="text-center py-5 text-muted">No albums to show yet.</div>
                    ) : (
                        <div className="row g-4">
                            {filteredAlbums.map((album) => (
                                <div className="col-6 col-md-4 col-lg-3" key={album.id}>
                                    <Link
                                        href={`/gallery/${album.id}`}
                                        className="card h-100 border-0 shadow-sm text-decoration-none gallery-album-card"
                                    >
                                        <div className="position-relative overflow-hidden" style={{ aspectRatio: "4 / 3" }}>
                                            {album.cover_image ? (
                                                <img
                                                    src={album.cover_image}
                                                    alt={album.album_title}
                                                    className="w-100 h-100"
                                                    style={{ objectFit: "cover" }}
                                                />
                                            ) : (
                                                <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-light">
                                                    <Images size={32} className="text-muted" />
                                                </div>
                                            )}
                                            {Number(album.is_featured) === 1 && (
                                                <span className="badge bg-warning text-dark position-absolute top-0 end-0 m-2">
                                                    <Star size={12} className="me-1" /> Featured
                                                </span>
                                            )}
                                        </div>
                                        <div className="card-body p-3">
                                            <div className="fw-semibold text-dark mb-1">{album.album_title}</div>
                                            <div className="text-muted small mb-1">{album.category_name}</div>
                                            <div className="d-flex flex-wrap gap-2 text-muted" style={{ fontSize: "0.8rem" }}>
                                                {album.event_date && (
                                                    <span>
                                                        <Calendar size={12} className="me-1" />
                                                        {String(album.event_date).slice(0, 10)}
                                                    </span>
                                                )}
                                                {album.location && (
                                                    <span>
                                                        <MapPin size={12} className="me-1" />
                                                        {album.location}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            <style jsx>{`
                .gallery-album-card {
                    transition: transform 0.15s ease, box-shadow 0.15s ease;
                }
                .gallery-album-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12) !important;
                }
            `}</style>
        </div>
    );
}
