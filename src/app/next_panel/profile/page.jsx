"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Edit, Plus, Trash2, Users } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";
import { getUserName } from "./ProfileForm";



export default function ProfilePage() {
    const { user: userInfo } = useAuth();
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadProfiles() {
            try {
                const profileRes = await fetch("/api/profile");
                const profileJson = await profileRes.json();

                if (!profileRes.ok) throw new Error(profileJson.message || "Unable to load profiles.");

                setProfiles(profileJson.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadProfiles();
    }, []);

    const handleDelete = async (profile) => {
        if (!confirm(`Delete profile "${profile.title}"?`)) return;

        setDeletingId(profile.id);
        setError(null);

        try {
            const res = await fetch(`/api/profile/${profile.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete profile.");
            setProfiles((current) => current.filter((item) => item.id !== profile.id));
        } catch (err) {
            setError(err.message);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="container-fluid">
            <div className="row g-4">
                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                            <div>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <Users size={24} />
                                    <h1 className="h4 mb-0">Profiles</h1>
                                </div>
                                <p className="text-muted mb-0">Manage public profile details for academy users.</p>
                            </div>

                            {userInfo.permissions.includes("profile.view") &&
                                <Link href="/next_panel/profile/new" className="btn btn-primary fw-semibold">
                                    <Plus size={16} className="me-2" /> New Profile
                                </Link>
                            }
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-3">
                        {error && <div className="alert alert-danger">{error}</div>}

                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading profiles...</div>
                        ) : profiles.length === 0 ? (
                            <div className="text-center py-5 text-muted">No profiles found yet.</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th scope="col">Profile</th>
                                            <th scope="col">User</th>
                                            <th scope="col">Branch</th>
                                            <th scope="col">Experience</th>
                                            <th scope="col">Order</th>
                                            <th scope="col">Status</th>
                                            <th scope="col" className="text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {profiles.map((profile) => (
                                            <tr key={profile.id}>
                                                <td>
                                                    <div className="fw-semibold">{profile.title}</div>
                                                    <small className="text-muted">{profile.designation || "No designation"}</small>
                                                </td>
                                                <td>{getUserName(profile) || `User #${profile.user_id}`}</td>
                                                <td>{profile.branch_name || "Not provided"}</td>
                                                <td className="text-muted">{profile.experience || "Not provided"}</td>
                                                <td>{profile.display_order ?? 0}</td>
                                                <td>
                                                    <span className={`badge ${profile.status === 1 ? "bg-success" : "bg-secondary"}`}>
                                                        {profile.status === 1 ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td className="text-end">
                                                    <div className="btn-group btn-group-sm" role="group">
                                                        <Link href={`/next_panel/profile/${profile.id}`} className="btn btn-outline-primary" aria-label="View profile">
                                                            <ArrowUpRight size={16} />
                                                        </Link>

                                                        {userInfo.permissions.includes("profile.edit") && <Link href={`/next_panel/profile/${profile.id}/edit`} className="btn btn-outline-secondary" aria-label="Edit profile">
                                                            <Edit size={16} />
                                                        </Link>}
                                                        {userInfo.permissions.includes("profile.delete") &&
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-danger"
                                                                onClick={() => handleDelete(profile)}
                                                                disabled={deletingId === profile.id}
                                                                aria-label="Delete profile"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        }
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
