"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    FolderKanban,
    Images,
    Image as ImageIcon,
    Video,
    Plus,
    ArrowUpRight,
    LayoutGrid,
} from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";

export default function GalleryHubPage() {
    const { user } = useAuth();
    const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
    const hasPermission = (permission) => {
        if (Number(user?.role_id) === 1 || Number(user?.role_id) === 7) return true;
        return permissions.includes(permission);
    };

    const [counts, setCounts] = useState({
        categories: null,
        albums: null,
        images: null,
        videos: null,
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadCounts() {
            try {
                const [catRes, albRes, imgRes, vidRes] = await Promise.all([
                    fetch("/api/gallery/categories"),
                    fetch("/api/gallery/albums"),
                    fetch("/api/gallery/images"),
                    fetch("/api/gallery/videos"),
                ]);

                const [catJson, albJson, imgJson, vidJson] = await Promise.all([
                    catRes.json(),
                    albRes.json(),
                    imgRes.json(),
                    vidRes.json(),
                ]);

                setCounts({
                    categories: catJson?.data?.length ?? 0,
                    albums: albJson?.data?.length ?? 0,
                    images: imgJson?.data?.length ?? 0,
                    videos: vidJson?.data?.length ?? 0,
                });
            } catch (err) {
                setError(err.message);
            }
        }

        loadCounts();
    }, []);

    const modules = [
        {
            key: "categories",
            title: "Categories",
            description: "Top-level groupings for albums (e.g. Events, Matches, Camps).",
            href: "/next_panel/gallery/categories",
            newHref: "/next_panel/gallery/categories/new",
            icon: FolderKanban,
            createPermission: "gallery.categories.create",
            count: counts.categories,
        },
        {
            key: "albums",
            title: "Albums",
            description: "Collections of photos/videos under a category, with cover image.",
            href: "/next_panel/gallery/albums",
            newHref: "/next_panel/gallery/albums/new",
            icon: Images,
            createPermission: "gallery.albums.create",
            count: counts.albums,
        },
        {
            key: "images",
            title: "Images",
            description: "Photos uploaded into albums, ordered and captioned.",
            href: "/next_panel/gallery/images",
            newHref: "/next_panel/gallery/images/new",
            icon: ImageIcon,
            createPermission: "gallery.images.create",
            count: counts.images,
        },
        {
            key: "videos",
            title: "Videos",
            description: "Video links or uploads attached to an album.",
            href: "/next_panel/gallery/videos",
            newHref: "/next_panel/gallery/videos/new",
            icon: Video,
            createPermission: "gallery.videos.create",
            count: counts.videos,
        },
    ];

    return (
        <div className="container-fluid">
            <div className="row g-4">
                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4 mb-2">
                        <div className="d-flex align-items-center gap-2 mb-2">
                            <LayoutGrid size={24} />
                            <h1 className="h4 mb-0">Gallery</h1>
                        </div>
                        <p className="text-muted mb-0">
                            Manage categories, albums, images and videos for the academy gallery.
                            Flow: create a Category → create an Album under it → upload Images / add Videos to that Album.
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="col-12">
                        <div className="alert alert-danger mb-0">{error}</div>
                    </div>
                )}

                {modules.map((mod) => {
                    const Icon = mod.icon;
                    return (
                        <div className="col-12 col-md-6 col-xl-3" key={mod.key}>
                            <div className="bg-white rounded-4 shadow-sm p-4 h-100 d-flex flex-column">
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <div className="d-flex align-items-center justify-content-center rounded-3 bg-light" style={{ width: 44, height: 44 }}>
                                        <Icon size={22} />
                                    </div>
                                    <span className="h4 mb-0">{mod.count === null ? "—" : mod.count}</span>
                                </div>
                                <h2 className="h6 mb-1">{mod.title}</h2>
                                <p className="text-muted small mb-3 flex-grow-1">{mod.description}</p>
                                <div className="d-flex gap-2">
                                    <Link href={mod.href} className="btn btn-outline-secondary btn-sm flex-grow-1">
                                        <ArrowUpRight size={14} className="me-1" /> View all
                                    </Link>
                                    {hasPermission(mod.createPermission) && (
                                        <Link href={mod.newHref} className="btn btn-primary btn-sm">
                                            <Plus size={14} />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
