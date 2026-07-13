"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

export default function EditMenuPage() {
    const [menus, setMenus] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [values, setValues] = useState({
        parent_id: "",
        menu_name: "",
        menu_icon: "",
        menu_url: "",
        sort_order: 0,
        permission_name: "",
        status: 1,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();
    const params = useParams();
    useEffect(() => {
        async function loadData() {
            try {
                const [menusRes, menuRes, permsRes] = await Promise.all([
                    fetch("/api/menus"),
                    fetch(`/api/menus/${params.id}`),
                    fetch("/api/permissions"),
                ]);

                const menusJson = await menusRes.json();
                const menuJson = await menuRes.json();
                const permsJson = await permsRes.json();

                if (!menusRes.ok) throw new Error(menusJson.message || "Unable to load menus.");
                if (!menuRes.ok) throw new Error(menuJson.message || "Unable to load menu.");
                if (!permsRes.ok) throw new Error(permsJson.message || "Unable to load permissions.");

                setMenus(menusJson.data || []);
                setPermissions(permsJson.data || []);
                setValues({
                    parent_id: menuJson.data.parent_id || "",
                    menu_name: menuJson.data.menu_name || "",
                    menu_icon: menuJson.data.menu_icon || "",
                    menu_url: menuJson.data.menu_url || "",
                    sort_order: menuJson.data.sort_order || 0,
                    permission_name: menuJson.data.permission_name || "",
                    status: menuJson.data.status || 0,
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [params.id]);

    const handleChange = (key) => (e) => {
        const value = key === "sort_order" || key === "status" ? Number(e.target.value) : e.target.value;
        setValues((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const res = await fetch(`/api/menus/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to update menu.");
            router.push(`/next_panel/menus/${params.id}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container-fluid">
            <div className="row g-4">
                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                            <div>
                                <Link href="/next_panel/menus" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Menus
                                </Link>
                                <h1 className="h4 mb-2">Edit Menu</h1>
                                <p className="text-muted mb-0">Update this navigation menu item.</p>
                            </div>
                            <button className="btn btn-primary" type="submit" form="menuForm" disabled={saving || loading}>
                                <Save size={16} className="me-2" /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading menu data...</div>
                        ) : (
                            <form id="menuForm" onSubmit={handleSubmit}>
                                {error && <div className="alert alert-danger">{error}</div>}

                                <div className="mb-3">
                                    <label className="form-label">Parent Menu</label>
                                    <select className="form-select" value={values.parent_id} onChange={handleChange("parent_id")}>
                                        <option value="">No parent</option>
                                        {menus.map((menu) => (
                                            <option key={menu.id} value={menu.id}>{menu.menu_name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Menu Name</label>
                                    <input className="form-control" value={values.menu_name} onChange={handleChange("menu_name")} required />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Menu Icon</label>
                                    <input className="form-control" value={values.menu_icon} onChange={handleChange("menu_icon")} placeholder="e.g. home, settings" />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Menu URL</label>
                                    <input className="form-control" value={values.menu_url} onChange={handleChange("menu_url")} placeholder="/next_panel/dashboard" />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Sort Order</label>
                                    <input type="number" className="form-control" value={values.sort_order} onChange={handleChange("sort_order")} />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Permission</label>
                                    <select className="form-select" value={values.permission_name} onChange={handleChange("permission_name")}>
                                        <option value="">— No permission —</option>
                                        {permissions.map((p) => (
                                            <option key={p.id} value={p.permission_name}>{p.permission_name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Status</label>
                                    <select className="form-select" value={values.status} onChange={handleChange("status")}>
                                        <option value={1}>Active</option>
                                        <option value={0}>Inactive</option>
                                    </select>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
