"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import ProfileForm, { getEmptyProfile, normalizeProfilePayload, profileToFormValues } from "../../ProfileForm";

export default function EditProfilePage() {
    const [values, setValues] = useState(getEmptyProfile());
    const [users, setUsers] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        async function loadData() {
            try {
                const [profileRes, usersRes, branchesRes] = await Promise.all([
                    fetch(`/api/profile/${params.id}`),
                    fetch("/api/users"),
                    fetch("/api/branch"),
                ]);
                const profileJson = await profileRes.json();
                const usersJson = await usersRes.json();
                const branchesJson = await branchesRes.json();

                if (!profileRes.ok) throw new Error(profileJson.message || "Unable to load profile.");
                if (!usersRes.ok) throw new Error(usersJson.message || "Unable to load users.");
                if (!branchesRes.ok) throw new Error(branchesJson.message || "Unable to load branches.");

                setValues(profileToFormValues(profileJson.data));
                setUsers(usersJson.data || []);
                setBranches(branchesJson.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [params.id]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const res = await fetch(`/api/profile/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(normalizeProfilePayload(values)),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to update profile.");
            router.push(`/next_panel/profiles/${params.id}`);
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
                                <Link href="/next_panel/profiles" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Profiles
                                </Link>
                                <h1 className="h4 mb-2">Edit Profile</h1>
                                <p className="text-muted mb-0">Update profile details and social links.</p>
                            </div>
                            <button className="btn btn-primary" type="submit" form="profileEditForm" disabled={saving || loading}>
                                <Save size={16} className="me-2" /> {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading profile details...</div>
                        ) : (
                            <ProfileForm
                                formId="profileEditForm"
                                values={values}
                                users={users}
                                branches={branches}
                                onChange={setValues}
                                onSubmit={handleSubmit}
                                error={error}
                                loading={saving}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
