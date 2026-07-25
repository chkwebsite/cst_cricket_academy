"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Edit, Plus, Trash2, Video } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";

export default function GalleryVideosPage() {
    const { user } = useAuth();
    const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
    const hasPermission = (permission) => {
        if (Number(user?.role_id) === 1 || Number(user?.role_id) === 7) return true;
        return permissions.includes(permission);
    };

    const searchParams = useSearchParams();
    const router = useRouter();
    const albumIdFilter = searchParams.get("album_id") || "";

    const [videos, setVideos] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadVideos() {
            setLoading(true);
            try {
                const query = albumIdFilter ? `?album_id=${albumIdFilter}` : "";
                const [videosRes, albumsRes] = await Promise.all([
                    fetch(`/api/gallery/videos${query}`),
                    fetch("/api/gallery/albums"),
                ]);
                const videosJson = await videosRes.json();
                const albumsJson = await albumsRes.json();

                if (!videosRes.ok) throw new Error(videosJson.message || "Unable to load videos.");

                setVideos(videosJson.data || []);
                setAlbums(albumsJson.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadVideos();
    }, [albumIdFilter]);

    const handleAlbumFilterChange = (event) => {
        const value = event.target.value;
        router.push(value ? `/next_panel/gallery/videos?album_id=${value}` : "/next_panel/gallery/videos");
    };

    const handleDelete = async (video) => {
        if (!confirm(`Delete video "${video.video_title || video.video_url}"?`)) return;

        setDeletingId(video.id);
        setError(null);

        try {
            const res = await fetch(`/api/gallery/videos/${video.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete video.");
            setVideos((current) => current.filter((item) => item.id !== video.id));
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
                                    <Video size={24} />
                                    <h1 className="h4 mb-0">Gallery Videos</h1>
                                </div>
                                <p className="text-muted mb-0">Video links/uploads attached to gallery albums.</p>
                            </div>

                            {hasPermission("gallery.videos.create") && (
                                <Link
                                    href={albumIdFilter ? `/next_panel/gallery/videos/new?album_id=${albumIdFilter}` : "/next_panel/gallery/videos/new"}
                                    className="btn btn-primary fw-semibold"
                                >
                                    <Plus size={16} className="me-2" /> New Video
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
                            <div className="text-center py-5 text-muted">Loading videos...</div>
                        ) : videos.length === 0 ? (
                            <div className="text-center py-5 text-muted">No videos found.</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th scope="col">Title</th>
                                            <th scope="col">Album</th>
                                            <th scope="col">Type</th>
                                            <th scope="col">Duration</th>
                                            <th scope="col">Order</th>
                                            <th scope="col">Status</th>
                                            <th scope="col" className="text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {videos.map((video) => (
                                            <tr key={video.id}>
                                                <td>
                                                    <a href={video.video_url} target="_blank" rel="noreferrer" className="fw-semibold">
                                                        {video.video_title || "Untitled video"}
                                                    </a>
                                                    <div>
                                                        <small className="text-muted">{video.uploaded_by_name || "—"}</small>
                                                    </div>
                                                </td>
                                                <td>{video.album_title || "—"}</td>
                                                <td>{video.video_type}</td>
                                                <td className="text-muted">{video.duration || "—"}</td>
                                                <td>{video.sort_order ?? 0}</td>
                                                <td>
                                                    <span className={`badge ${video.status === 1 ? "bg-success" : "bg-secondary"}`}>
                                                        {video.status === 1 ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td className="text-end">
                                                    <div className="btn-group btn-group-sm" role="group">
                                                        {hasPermission("gallery.videos.edit") && (
                                                            <Link
                                                                href={`/next_panel/gallery/videos/${video.id}/edit`}
                                                                className="btn btn-outline-secondary"
                                                                aria-label="Edit video"
                                                            >
                                                                <Edit size={16} />
                                                            </Link>
                                                        )}
                                                        {hasPermission("gallery.videos.delete") && (
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-danger"
                                                                onClick={() => handleDelete(video)}
                                                                disabled={deletingId === video.id}
                                                                aria-label="Delete video"
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
