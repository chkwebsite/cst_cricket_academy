"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import ProfileForm, { buildCoachingProgramFormData, getEmptyProfile, profileToFormValues } from "../../ProfileForm";

export default function EditProfilePage() {
    const [values, setValues] = useState(getEmptyProfile());
    const [users, setUsers] = useState([]);
    const [branches, setBranches] = useState([]);
    const [coaches, setCoaches] = useState([]);
    const [existingImage, setExistingImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        async function loadData() {
            try {
                const [profileRes, usersRes, branchesRes, coachesRes] = await Promise.all([
                    fetch(`/api/coaching-program/${params.id}`),
                    fetch("/api/users"),
                    fetch("/api/branch"),
                    fetch("/api/profile"),
                ]);
                const profileJson = await profileRes.json();
                const usersJson = await usersRes.json();
                const branchesJson = await branchesRes.json();
                const coachesJson = await coachesRes.json();

                if (!profileRes.ok || !profileJson.success) throw new Error(profileJson.message || "Unable to load coaching program.");
                if (!usersRes.ok) throw new Error(usersJson.message || "Unable to load users.");
                if (!branchesRes.ok) throw new Error(branchesJson.message || "Unable to load branches.");
                if (!coachesRes.ok) throw new Error(coachesJson.message || "Unable to load coaches.");

                setValues(profileToFormValues(profileJson.data));
                setExistingImage(profileJson.data.program_image || null);
                setUsers(usersJson.data || []);
                setBranches(branchesJson.data || []);
                setCoaches(coachesJson.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [params.id]);

    const handleChange = (nextValues) => {
        if (preview) URL.revokeObjectURL(preview);
        setValues(nextValues);
        setPreview(nextValues.program_image instanceof File ? URL.createObjectURL(nextValues.program_image) : null);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const res = await fetch(`/api/coaching-program/${params.id}`, {
                method: "PUT",
                body: buildCoachingProgramFormData(values),
            });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message || "Unable to update coaching program.");
            router.push(`/next_panel/coaching_program/${params.id}`);
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
                                <Link href="/next_panel/coaching_program" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Coaching Programs
                                </Link>
                                <h1 className="h4 mb-2">Edit Coaching Program</h1>
                                <p className="text-muted mb-0">Update program schedule, fees, seats, and content.</p>
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
                            <div className="text-center py-5 text-muted">Loading coaching program details...</div>
                        ) : (
                            <ProfileForm
                                formId="profileEditForm"
                                values={values}
                                users={users}
                                branches={branches}
                                coaches={coaches}
                                onChange={handleChange}
                                onSubmit={handleSubmit}
                                error={error}
                                loading={saving}
                                imagePreview={preview}
                                existingImage={existingImage}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
