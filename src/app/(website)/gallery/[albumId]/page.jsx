"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Play } from "lucide-react";
import Lightbox from "../Lightbox";
import VideoModal from "../VideoModal";

export default function PublicAlbumDetailPage() {
    const params = useParams();

    const [album, setAlbum] = useState(null);
    const [images, setImages] = useState([]);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [activeImageIndex, setActiveImageIndex] = useState(null);
    const [activeVideo, setActiveVideo] = useState(null);

    useEffect(() => {
        async function loadAlbum() {
            try {
                const [albumRes, imagesRes, videosRes] = await Promise.all([
                    fetch(`/api/gallery/albums/${params.albumId}`),
                    fetch(`/api/gallery/images?album_id=${params.albumId}`),
                    fetch(`/api/gallery/videos?album_id=${params.albumId}`),
                ]);
                const albumJson = await albumRes.json();
                const imagesJson = await imagesRes.json();
                const videosJson = await videosRes.json();

                if (!albumRes.ok) throw new Error(albumJson.message || "Unable to load album.");

                setAlbum(albumJson.data);
                setImages((imagesJson.data || []).filter((img) => img.status === 1));
                setVideos((videosJson.data || []).filter((vid) => vid.status === 1));
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadAlbum();
    }, [params.albumId]);

    return (
        <div className="container py-5">
            <Link href="/gallery" className="btn btn-sm btn-outline-secondary mb-4">
                <ArrowLeft size={16} className="me-2" /> Back to Gallery
            </Link>

            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
                <div className="text-center py-5 text-muted">Loading album...</div>
            ) : !album ? (
                <div className="text-center py-5 text-muted">Album not found.</div>
            ) : (
                <>
                    <div className="mb-5">
                        {album.cover_image && (
                            <div
                                className="rounded-4 overflow-hidden mb-4"
                                style={{ maxHeight: 380 }}
                            >
                                <img
                                    src={album.cover_image}
                                    alt={album.album_title}
                                    className="w-100"
                                    style={{ objectFit: "cover", maxHeight: 380 }}
                                />
                            </div>
                        )}
                        <h1 className="fw-bold mb-2">{album.album_title}</h1>
                        <div className="d-flex flex-wrap gap-3 text-muted mb-3">
                            {album.category_name && <span>{album.category_name}</span>}
                            {album.event_date && (
                                <span>
                                    <Calendar size={14} className="me-1" />
                                    {String(album.event_date).slice(0, 10)}
                                </span>
                            )}
                            {album.location && (
                                <span>
                                    <MapPin size={14} className="me-1" />
                                    {album.location}
                                </span>
                            )}
                        </div>
                        {album.description && <p className="text-muted mb-0">{album.description}</p>}
                    </div>

                    {images.length > 0 && (
                        <div className="mb-5">
                            <h2 className="h5 mb-3">Photos</h2>
                            <div className="row g-3">
                                {images.map((image, index) => (
                                    <div className="col-6 col-md-4 col-lg-3" key={image.id}>
                                        <button
                                            type="button"
                                            className="btn p-0 border-0 w-100 gallery-thumb"
                                            onClick={() => setActiveImageIndex(index)}
                                        >
                                            <div
                                                className="rounded-3 overflow-hidden"
                                                style={{ aspectRatio: "1 / 1" }}
                                            >
                                                <img
                                                    src={image.image_path}
                                                    alt={image.image_caption || "Gallery image"}
                                                    className="w-100 h-100"
                                                    style={{ objectFit: "cover" }}
                                                />
                                            </div>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {videos.length > 0 && (
                        <div className="mb-5">
                            <h2 className="h5 mb-3">Videos</h2>
                            <div className="row g-3">
                                {videos.map((video) => (
                                    <div className="col-6 col-md-4 col-lg-3" key={video.id}>
                                        <button
                                            type="button"
                                            className="btn p-0 border-0 w-100 gallery-thumb"
                                            onClick={() => setActiveVideo(video)}
                                        >
                                            <div
                                                className="rounded-3 overflow-hidden position-relative bg-dark d-flex align-items-center justify-content-center"
                                                style={{ aspectRatio: "16 / 9" }}
                                            >
                                                <span className="gallery-play-badge">
                                                    <Play size={22} fill="white" />
                                                </span>
                                            </div>
                                            <div className="small text-muted mt-1 text-truncate">
                                                {video.video_title || "Untitled video"}
                                            </div>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {images.length === 0 && videos.length === 0 && (
                        <div className="text-center py-5 text-muted">No photos or videos in this album yet.</div>
                    )}
                </>
            )}

            <Lightbox
                images={images}
                activeIndex={activeImageIndex}
                onClose={() => setActiveImageIndex(null)}
                onChangeIndex={setActiveImageIndex}
            />

            <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />

            <style jsx>{`
                .gallery-thumb {
                    transition: transform 0.15s ease, opacity 0.15s ease;
                }
                .gallery-thumb:hover {
                    transform: scale(1.02);
                    opacity: 0.92;
                }
                .gallery-play-badge {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            `}</style>
        </div>
    );
}
