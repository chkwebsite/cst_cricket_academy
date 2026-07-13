"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/utils/AuthContext";
import {
    Home,
    Users,
    Layers,
    Settings,
    Bell,
    MessageCircle,
    LayoutDashboard,
    ChevronDown,
    Menu,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Shield,
    Building2,
    UserRoundCheck,
    IdCard
} from "lucide-react";
import * as Icons from "lucide-react";

const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect width='120' height='120' fill='%23673AB7'/%3E%3Ctext x='50%25' y='60%25' font-size='54' text-anchor='middle' fill='%23ffffff' font-family='Arial,Helvetica,sans-serif'%3EA%3C/text%3E%3C/svg%3E";

export default function PanelShell({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { user, setUser, loading: authLoading } = useAuth();
    const [menuTree, setMenuTree] = useState([]);
    const [menuLoading, setMenuLoading] = useState(true);
    const [authorized, setAuthorized] = useState(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!authLoading && user && !sessionStorage.getItem("user")) {
            sessionStorage.setItem("user", JSON.stringify(user));
        }
    }, [authLoading, user]);
    const handleLogout = async () => {
        try {
            const res = await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "same-origin",
            });

            if (res.ok) {
                sessionStorage.removeItem("token");
                sessionStorage.removeItem("user");
                router.push("/login");
            }
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    useEffect(() => {
        if (authLoading) return;

        async function loadMenus() {
            setMenuLoading(true);
            try {
                const url = user && user.role_id && Number(user.role_id) !== 7
                    ? `/api/menus?role_id=${user.role_id}`
                    : "/api/menus";
                const res = await fetch(url);
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || "Unable to load menus.");
                const items = json.data || [];

                const map = {};
                items.forEach((it) => {
                    map[it.id] = { ...it, children: [] };
                });

                const roots = [];
                items.forEach((it) => {
                    if (it.parent_id) {
                        if (map[it.parent_id]) map[it.parent_id].children.push(map[it.id]);
                        else roots.push(map[it.id]);
                    } else {
                        roots.push(map[it.id]);
                    }
                });

                const filterTree = (nodes) =>
                    nodes
                        .map((n) => {
                            const children = filterTree(n.children || []);
                            return { ...n, children };
                        })
                        .filter((n) => {
                            if (n.permission_name) {
                                return true;
                            }
                            return n.children.length > 0 || !n.menu_url;
                        });

                setMenuTree(filterTree(roots));
            } catch (err) {
                console.error("Load menus failed", err);
            } finally {
                setMenuLoading(false);
            }
        }

        loadMenus();
    }, [user, authLoading]);

    // client-side guard: if current path is under /next_panel but not present in allowed menus, redirect
    useEffect(() => {
        if (authLoading || menuLoading) return;
        if (!pathname || !pathname.startsWith("/next_panel")) return;
        // allow dashboard always
        if (pathname === "/next_panel/dashboard" || pathname === "/next_panel") {
            setTimeout(() => setAuthorized(true), 0);
            return;
        }

        const allUrls = [];
        const collect = (nodes) => {
            (nodes || []).forEach((n) => {
                if (n.menu_url) allUrls.push(n.menu_url);
                if (n.children) collect(n.children);
            });
        };
        collect(menuTree);

        const normalize = (u) => {
            if (!u) return "";
            let base = String(u).split("?")[0].split("#")[0].trim();
            if (!base.startsWith("/")) base = `/${base}`;
            return base.replace(/\/+$|^\s+|\s+$/g, "");
        };

        const pathNorm = normalize(pathname);

        const candidates = ["/next_panel/branch", "/next_panel/co-founders", "/next_panel/profile", "/next_panel/coaching_program"];
        allUrls.forEach((u) => {
            const nu = normalize(u);
            if (!nu) return;
            candidates.push(nu);
            if (!nu.startsWith("/next_panel")) {
                candidates.push(`/next_panel${nu}`);
            } else {
                const relative = nu.replace(/^\/next_panel/, "") || "/";
                candidates.push(relative);
            }
        });

        const matched = candidates.some((candidate) => {
            if (!candidate) return false;
            return pathNorm === candidate || pathNorm.startsWith(candidate + "/");
        });

        if (!matched) {
            if (user && Number(user.role_id) === 7) {
                setTimeout(() => setAuthorized(true), 0);
                return;
            }
            setTimeout(() => setAuthorized(false), 0);
            router.replace("/next_panel/dashboard");
            return;
        }
        setTimeout(() => setAuthorized(true), 0);
    }, [authLoading, menuLoading, menuTree, pathname, user, router]);

    const getIconComponent = (name) => {
        if (!name) return Menu;
        const pascal = String(name)
            .split(/[-_ ]+/)
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
            .join("");
        return Icons[pascal] || Menu;
    };

    return (
        <div className={`panel-shell d-flex min-vh-100 ${sidebarOpen ? "" : "sidebar-collapsed"}`}>
            <aside className={`panel-sidebar bg-purple text-white d-flex flex-column ${sidebarOpen ? "" : "collapsed"}`}>
                <div className="sidebar-brand px-3 py-2 border-bottom d-flex align-items-center gap-2">
                    <Image src="/images/cst_white.png" alt="Logo" className="sidebar-logo" style={{ height: '71px' }} width={71} height={71} />
                    {/* <LayoutDashboard size={24} />
                    <span className="sidebar-brand-text h6 mb-0">Cricket</span> */}
                    <button
                        type="button"
                        className="btn btn-sm btn-light text-purple ms-auto sidebar-toggle"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-label="Toggle sidebar"
                    >
                        {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                    </button>
                </div>

                <nav className="sidebar-menu flex-grow-1 overflow-auto px-2 py-3">
                    {menuLoading ? (
                        <>
                            <a href="/next_panel/dashboard" className="nav-link active d-flex align-items-center gap-3 py-2 px-3 rounded-3 mb-2">
                                <Home size={18} />
                                <span className="sidebar-label">Dashboard</span>
                            </a>

                            <Link href="/next_panel/roles" className="nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-3 mb-2">
                                <Users size={18} />
                                <span className="sidebar-label">Roles</span>
                            </Link>

                            <Link href="/next_panel/permissions" className="nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-3 mb-2">
                                <Shield size={18} />
                                <span className="sidebar-label">Permissions</span>
                            </Link>

                            <Link href="/next_panel/role-permissions" className="nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-3 mb-2">
                                <Layers size={18} />
                                <span className="sidebar-label">Role Permissions</span>
                            </Link>

                            <Link href="/next_panel/menus" className="nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-3 mb-2">
                                <Menu size={18} />
                                <span className="sidebar-label">Menus</span>
                            </Link>

                            <Link href="/next_panel/users" className="nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-3 mb-2">
                                <Users size={18} />
                                <span className="sidebar-label">Users</span>
                            </Link>

                            <Link href="/next_panel/branch" className="nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-3 mb-2">
                                <Building2 size={18} />
                                <span className="sidebar-label">Branches</span>
                            </Link>
                        </>
                    ) : (
                        menuTree.map((item) => (
                            item.children && item.children.length > 0 ? (
                                <div className="mt-2" key={item.id}>
                                    <button className="nav-link d-flex align-items-center justify-content-between gap-2 py-2 px-3 rounded-3 w-100 text-start" data-bs-toggle="collapse" data-bs-target={`#menu-${item.id}`} aria-expanded="false" aria-controls={`menu-${item.id}`}>
                                        <span className="d-flex align-items-center gap-2">
                                            {(() => { const Comp = getIconComponent(item.menu_icon); return <Comp size={18} /> })()}
                                            <span className="sidebar-label">{item.menu_name}</span>
                                        </span>
                                        <ChevronDown size={18} />
                                    </button>
                                    <div className="collapse" id={`menu-${item.id}`}>
                                        <div className="list-group list-group-flush ps-4">
                                            {item.children.map((c) => (
                                                <a key={c.id} href={c.menu_url || "#"} className="list-group-item list-group-item-action">{c.menu_name}</a>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <a key={item.id} href={item.menu_url || "#"} className="nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-3 mb-2">
                                    {(() => { const Comp = getIconComponent(item.menu_icon); return <Comp size={18} /> })()}
                                    <span className="sidebar-label">{item.menu_name}</span>
                                </a>
                            )
                        ))
                    )}

                    <hr />
                    {/* <div className="mt-2">
                        <Link href="/next_panel/branch" className="nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-3 mb-2">
                            <Building2 size={18} />
                            <span className="sidebar-label">Branches</span>
                        </Link>
                    </div> */}

                    {/* <div className="mt-2">
                        <Link href="/next_panel/co-founders" className="nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-3 mb-2">
                            <UserRoundCheck size={18} />
                            <span className="sidebar-label">Co-Founders</span>
                        </Link>
                    </div> */}

                    {/* <div className="mt-2">
                        <Link href="/next_panel/coaching_program" className="nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-3 mb-2">
                            <UserRoundCheck size={18} />
                            <span className="sidebar-label">Coaching Program</span>
                        </Link>
                    </div> */}

                    {/* <div className="mt-2">
                        <Link href="/next_panel/profile" className="nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-3 mb-2">
                            <IdCard size={18} />
                            <span className="sidebar-label">Profiles</span>
                        </Link>
                    </div> */}

                    <div className="mt-3">
                        <button className="nav-link d-flex align-items-center justify-content-between gap-2 py-2 px-3 rounded-3 w-100 text-start" data-bs-toggle="collapse" data-bs-target="#usersMenu" aria-expanded="false" aria-controls="usersMenu">
                            <span className="d-flex align-items-center gap-2"><Users size={18} /><span className="sidebar-label">Users</span></span>
                            <ChevronDown size={18} />
                        </button>
                        <div className="collapse" id="usersMenu">
                            <div className="list-group list-group-flush ps-4">
                                <a href="#" className="list-group-item list-group-item-action">All users</a>
                                <a href="#" className="list-group-item list-group-item-action">Add user</a>
                                <a href="#" className="list-group-item list-group-item-action">User roles</a>
                            </div>
                        </div>
                    </div>

                    <div className="mt-2">
                        <button className="nav-link d-flex align-items-center justify-content-between gap-2 py-2 px-3 rounded-3 w-100 text-start" data-bs-toggle="collapse" data-bs-target="#contentMenu" aria-expanded="false" aria-controls="contentMenu">
                            <span className="d-flex align-items-center gap-2"><Layers size={18} /><span className="sidebar-label">Content</span></span>
                            <ChevronDown size={18} />
                        </button>
                        <div className="collapse" id="contentMenu">
                            <div className="list-group list-group-flush ps-4">
                                <a href="#" className="list-group-item list-group-item-action">Courses</a>
                                <a href="#" className="list-group-item list-group-item-action">Schedules</a>
                                <a href="#" className="list-group-item list-group-item-action">Announcements</a>
                            </div>
                        </div>
                    </div>

                    <div className="mt-2">
                        <button className="nav-link d-flex align-items-center justify-content-between gap-2 py-2 px-3 rounded-3 w-100 text-start" data-bs-toggle="collapse" data-bs-target="#reportsMenu" aria-expanded="false" aria-controls="reportsMenu">
                            <span className="d-flex align-items-center gap-2"><MessageCircle size={18} /><span className="sidebar-label">Reports</span></span>
                            <ChevronDown size={18} />
                        </button>
                        <div className="collapse" id="reportsMenu">
                            <div className="list-group list-group-flush ps-4">
                                <a href="#" className="list-group-item list-group-item-action">Attendance</a>
                                <a href="#" className="list-group-item list-group-item-action">Progress</a>
                                <a href="#" className="list-group-item list-group-item-action">Invoices</a>
                            </div>
                        </div>
                    </div>

                    <div className="mt-2">
                        <button className="nav-link d-flex align-items-center justify-content-between gap-2 py-2 px-3 rounded-3 w-100 text-start" data-bs-toggle="collapse" data-bs-target="#settingsMenu" aria-expanded="false" aria-controls="settingsMenu">
                            <span className="d-flex align-items-center gap-2"><Settings size={18} /><span className="sidebar-label">Settings</span></span>
                            <ChevronDown size={18} />
                        </button>
                        <div className="collapse" id="settingsMenu">
                            <div className="list-group list-group-flush ps-4">
                                <a href="#" className="list-group-item list-group-item-action">Profile</a>
                                <a href="#" className="list-group-item list-group-item-action">Preferences</a>
                                <a href="#" className="list-group-item list-group-item-action">Security</a>
                            </div>
                        </div>
                    </div>
                </nav>

                <div className="sidebar-footer px-3 py-3 border-top">
                    <div className="d-flex align-items-center gap-2">
                        <Image src={user?.profile_image || defaultAvatar} alt="User" className="rounded-circle" width={38} height={38} />
                        <div className="d-none d-sm-block">
                            <div className="fw-semibold mb-0">{user?.first_name} {user?.last_name}</div>
                            <small className="text-white-50">{user?.role_name}</small>
                        </div>
                    </div>
                </div>
            </aside>

            <div className="panel-main flex-grow-1 d-flex flex-column">
                <header className="panel-header bg-purple text-white px-4 py-3 shadow-sm">
                    <div className="d-flex align-items-center justify-content-end gap-3 flex-wrap">
                        {/* <div className="d-flex align-items-center gap-3">
                            <img src={user?.profile_image || defaultAvatar} alt="User" className="rounded-circle border border-white" width="44" height="44" />
                            <div>
                                <div className="fw-semibold mb-0">{user?.first_name} {user?.last_name}</div>
                                <small className="text-white-50">{user?.role_name}</small>
                            </div>
                        </div> */}

                        <div className="d-flex align-items-center gap-2">
                            <div className="dropdown">
                                <button className="btn btn-light btn-sm dropdown-toggle text-purple fw-semibold" type="button" id="profileDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                                    <Image src={user?.profile_image || defaultAvatar} alt="User" className="rounded-circle border border-white" width={44} height={44} />
                                    &nbsp; {user?.first_name} {user?.last_name}
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
                                    <li><a className="dropdown-item" href="#">Profile</a></li>
                                    {/* <li><a className="dropdown-item" href="#">Preferences</a></li>
                                    <li><a className="dropdown-item" href="#">Security</a></li> */}
                                    <li><a className="dropdown-item text-danger fw-semibold" href="#" onClick={handleLogout}><LogOut size={16} /> LogOut</a></li>
                                </ul>
                            </div>
                            {/* <button className="btn btn-sm btn-light border" onClick={handleLogout}>
                                <LogOut size={16} />
                            </button> */}
                        </div>
                    </div>
                </header>

                <main className="panel-content flex-grow-1 p-4 bg-light">
                    {authorized === false ? (
                        <div className="d-flex align-items-center justify-content-center h-100">
                            <div className="text-center">
                                <div className="spinner-border text-primary mb-3" role="status"><span className="visually-hidden">Loading...</span></div>
                                <div className="fw-semibold mb-2">Not authorized — redirecting...</div>
                                <div>
                                    <button type="button" className="btn btn-outline-secondary btn-sm me-2" onClick={() => router.back()}>
                                        Go back
                                    </button>
                                    <a className="btn btn-outline-primary btn-sm" href="/next_panel/dashboard">Go to dashboard</a>
                                </div>
                            </div>
                        </div>
                    ) : authorized === null ? (
                        <div className="d-flex align-items-center justify-content-center h-100">
                            <div className="text-center">
                                <div className="spinner-border text-primary mb-3" role="status"><span className="visually-hidden">Loading...</span></div>
                                <div className="fw-semibold mb-2">Checking permissions...</div>
                            </div>
                        </div>
                    ) : (
                        children
                    )}
                </main>

                <footer className="panel-footer bg-white border-top py-3 px-4 text-muted small">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
                        <span>© {new Date().getFullYear()} Cricket Academy</span>
                        <span>Built with Bootstrap & Lucide</span>
                    </div>
                </footer>
            </div>
        </div>
    );
}
