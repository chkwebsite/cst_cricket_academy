"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Edit, Plus, Trash2, UserRoundCheck } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";
import { getBranchName } from "./ExpertForm";

export default function ExpertsPage() {
    const { user } = useAuth();

    const [experts, setExperts] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadExperts() {
            try {
                const [expertsRes, branchesRes] = await Promise.all([
                    fetch("/api/experts"),
                    fetch("/api/branch"),
                ]);
                const expertsJson = await expertsRes.json();
                const branchesJson = await branchesRes.json();

                if (!expertsRes.ok) throw new Error(expertsJson.message || "Unable to load experts.");
                if (!branchesRes.ok) throw new Error(branchesJson.message || "Unable to load branches.");

                setExperts(expertsJson.data || []);
                setBranches(branchesJson.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadExperts();
    }, []);

    const handleDelete = async (expert) => {
        if (!confirm(`Delete expert "${expert.expert_name}"?`)) return;

        setDeletingId(expert.id);
        setError(null);

        try {
            const res = await fetch(`/api/experts/${expert.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete expert.");
            setExperts((current) => current.filter((item) => item.id !== expert.id));
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
                                    <UserRoundCheck size={24} />
                                    <h1 className="h4 mb-0">Experts</h1>
                                </div>
                                <p className="text-muted mb-0">Manage expert profiles and branch assignments.</p>
                            </div>
                            <Link href="/next_panel/experts/new" className="btn btn-primary fw-semibold">
                                <Plus size={16} className="me-2" /> New Expert
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-3">
                        {error && <div className="alert alert-danger">{error}</div>}

                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading experts...</div>
                        ) : experts.length === 0 ? (
                            <div className="text-center py-5 text-muted">No experts found yet.</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th scope="col">Expert</th>
                                            <th scope="col">Designation</th>
                                            <th scope="col">Branch</th>
                                            <th scope="col">Status</th>
                                            <th scope="col" className="text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {experts.map((expert) => (
                                            <tr key={expert.id}>
                                                <td>
                                                    <div className="d-flex align-items-center gap-3">
                                                        <img
                                                            src={expert.profile_image || "/images/cst_white.png"}
                                                            alt={expert.expert_name}
                                                            className="rounded-circle border"
                                                            width="48"
                                                            height="48"
                                                            style={{ objectFit: "cover" }}
                                                        />
                                                        <div>
                                                            <div className="fw-semibold">{expert.expert_name}</div>
                                                            <small className="text-muted">ID: {expert.id}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{expert.designation}</td>
                                                <td>{getBranchName(branches, expert.branch_id) || `Branch #${expert.branch_id || "N/A"}`}</td>
                                                <td>
                                                    <span className={`badge ${Number(expert.status) === 1 ? "bg-success" : "bg-secondary"}`}>
                                                        {Number(expert.status) === 1 ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td className="text-end">
                                                    <div className="btn-group btn-group-sm" role="group">
                                                        <Link href={`/next_panel/experts/${expert.id}`} className="btn btn-outline-primary" aria-label="View expert">
                                                            <ArrowUpRight size={16} />
                                                        </Link>
                                                        <Link href={`/next_panel/experts/${expert.id}/edit`} className="btn btn-outline-secondary" aria-label="Edit expert">
                                                            <Edit size={16} />
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-danger"
                                                            onClick={() => handleDelete(expert)}
                                                            disabled={deletingId === expert.id}
                                                            aria-label="Delete expert"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
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
