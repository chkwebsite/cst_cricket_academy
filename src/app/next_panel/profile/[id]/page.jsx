"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, ExternalLink, Trash2, Users } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";
import { formatDateInput, getUserName } from "../ProfileForm";

const hasPermission = (user, permission) => {
    if (Number(user?.role_id) === 1 || Number(user?.role_id) === 7) return true;
    return user?.permissions?.includes(permission);
};

const profileFields = [
    ["Designation", "designation"],
    ["Sub Designation", "sub_designation"],
    ["Experience", "experience"],
    ["Qualification", "qualification"],
    ["Specialization", "specialization"],
    ["Date of Joining", "date_of_joining"],
    ["Display Order", "display_order"],
    ["Visiting Coaches", "visiting_coaches"],
];

const socialFields = [
    ["Facebook", "facebook_url"],
    ["Instagram", "instagram_url"],
    ["LinkedIn", "linkedin_url"],
    ["Twitter", "twitter_url"],
    ["YouTube", "youtube_url"],
    ["Website", "website_url"],
];

export default function ProfileDetailPage() {
    const { user: userInfo } = useAuth();
    const [profile, setProfile] = useState(null);
    const [profileUser, setProfileUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        async function loadProfile() {
            try {
                const profileRes = await fetch(`/api/profile/${params.id}`);
                const profileJson = await profileRes.json();

                if (!profileRes.ok) throw new Error(profileJson.message || "Unable to load profile.");

                setProfile(profileJson.data);
                setProfileUser({
                    id: profileJson.data.user_id,
                    first_name: profileJson.data.first_name,
                    last_name: profileJson.data.last_name,
                    email: profileJson.data.email,
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, [params.id]);

    const handleDelete = async () => {
        if (!confirm("Delete this profile?")) return;

        setDeleting(true);
        setError(null);

        try {
            const res = await fetch(`/api/profile/${params.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete profile.");
            router.push("/next_panel/profile");
        } catch (err) {
            setError(err.message);
        } finally {
            setDeleting(false);
        }
    };

    const getValue = (key) => key === "date_of_joining" ? formatDateInput(profile[key]) : profile[key];

    return (
        <div className="container-fluid">
            <div className="row g-4">
                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                            <div>
                                <Link href="/next_panel/profile" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Profiles
                                </Link>
                                <div className="d-flex align-items-center gap-2 mb-2">

                                    {profile?.profile_image ?
                                        <img className="rounded-circle border border-white" src={profile?.profile_image} alt="image" style={{ height: '50px' }} /> :
                                        <Users size={24} />
                                    }
                                    <h1 className="h4 mb-0">{profile?.title || "Profile Details"}</h1>
                                </div>
                                <p className="text-muted mb-0">View and manage this profile.</p>
                            </div>
                            <div className="d-flex gap-2">
                                {userInfo.permissions.includes("profile.edit") && <Link href={`/next_panel/profile/${params.id}/edit`} className="btn btn-primary">
                                    <Edit size={16} className="me-2" /> Edit
                                </Link>}
                                {userInfo.permissions.includes("profile.delete") && <button className="btn btn-outline-danger" onClick={handleDelete} disabled={deleting}>
                                    <Trash2 size={16} className="me-2" /> {deleting ? "Deleting..." : "Delete"}
                                </button>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading profile details...</div>
                        ) : error ? (
                            <div className="alert alert-danger">{error}</div>
                        ) : (
                            <div className="row gy-4">
                                <div className="col-12">
                                    <div className="d-flex flex-wrap align-items-center gap-2">
                                        <span className={`badge ${profile.status === 1 ? "bg-success" : "bg-secondary"}`}>
                                            {profile.status === 1 ? "Active" : "Inactive"}
                                        </span>
                                        <span className="text-muted small">ID: {profile.id}</span>
                                        <span className="text-muted small">User: {getUserName(profileUser) || `User #${profile.user_id}`}</span>

                                        <span className="text-muted small">Branch: {profile.branch_name || `Branch #${profile.branch_id}`}</span>

                                        <span className="text-muted small">Visiting Coaches: {profile?.visiting_coaches === 0 ? "Visiting Coach" : ""}</span>
                                    </div>
                                </div>

                                {profileFields.map(([label, key]) => (
                                    <div className="col-md-6" key={key}>
                                        <h2 className="h6 mb-1">{label}</h2>
                                        <p className="mb-0 text-muted">{getValue(key) || "Not provided"}</p>
                                    </div>
                                ))}

                                <div className="col-md-12">
                                    <h2 className="h6 mb-1 fw-semibold">About Me</h2>
                                    <p className="mb-0 text-muted"
                                        dangerouslySetInnerHTML={{ __html: profile.about_me }}></p>
                                </div>

                                <div className="col-md-12">
                                    <h2 className="h6 mb-1 fw-semibold">Description</h2>
                                    <p className="mb-0 text-muted"
                                        dangerouslySetInnerHTML={{ __html: profile.description }}></p>
                                </div>

                                <div className="col-12">
                                    <h2 className="h6 mb-1">Achievements</h2>
                                    <p className="mb-0 text-muted">{profile.achievements || "Not provided"}</p>
                                </div>

                                <div className="col-12">
                                    <h2 className="h6 mb-3">Social Links</h2>
                                    <div className="row g-3">
                                        {socialFields.map(([label, key]) => (
                                            <div className="col-md-4" key={key}>
                                                {profile[key] ? (
                                                    <a className="btn btn-outline-primary btn-sm" href={profile[key]} target="_blank" rel="noreferrer">
                                                        <ExternalLink size={14} className="me-2" /> {label}
                                                    </a>
                                                ) : (
                                                    <span className="text-muted small">{label}: Not provided</span>
                                                )}
                                            </div>
                                        ))}
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
