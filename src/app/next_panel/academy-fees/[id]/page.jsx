"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Receipt, Trash2 } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";

const fields = [
    ["Fee Type", "fee_type"],
    ["Fee Period Start", "fee_period_start"],
    ["Fee Period End", "fee_period_end"],
    ["Due Date", "due_date"],
    ["Amount", "amount"],
    ["Discount", "discount"],
    ["Tax %", "tax_percent"],
    ["Tax Amount", "tax_amount"],
    ["Late Fee", "late_fee"],
    ["Total Amount", "total_amount"],
    ["Paid Amount", "paid_amount"],
    ["Balance Amount", "balance_amount"],
    ["Remarks", "remarks"],
];

export default function AcademyFeeDetailPage() {
    const { user: userInfo } = useAuth();
    const [fee, setFee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);
    const params = useParams();
    const router = useRouter();
    const canEdit = userInfo?.permissions?.includes("academy-fees.edit") ?? true;
    const canDelete = userInfo?.permissions?.includes("academy-fees.delete") ?? true;

    useEffect(() => {
        async function loadFee() {
            try {
                const res = await fetch(`/api/academy-fees/${params.id}`);
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || "Unable to load fee.");
                setFee(json.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadFee();
    }, [params.id]);

    const handleDelete = async () => {
        if (!confirm("Delete this fee invoice?")) return;

        setDeleting(true);
        setError(null);

        try {
            const res = await fetch(`/api/academy-fees/${params.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete fee.");
            router.push("/next_panel/academy-fees");
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
                                <Link href="/next_panel/academy-fees" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Academy Fees
                                </Link>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <Receipt size={24} />
                                    <h1 className="h4 mb-0">{fee?.invoice_no || "Fee Details"}</h1>
                                </div>
                                <p className="text-muted mb-0">View and manage this fee invoice.</p>
                            </div>
                            <div className="d-flex gap-2">
                                {canEdit && (
                                    <Link href={`/next_panel/academy-fees/${params.id}/edit`} className="btn btn-primary">
                                        <Edit size={16} className="me-2" /> Edit
                                    </Link>
                                )}
                                {canDelete && (
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
                            <div className="text-center py-5 text-muted">Loading fee details...</div>
                        ) : error ? (
                            <div className="alert alert-danger">{error}</div>
                        ) : (
                            <div className="row gy-4">
                                <div className="col-12">
                                    <div className="d-flex align-items-center gap-2">
                                        <span className={`badge ${fee.payment_status === "Paid" ? "bg-success" : fee.payment_status === "Partial" ? "bg-warning text-dark" : "bg-secondary"}`}>
                                            {fee.payment_status}
                                        </span>
                                        <span className={`badge ${fee.status === 1 ? "bg-success" : "bg-secondary"}`}>
                                            {fee.status === 1 ? "Active" : "Inactive"}
                                        </span>
                                        <span className="text-muted small">ID: {fee.id}</span>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <h2 className="h6 mb-1">Student</h2>
                                    <p className="mb-0 text-muted">{fee.student_name || "Not provided"}</p>
                                </div>

                                <div className="col-md-6">
                                    <h2 className="h6 mb-1">Enrollment No</h2>
                                    <p className="mb-0 text-muted">{fee.enrollment_no || "Not provided"}</p>
                                </div>

                                {fields.map(([label, key]) => (
                                    <div className="col-md-6" key={key}>
                                        <h2 className="h6 mb-1">{label}</h2>
                                        <p className="mb-0 text-muted">{fee[key] || "Not provided"}</p>
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
