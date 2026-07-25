"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Image as ImageIcon, Images, MapPin, Plus, Trash2, Video } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";

export default function GalleryAlbumDetailPage() {
    const { user } = useAuth();
    const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
    const hasPermission = (permission) => {
        if (Number(user?.role_id) === 1 || Number(user?.role_id) === 7) return true;
        return permissions.includes(permission);
    };

    const [album, setAlbum] = useState(null);
    const [images, setImages] = useState([]);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        async function loadAlbum() {
            try {
                const [albumRes, imagesRes, videosRes] = await Promise.all([
                    fetch(`/api/gallery/albums/${params.id}`),
                    fetch(`/api/gallery/images?album_id=${params.id}`),
                    fetch(`/api/gallery/videos?album_id=${params.id}`),
                ]);
                const albumJson = await albumRes.json();
                const imagesJson = await imagesRes.json();
                const videosJson = await videosRes.json();

                if (!albumRes.ok) throw new Error(albumJson.message || "Unable to load album.");

                setAlbum(albumJson.data);
                setImages(imagesJson.data || []);
                setVideos(videosJson.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadAlbum();
    }, [params.id]);

    const handleDeleteAlbum = async () => {
        if (!confirm("Delete this album? Images/videos linked to it may become orphaned.")) return;

        setDeleting(true);
        setError(null);

        try {
            const res = await fetch(`/api/gallery/albums/${params.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete album.");
            router.push("/next_panel/gallery/albums");
        } catch (err) {
            setError(err.message);
        } finally {
            setDeleting(false);
        }
    };

    const handleDeleteImage = async (image) => {
        if (!confirm("Delete this image?")) return;
        try {
            const res = await fetch(`/api/gallery/images/${image.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete image.");
            setImages((current) => current.filter((item) => item.id !== image.id));
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteVideo = async (video) => {
        if (!confirm("Delete this video?")) return;
        try {
            const res = await fetch(`/api/gallery/videos/${video.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete video.");
            setVideos((current) => current.filter((item) => item.id !== video.id));
        } catch (err) {
            setError(err.message);
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
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    {album?.cover_image ? (
                                        <img
                                            src={album.cover_image}
                                            alt={album.album_title}
                                            className="rounded-3"
                                            style={{ width: 44, height: 44, objectFit: "cover" }}
                                        />
                                    ) : (
                                        <Images size={24} />
                                    )}
                                    <h1 className="h4 mb-0">{album?.album_title || "Album Details"}</h1>
                                </div>
                                <p className="text-muted mb-0">
                                    {album?.location && (
                                        <span className="me-2"><MapPin size={14} className="me-1" />{album.location}</span>
                                    )}
                                    {album?.event_date && <span>{String(album.event_date).slice(0, 10)}</span>}
                                </p>
                            </div>
                            <div className="d-flex gap-2">
                                {hasPermission("gallery.albums.edit") && (
                                    <Link href={`/next_panel/gallery/albums/${params.id}/edit`} className="btn btn-primary">
                                        <Edit size={16} className="me-2" /> Edit
                                    </Link>
                                )}
                                {hasPermission("gallery.albums.delete") && (
                                    <button className="btn btn-outline-danger" onClick={handleDeleteAlbum} disabled={deleting}>
                                        <Trash2 size={16} className="me-2" /> {deleting ? "Deleting..." : "Delete"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="col-12">
                        <div className="alert alert-danger">{error}</div>
                    </div>
                )}

                {loading ? (
                    <div className="col-12">
                        <div className="bg-white rounded-4 shadow-sm p-4 text-center py-5 text-muted">
                            Loading album details...
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="col-12">
                            <div className="bg-white rounded-4 shadow-sm p-4">
                                <div className="row gy-3">
                                    <div className="col-md-4">
                                        <h2 className="h6 mb-1">Category</h2>
                                        <p className="mb-0 text-muted">{album.category_name || "Not provided"}</p>
                                    </div>
                                    <div className="col-md-4">
                                        <h2 className="h6 mb-1">Branch</h2>
                                        <p className="mb-0 text-muted">{album.branch_name || "All branches"}</p>
                                    </div>
                                    <div className="col-md-4">
                                        <h2 className="h6 mb-1">Status</h2>
                                        <span className={`badge ${album.status === 1 ? "bg-success" : "bg-secondary"}`}>
                                            {album.status === 1 ? "Active" : "Inactive"}
                                        </span>
                                    </div>
                                    <div className="col-12">
                                        <h2 className="h6 mb-1">Description</h2>
                                        <p className="mb-0 text-muted">{album.description || "Not provided"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-12">
                            <div className="bg-white rounded-4 shadow-sm p-4">
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <h2 className="h6 mb-0 d-flex align-items-center gap-2">
                                        <ImageIcon size={16} /> Images ({images.length})
                                    </h2>
                                    {hasPermission("gallery.images.create") && (
                                        <Link
                                            href={`/next_panel/gallery/images/new?album_id=${params.id}`}
                                            className="btn btn-sm btn-primary"
                                        >
                                            <Plus size={14} className="me-1" /> Upload Images
                                        </Link>
                                    )}
                                </div>

                                {images.length === 0 ? (
                                    <div className="text-muted small">No images uploaded to this album yet.</div>
                                ) : (
                                    <div className="row g-3">
                                        {images.map((image) => (
                                            <div className="col-6 col-md-3 col-lg-2" key={image.id}>
                                                <div className="card h-100 border">
                                                    <img
                                                        src={image.image_path}
                                                        alt={image.image_caption || "Gallery image"}
                                                        className="card-img-top"
                                                        style={{ height: 100, objectFit: "cover" }}
                                                    />
                                                    <div className="card-body p-2">
                                                        <div className="small text-truncate">{image.image_caption || "—"}</div>
                                                        <div className="btn-group btn-group-sm w-100 mt-1" role="group">
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
                                                                    onClick={() => handleDeleteImage(image)}
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

                        <div className="col-12">
                            <div className="bg-white rounded-4 shadow-sm p-4">
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <h2 className="h6 mb-0 d-flex align-items-center gap-2">
                                        <Video size={16} /> Videos ({videos.length})
                                    </h2>
                                    {hasPermission("gallery.videos.create") && (
                                        <Link
                                            href={`/next_panel/gallery/videos/new?album_id=${params.id}`}
                                            className="btn btn-sm btn-primary"
                                        >
                                            <Plus size={14} className="me-1" /> Add Video
                                        </Link>
                                    )}
                                </div>

                                {videos.length === 0 ? (
                                    <div className="text-muted small">No videos added to this album yet.</div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table align-middle mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Title</th>
                                                    <th>Type</th>
                                                    <th>Duration</th>
                                                    <th>Status</th>
                                                    <th className="text-end">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {videos.map((video) => (
                                                    <tr key={video.id}>
                                                        <td>
                                                            <a href={video.video_url} target="_blank" rel="noreferrer">
                                                                {video.video_title || video.video_url}
                                                            </a>
                                                        </td>
                                                        <td>{video.video_type}</td>
                                                        <td>{video.duration || "—"}</td>
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
                                                                    >
                                                                        <Edit size={14} />
                                                                    </Link>
                                                                )}
                                                                {hasPermission("gallery.videos.delete") && (
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-outline-danger"
                                                                        onClick={() => handleDeleteVideo(video)}
                                                                    >
                                                                        <Trash2 size={14} />
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
                    </>
                )}
            </div>
        </div>
    );
}

