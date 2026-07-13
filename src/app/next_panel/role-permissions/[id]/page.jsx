"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";

export default function RolePermissionsDetailPage() {
    const { user: userInfo } = useAuth();
    const [items, setItems] = useState([]);
    const [roleName, setRoleName] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();
    const params = useParams();
    useEffect(() => {
        async function loadItems() {
            try {
                const res = await fetch(`/api/role-permissions/${params.id}`);
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || "Unable to load role permissions.");
                setItems(json.data || []);
                setRoleName(json.data?.[0]?.role_name || `Role ${params.id}`);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadItems();
    }, [params.id]);

    const handleDelete = async (id) => {
        if (!confirm("Remove this permission assignment?")) return;
        try {
            const res = await fetch(`/api/role-permissions/${id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to remove assignment.");
            setItems((prev) => prev.filter((item) => item.id !== id));
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
                                <Link href="/next_panel/role-permissions" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Assignments
                                </Link>
                                <h1 className="h4 mb-2">{roleName}</h1>
                                <p className="text-muted mb-0">Assigned permissions for this role.</p>
                            </div>
                            {userInfo.permissions.includes("role-permissions.edit") && <Link href={`/next_panel/role-permissions/${params.id}/edit`} className="btn btn-primary">
                                <Edit size={16} className="me-2" /> Edit Assignments
                            </Link>}
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading permission assignments...</div>
                        ) : error ? (
                            <div className="alert alert-danger">{error}</div>
                        ) : items.length === 0 ? (
                            <div className="text-center py-5 text-muted">No permissions assigned to this role.</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th scope="col">Permission</th>
                                            <th scope="col">Module</th>
                                            <th scope="col" className="text-end">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item) => (
                                            <tr key={item.id}>
                                                <td>{item.permission_name}</td>
                                                <td className="text-muted">{item.module_name}</td>
                                                <td className="text-end">
                                                    {userInfo.permissions.includes("role-permissions.delete") && <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(item.id)}>
                                                        <Trash2 size={16} />
                                                    </button>}
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
