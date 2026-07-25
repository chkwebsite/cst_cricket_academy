"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2, Users } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";

const fields = [
    ["Age Group Name", "age_group"],
    ["Min Age", "min_age"],
    ["Max Age", "max_age"],
];

export default function AgeGroupDetailPage() {
    const { user: userInfo } = useAuth();
    const [ageGroup, setAgeGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);
    // const params = useParams();
    const router = useRouter();
    const { id } = useParams();
    async function loadAgeGroup() {
        try {
            const res = await fetch(`/api/age_groups/${id}`);
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to load age group.");
            setAgeGroup(json.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        loadAgeGroup();
    }, []);

    const handleDelete = async () => {
        if (!confirm("Delete this age group?")) return;

        setDeleting(true);
        setError(null);

        try {
            const res = await fetch(`/api/age_groups/${id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete age group.");
            router.push("/next_panel/age-group");
        } catch (err) {
            setError(err.message);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="container-fluid">
            <div className="row g-4">
                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                            <div>
                                <Link href="/next_panel/age-group" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Age Groups
                                </Link>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <Users size={24} />
                                    <h1 className="h4 mb-0">{ageGroup?.age_group || "Age Group Details"}</h1>
                                </div>
                                <p className="text-muted mb-0">View and manage this age group bracket.</p>
                            </div>
                            <div className="d-flex gap-2">
                                {userInfo.permissions.includes("age-group.edit") && (
                                    <Link href={`/next_panel/age-group/${id}/edit`} className="btn btn-primary">
                                        <Edit size={16} className="me-2" /> Edit
                                    </Link>
                                )}
                                {userInfo.permissions.includes("age-group.delete") && (
                                    <button className="btn btn-outline-danger" onClick={handleDelete} disabled={deleting}>
                                        <Trash2 size={16} className="me-2" /> {deleting ? "Deleting..." : "Delete"}
                                    </button>
                                )}

                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading age group details...</div>
                        ) : error ? (
                            <div className="alert alert-danger">{error}</div>
                        ) : (
                            <div className="row gy-4">
                                <div className="col-12">
                                    <div className="d-flex align-items-center gap-2">
                                        <span className={`badge ${ageGroup.status === 1 ? "bg-success" : "bg-secondary"}`}>
                                            {ageGroup.status === 1 ? "Active" : "Inactive"}
                                        </span>
                                        <span className="text-muted small">ID: {ageGroup.id}</span>
                                    </div>
                                </div>

                                {fields.map(([label, key]) => (
                                    <div className="col-md-4" key={key}>
                                        <h2 className="h6 mb-1">{label}</h2>
                                        <p className="mb-0 text-muted">{ageGroup[key] ?? "Not provided"}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

