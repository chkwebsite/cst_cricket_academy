"use client";

import { useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Fullscreen image lightbox.
 *
 * Props:
 * - images: array of { image_path, image_caption }
 * - activeIndex: number | null  (null/undefined => closed)
 * - onClose: () => void
 * - onChangeIndex: (nextIndex: number) => void
 */
export default function Lightbox({ images = [], activeIndex, onClose, onChangeIndex }) {
    const isOpen = activeIndex !== null && activeIndex !== undefined;
    const total = images.length;

    const goPrev = useCallback(() => {
        if (!total) return;
        onChangeIndex((activeIndex - 1 + total) % total);
    }, [activeIndex, total, onChangeIndex]);

    const goNext = useCallback(() => {
        if (!total) return;
        onChangeIndex((activeIndex + 1) % total);
    }, [activeIndex, total, onChangeIndex]);

    useEffect(() => {
        if (!isOpen) return;

        function handleKeyDown(event) {
            if (event.key === "Escape") onClose();
            if (event.key === "ArrowLeft") goPrev();
            if (event.key === "ArrowRight") goNext();
        }

        document.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [isOpen, goPrev, goNext, onClose]);

    if (!isOpen) return null;

    const current = images[activeIndex];

    return (
        <div
            className="gallery-lightbox-backdrop"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Image viewer"
        >
            <button
                type="button"
                className="gallery-lightbox-close"
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                aria-label="Close"
            >
                <X size={26} />
            </button>

            {total > 1 && (
                <button
                    type="button"
                    className="gallery-lightbox-nav gallery-lightbox-prev"
                    onClick={(e) => { e.stopPropagation(); goPrev(); }}
                    aria-label="Previous image"
                >
                    <ChevronLeft size={32} />
                </button>
            )}

            <div className="gallery-lightbox-content" onClick={(e) => e.stopPropagation()}>
                <img
                    src={current.image_path}
                    alt={current.image_caption || "Gallery image"}
                    className="gallery-lightbox-image"
                />
                {(current.image_caption || total > 1) && (
                    <div className="gallery-lightbox-caption">
                        {current.image_caption && <span>{current.image_caption}</span>}
                        {total > 1 && (
                            <span className="gallery-lightbox-counter">
                                {activeIndex + 1} / {total}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {total > 1 && (
                <button
                    type="button"
                    className="gallery-lightbox-nav gallery-lightbox-next"
                    onClick={(e) => { e.stopPropagation(); goNext(); }}
                    aria-label="Next image"
                >
                    <ChevronRight size={32} />
                </button>
            )}

            <style jsx>{`
                .gallery-lightbox-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.92);
                    z-index: 1050;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                }
                .gallery-lightbox-content {
                    max-width: 92vw;
                    max-height: 88vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .gallery-lightbox-image {
                    max-width: 92vw;
                    max-height: 80vh;
                    object-fit: contain;
                    border-radius: 8px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                }
                .gallery-lightbox-caption {
                    margin-top: 14px;
                    color: #f1f1f1;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 0.95rem;
                    text-align: center;
                }
                .gallery-lightbox-counter {
                    color: #b7b7b7;
                    font-size: 0.85rem;
                    white-space: nowrap;
                }
                .gallery-lightbox-close {
                    position: absolute;
                    top: 20px;
                    right: 24px;
                    background: transparent;
                    border: none;
                    color: #fff;
                    cursor: pointer;
                    z-index: 1060;
                }
                .gallery-lightbox-nav {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(255, 255, 255, 0.08);
                    border: none;
                    color: #fff;
                    cursor: pointer;
                    border-radius: 50%;
                    width: 52px;
                    height: 52px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.15s ease;
                }
                .gallery-lightbox-nav:hover {
                    background: rgba(255, 255, 255, 0.18);
                }
                .gallery-lightbox-prev {
                    left: 16px;
                }
                .gallery-lightbox-next {
                    right: 16px;
                }
                @media (max-width: 576px) {
                    .gallery-lightbox-nav {
                        width: 40px;
                        height: 40px;
                    }
                    .gallery-lightbox-close {
                        top: 12px;
                        right: 14px;
                    }
                }
            `}</style>
        </div>
    );
}
