"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2, UserRoundCheck } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";
import { getBranchName } from "../ExpertForm";

export default function ExpertDetailPage() {
    const { user } = useAuth();
    const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
    const hasPermission = (permission) => {
        if (Number(user?.role_id) === 1 || Number(user?.role_id) === 7) return true;
        return permissions.includes(permission);
    };
    const [expert, setExpert] = useState(null);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        async function loadExpert() {
            try {
                const [expertRes, branchesRes] = await Promise.all([
                    fetch(`/api/experts/${params.id}`),
                    fetch("/api/branch"),
                ]);
                const expertJson = await expertRes.json();
                const branchesJson = await branchesRes.json();

                if (!expertRes.ok) throw new Error(expertJson.message || "Unable to load expert.");
                if (!branchesRes.ok) throw new Error(branchesJson.message || "Unable to load branches.");

                setExpert(expertJson.data);
                setBranches(branchesJson.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadExpert();
    }, [params.id]);

    const handleDelete = async () => {
        if (!confirm("Delete this expert?")) return;

        setDeleting(true);
        setError(null);

        try {
            const res = await fetch(`/api/experts/${params.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete expert.");
            router.push("/next_panel/experts");
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
                                <Link href="/next_panel/experts" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Experts
                                </Link>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <UserRoundCheck size={24} />
                                    <h1 className="h4 mb-0">{expert?.expert_name || "Expert Details"}</h1>
                                </div>
                                <p className="text-muted mb-0">View and manage this expert profile.</p>
                            </div>
                            <div className="d-flex gap-2">
                                {hasPermission("experts.edit") && <Link href={`/next_panel/experts/${params.id}/edit`} className="btn btn-primary">
                                    <Edit size={16} className="me-2" /> Edit
                                </Link>}
                                {hasPermission("experts.delete") && <button className="btn btn-outline-danger" onClick={handleDelete} disabled={deleting}>
                                    <Trash2 size={16} className="me-2" /> {deleting ? "Deleting..." : "Delete"}
                                </button>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading expert details...</div>
                        ) : error ? (
                            <div className="alert alert-danger">{error}</div>
                        ) : (
                            <div className="row gy-4">
                                <div className="col-md-4 text-center">
                                    <img
                                        src={expert.profile_image || "/images/cst_white.png"}
                                        alt={expert.expert_name}
                                        className="img-fluid rounded-circle border mb-3"
                                        style={{ width: 170, height: 170, objectFit: "cover" }}
                                    />
                                    <h2 className="h5 mb-1">{expert.expert_name}</h2>
                                    <p className="text-muted mb-2">{expert.designation}</p>
                                    <span className={`badge ${Number(expert.status) === 1 ? "bg-success" : "bg-secondary"}`}>
                                        {Number(expert.status) === 1 ? "Active" : "Inactive"}
                                    </span>
                                </div>

                                <div className="col-md-8">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <h3 className="h6 mb-1">Branch</h3>
                                            <p className="mb-0 text-muted">{getBranchName(branches, expert.branch_id) || `Branch #${expert.branch_id || "N/A"}`}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <h3 className="h6 mb-1">ID</h3>
                                            <p className="mb-0 text-muted">{expert.id}</p>
                                        </div>
                                        <div className="col-12">
                                            <h3 className="h6 mb-1">About</h3>
                                            <p className="mb-0 text-muted" dangerouslySetInnerHTML={{ __html: expert.about || "Not provided" }}></p>
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
