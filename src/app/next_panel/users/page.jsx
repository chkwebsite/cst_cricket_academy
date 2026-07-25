"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Users, ArrowUpRight, Edit } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";

export default function UsersPage() {
    const { user: userinfo } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadUsers() {
            try {
                const res = await fetch("/api/users");
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || "Unable to load users.");
                setUsers(json.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadUsers();
    }, []);

    return (
        <div className="container-fluid">
            <div className="row g-4">
                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                            <div>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <Users size={24} />
                                    <h1 className="h4 mb-0">Users</h1>
                                </div>
                                <p className="text-muted mb-0">Manage registered users and account details.</p>
                            </div>
                            {userinfo.permissions.includes("users.create") &&
                                <Link href="/next_panel/users/new" className="btn btn-primary fw-semibold">
                                    <Plus size={16} className="me-2" /> New User
                                </Link>
                            }
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-3">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading users...</div>
                        ) : error ? (
                            <div className="alert alert-danger">{error}</div>
                        ) : users.length === 0 ? (
                            <div className="text-center py-5 text-muted">No users found yet.</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th scope="col">Name</th>
                                            <th scope="col">Role</th>
                                            <th scope="col">Branch</th>
                                            <th scope="col">Email</th>
                                            <th scope="col">Mobile</th>
                                            <th scope="col">Status</th>
                                            <th scope="col" className="text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user) => (
                                            <tr key={user.id}>
                                                <td className="fw-semibold">{user.first_name} {user.last_name}</td>
                                                <td>{user.role_name || "—"}</td>
                                                <td>{user.branch_name || "—"}</td>
                                                <td className="text-muted">{user.email}</td>
                                                <td className="text-muted">{user.mobile || "—"}</td>
                                                <td>
                                                    <span className={`badge ${user.status === 1 ? "bg-success" : "bg-secondary"}`}>
                                                        {user.status === 1 ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td className="text-end">
                                                    <div className="btn-group btn-group-sm" role="group">
                                                        <Link href={`/next_panel/users/${user.id}`} className="btn btn-outline-primary">
                                                            <ArrowUpRight size={16} />
                                                        </Link>

                                                        {userinfo.permissions.includes("users.edit") && <Link href={`/next_panel/users/${user.id}/update`} className="btn btn-outline-secondary">
                                                            <Edit size={16} />
                                                        </Link>}
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
