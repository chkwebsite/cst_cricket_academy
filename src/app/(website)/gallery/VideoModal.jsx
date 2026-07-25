"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

// Converts a stored video_url + video_type into an embeddable URL (for iframe) or leaves it
// as a direct file URL (for <video>) when the type is "Upload".
export function getEmbeddableVideo(video) {
    const url = video.video_url || "";
    const type = (video.video_type || "").toLowerCase();

    if (type === "youtube" || /youtube\.com|youtu\.be/.test(url)) {
        const idMatch =
            url.match(/[?&]v=([^&]+)/) ||
            url.match(/youtu\.be\/([^?&]+)/) ||
            url.match(/embed\/([^?&]+)/);
        const videoId = idMatch ? idMatch[1] : null;
        return {
            kind: "iframe",
            src: videoId ? `https://www.youtube.com/embed/${videoId}` : url,
        };
    }

    if (type === "vimeo" || /vimeo\.com/.test(url)) {
        const idMatch = url.match(/vimeo\.com\/(\d+)/);
        const videoId = idMatch ? idMatch[1] : null;
        return {
            kind: "iframe",
            src: videoId ? `https://player.vimeo.com/video/${videoId}` : url,
        };
    }

    if (type === "embed") {
        return { kind: "iframe", src: url };
    }

    // "Upload" or anything else: treat as a direct video file served from /uploads/...
    return { kind: "video", src: url };
}

export default function VideoModal({ video, onClose }) {
    useEffect(() => {
        if (!video) return;

        function handleKeyDown(event) {
            if (event.key === "Escape") onClose();
        }

        document.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [video, onClose]);

    if (!video) return null;

    const embed = getEmbeddableVideo(video);

    return (
        <div
            className="gallery-video-backdrop"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label={video.video_title || "Video player"}
        >
            <button
                type="button"
                className="gallery-video-close"
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                aria-label="Close"
            >
                <X size={26} />
            </button>

            <div className="gallery-video-content" onClick={(e) => e.stopPropagation()}>
                {video.video_title && <div className="gallery-video-title">{video.video_title}</div>}

                <div className="gallery-video-frame">
                    {embed.kind === "iframe" ? (
                        <iframe
                            src={embed.src}
                            title={video.video_title || "Video"}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    ) : (
                        <video src={embed.src} controls autoPlay />
                    )}
                </div>
            </div>

            <style jsx>{`
                .gallery-video-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.92);
                    z-index: 1050;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                }
                .gallery-video-content {
                    width: 100%;
                    max-width: 900px;
                }
                .gallery-video-title {
                    color: #f1f1f1;
                    margin-bottom: 12px;
                    text-align: center;
                    font-size: 1rem;
                }
                .gallery-video-frame {
                    position: relative;
                    width: 100%;
                    padding-top: 56.25%;
                    background: #000;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                }
                .gallery-video-frame iframe,
                .gallery-video-frame video {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    border: none;
                }
                .gallery-video-close {
                    position: absolute;
                    top: 20px;
                    right: 24px;
                    background: transparent;
                    border: none;
                    color: #fff;
                    cursor: pointer;
                    z-index: 1060;
                }
            `}</style>
        </div>
    );
}
