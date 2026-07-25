"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CreditCard, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";

const fields = [
    ["Payment Date", "payment_date"],
    ["Paid Amount", "paid_amount"],
    ["Payment Mode", "payment_mode"],
    ["Transaction ID", "transaction_id"],
    ["Bank Name", "bank_name"],
    ["Cheque No", "cheque_no"],
    ["Cheque Date", "cheque_date"],
    ["Remarks", "remarks"],
];

export default function FeePaymentDetailPage() {
    const { user: userInfo } = useAuth();
    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        async function loadPayment() {
            try {
                const res = await fetch(`/api/fee-payments/${params.id}`);
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || "Unable to load payment.");
                setPayment(json.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadPayment();
    }, [params.id]);

    const handleDelete = async () => {
        if (!confirm("Delete this payment?")) return;

        setDeleting(true);
        setError(null);

        try {
            const res = await fetch(`/api/fee-payments/${params.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete payment.");
            router.push("/next_panel/fee-payments");
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
                                <Link href="/next_panel/fee-payments" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Fee Payments
                                </Link>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <CreditCard size={24} />
                                    <h1 className="h4 mb-0">{payment?.receipt_no || "Payment Details"}</h1>
                                </div>
                                <p className="text-muted mb-0">View and manage this payment record.</p>
                            </div>
                            <div className="d-flex gap-2">
                                {userInfo.permissions.includes("fee-payments.edit") && (
                                    <Link href={`/next_panel/fee-payments/${params.id}/edit`} className="btn btn-primary">
                                        <Edit size={16} className="me-2" /> Edit
                                    </Link>
                                )}
                                {userInfo.permissions.includes("fee-payments.delete") && (
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
                            <div className="text-center py-5 text-muted">Loading payment details...</div>
                        ) : error ? (
                            <div className="alert alert-danger">{error}</div>
                        ) : (
                            <div className="row gy-4">
                                <div className="col-12">
                                    <div className="d-flex align-items-center gap-2">
                                        <span className={`badge ${payment.payment_status === "Paid" ? "bg-success" : payment.payment_status === "Refunded" ? "bg-info text-dark" : "bg-danger"}`}>
                                            {payment.payment_status}
                                        </span>
                                        <span className="text-muted small">ID: {payment.id}</span>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <h2 className="h6 mb-1">Student</h2>
                                    <p className="mb-0 text-muted">{payment.student_name || "Not provided"}</p>
                                </div>

                                <div className="col-md-6">
                                    <h2 className="h6 mb-1">Invoice No</h2>
                                    <p className="mb-0 text-muted">{payment.invoice_no || "Not provided"}</p>
                                </div>

                                {fields.map(([label, key]) => (
                                    <div className="col-md-6" key={key}>
                                        <h2 className="h6 mb-1">{label}</h2>
                                        <p className="mb-0 text-muted">{payment[key] || "Not provided"}</p>
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
