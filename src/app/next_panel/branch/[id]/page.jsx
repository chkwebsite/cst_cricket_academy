"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, MapPin, Trash2 } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";

const fields = [
    ["Branch Code", "branch_code"],
    ["Contact Person", "contact_person"],
    ["Mobile", "mobile"],
    ["Email", "email"],
    ["Address", "address"],
    ["City", "city"],
    ["State", "state"],
    ["Pincode", "pincode"],
    ["Latitude", "latitude"],
    ["Longitude", "longitude"],
];

export default function BranchDetailPage() {
    const { user: userInfo } = useAuth();
    const [branch, setBranch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        async function loadBranch() {
            try {
                const res = await fetch(`/api/branch/${params.id}`);
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || "Unable to load branch.");
                setBranch(json.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadBranch();
    }, [params.id]);

    const handleDelete = async () => {
        if (!confirm("Delete this branch?")) return;

        setDeleting(true);
        setError(null);

        try {
            const res = await fetch(`/api/branch/${params.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete branch.");
            router.push("/next_panel/branch");
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
                                <Link href="/next_panel/branch" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Branches
                                </Link>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <MapPin size={24} />
                                    <h1 className="h4 mb-0">{branch?.branch_name || "Branch Details"}</h1>
                                </div>
                                <p className="text-muted mb-0">View and manage this academy branch.</p>
                            </div>
                            <div className="d-flex gap-2">
                                {userInfo.permissions.includes("branches.edit") && <Link href={`/next_panel/branch/${params.id}/edit`} className="btn btn-primary">
                                    <Edit size={16} className="me-2" /> Edit
                                </Link>}
                                {userInfo.permissions.includes("branches.delete") && <button className="btn btn-outline-danger" onClick={handleDelete} disabled={deleting}>
                                    <Trash2 size={16} className="me-2" /> {deleting ? "Deleting..." : "Delete"}
                                </button>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading branch details...</div>
                        ) : error ? (
                            <div className="alert alert-danger">{error}</div>
                        ) : (
                            <div className="row gy-4">
                                <div className="col-12">
                                    <div className="d-flex align-items-center gap-2">
                                        <span className={`badge ${branch.status === 1 ? "bg-success" : "bg-secondary"}`}>
                                            {branch.status === 1 ? "Active" : "Inactive"}
                                        </span>
                                        <span className="text-muted small">ID: {branch.id}</span>
                                    </div>
                                </div>

                                {fields.map(([label, key]) => (
                                    <div className="col-md-6" key={key}>
                                        <h2 className="h6 mb-1">{label}</h2>
                                        <p className="mb-0 text-muted">{branch[key] || "Not provided"}</p>
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
