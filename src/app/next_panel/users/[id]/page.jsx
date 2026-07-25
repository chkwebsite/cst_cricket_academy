"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";

export default function UserDetailPage() {
    const { user: userInfo } = useAuth();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();
    const params = useParams();
    useEffect(() => {
        async function loadUser() {
            try {
                const res = await fetch(`/api/users/${params.id}`);
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || "Unable to load user.");
                setUser(json.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadUser();
    }, [params.id]);

    const handleDelete = async () => {
        if (!confirm("Delete this user?")) return;
        try {
            const res = await fetch(`/api/users/${params.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Delete failed.");
            router.push("/next_panel/users");
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
                                <Link href="/next_panel/users" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Users
                                </Link>
                                <h1 className="h4 mb-2">User details</h1>
                                <p className="text-muted mb-0">View user profile and account settings.</p>
                            </div>
                            <div className="d-flex gap-2">
                                {userInfo.permissions.includes("users.edit") &&
                                    <Link href={`/next_panel/users/${params.id}/update`} className="btn btn-primary">
                                        <Edit size={16} className="me-2" /> Edit
                                    </Link>}
                                {userInfo.permissions.includes("users.delete") && <button className="btn btn-outline-danger" onClick={handleDelete}>
                                    <Trash2 size={16} className="me-2" /> Delete
                                </button>
                                }
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading user details...</div>
                        ) : error ? (
                            <div className="alert alert-danger">{error}</div>
                        ) : (
                            <div className="row gy-3">
                                <div className="col-md-4 text-center">
                                    <img src={user.profile_image || "/images/cst_white.png"} alt="Profile" className="img-fluid rounded-circle mb-3" style={{ maxWidth: 160 }} />
                                    <h5>{user.first_name} {user.last_name}</h5>
                                    <p className="text-muted mb-0">{user.role_name || "Role not assigned"}</p>
                                </div>
                                <div className="col-md-8">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <h6 className="mb-1">Username</h6>
                                            <p className="mb-0">{user.username || "—"}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <h6 className="mb-1">Branch Name</h6>
                                            <p className="mb-0">{user.branch_name || "—"}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <h6 className="mb-1">Email</h6>
                                            <p className="mb-0">{user.email}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <h6 className="mb-1">Mobile</h6>
                                            <p className="mb-0">{user.mobile || "—"}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <h6 className="mb-1">Gender</h6>
                                            <p className="mb-0">{user.gender || "—"}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <h6 className="mb-1">Date of Birth</h6>
                                            <p className="mb-0">{user.date_of_birth || "—"}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <h6 className="mb-1">Address</h6>
                                            <p className="mb-0">{user.address ? `${user.address}, ${user.city || ""} ${user.state || ""}` : "—"}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <h6 className="mb-1">Last Login</h6>
                                            <p className="mb-0">{user.last_login || "Never"}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <h6 className="mb-1">Status</h6>
                                            <span className={`badge ${user.status === 1 ? "bg-success" : "bg-secondary"}`}>
                                                {user.status === 1 ? "Active" : "Inactive"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
