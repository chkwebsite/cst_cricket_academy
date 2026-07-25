"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2, UserRoundCheck } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";


const fields = [
    ["Title", "title"],
    ["Designation", "designation"],
    ["Sub Designation", "sub_designation"],
    ["Experience", "experience"],
    ["Qualification", "qualification"],
    ["Display Order", "display_order"],
];

export default function CoFounderDetailPage() {
    const { user } = useAuth();
    const [coFounder, setCoFounder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        async function loadCoFounder() {
            try {
                const res = await fetch(`/api/co-founders/${params.id}`);
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || "Unable to load co-founder.");
                setCoFounder(json.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadCoFounder();
    }, [params.id]);

    const handleDelete = async () => {
        if (!confirm("Delete this co-founder?")) return;

        setDeleting(true);
        setError(null);

        try {
            const res = await fetch(`/api/co-founders/${params.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete co-founder.");
            router.push("/next_panel/co-founders");
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
                                <Link href="/next_panel/co-founders" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Co-Founders
                                </Link>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <UserRoundCheck size={24} />
                                    <h1 className="h4 mb-0">{coFounder?.name || "Co-Founder Details"}</h1>
                                </div>
                                <p className="text-muted mb-0">View and manage this leadership profile.</p>
                            </div>
                            <div className="d-flex gap-2">
                                {user.permissions.includes("co_founders.edit") && <Link href={`/next_panel/co-founders/${params.id}/edit`} className="btn btn-primary">
                                    <Edit size={16} className="me-2" /> Edit
                                </Link>}
                                {user.permissions.includes("co_founders.delete") && <button className="btn btn-outline-danger" onClick={handleDelete} disabled={deleting}>
                                    <Trash2 size={16} className="me-2" /> {deleting ? "Deleting..." : "Delete"}
                                </button>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading co-founder details...</div>
                        ) : error ? (
                            <div className="alert alert-danger">{error}</div>
                        ) : (
                            <div className="row gy-4">
                                <div className="col-md-4 text-center">
                                    <img
                                        src={coFounder.profile_image || "/images/cst_white.png"}
                                        alt={coFounder.name}
                                        className="img-fluid rounded-circle border mb-3"
                                        style={{ width: 170, height: 170, objectFit: "cover" }}
                                    />
                                    <h2 className="h5 mb-1">{[coFounder.title, coFounder.name].filter(Boolean).join(" ")}</h2>
                                    <p className="text-muted mb-2">{coFounder.designation}</p>
                                    <span className={`badge ${coFounder.status === 1 ? "bg-success" : "bg-secondary"}`}>
                                        {coFounder.status === 1 ? "Active" : "Inactive"}
                                    </span>
                                </div>

                                <div className="col-md-8">
                                    <div className="row g-3">
                                        {fields.map(([label, key]) => (
                                            <div className="col-md-6" key={key}>
                                                <h3 className="h6 mb-1">{label}</h3>
                                                <p className="mb-0 text-muted">{coFounder[key] || "Not provided"}</p>
                                            </div>
                                        ))}

                                        <div className="col-12">
                                            <h3 className="h6 mb-1">Description</h3>
                                            <p className="mb-0 text-muted"
                                                dangerouslySetInnerHTML={{ __html: coFounder.description }}></p>
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

