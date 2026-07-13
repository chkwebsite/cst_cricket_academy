"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import ProfileForm, { getEmptyProfile, normalizeProfilePayload } from "../ProfileForm";

export default function NewProfilePage() {
    const [values, setValues] = useState(getEmptyProfile());
    const [users, setUsers] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        async function loadFormData() {
            try {
                const [usersRes, branchesRes] = await Promise.all([
                    fetch("/api/users"),
                    fetch("/api/branch"),
                ]);
                const usersJson = await usersRes.json();
                const branchesJson = await branchesRes.json();

                if (!usersRes.ok) throw new Error(usersJson.message || "Unable to load users.");
                if (!branchesRes.ok) throw new Error(branchesJson.message || "Unable to load branches.");

                setUsers(usersJson.data || []);
                setBranches(branchesJson.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadFormData();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const res = await fetch("/api/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(normalizeProfilePayload(values)),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to create profile.");
            router.push("/next_panel/profile");
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
                                <Link href="/next_panel/profile" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Profiles
                                </Link>
                                <h1 className="h4 mb-2">Create Profile</h1>
                                <p className="text-muted mb-0">Add a public profile for an academy user.</p>
                            </div>
                            <button className="btn btn-primary" type="submit" form="profileForm" disabled={saving || loading}>
                                <Plus size={16} className="me-2" /> {saving ? "Saving..." : "Save Profile"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading form data...</div>
                        ) : (
                            <ProfileForm
                                formId="profileForm"
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
