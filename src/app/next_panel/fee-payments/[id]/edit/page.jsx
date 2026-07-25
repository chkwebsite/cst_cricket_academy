"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import FeePaymentForm, { getEmptyPayment, normalizePaymentPayload } from "../../FeePaymentForm";

export default function EditFeePaymentPage() {
    const [values, setValues] = useState(getEmptyPayment());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        async function loadPayment() {
            try {
                const res = await fetch(`/api/fee-payments/${params.id}`);
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || "Unable to load payment.");
                const payment = json.data;
                setValues({
                    academy_fee_id: payment.academy_fee_id ?? "",
                    receipt_no: payment.receipt_no || "",
                    payment_date: payment.payment_date ? payment.payment_date.substring(0, 10) : "",
                    paid_amount: payment.paid_amount ?? "",
                    payment_mode: payment.payment_mode || "Cash",
                    transaction_id: payment.transaction_id || "",
                    bank_name: payment.bank_name || "",
                    cheque_no: payment.cheque_no || "",
                    cheque_date: payment.cheque_date ? payment.cheque_date.substring(0, 10) : "",
                    payment_status: payment.payment_status || "Paid",
                    remarks: payment.remarks || "",
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadPayment();
    }, [params.id]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const res = await fetch(`/api/fee-payments/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(normalizePaymentPayload(values)),
            });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message || "Unable to update payment.");
            router.push(`/next_panel/fee-payments/${params.id}`);
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
                                <Link href="/next_panel/fee-payments" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Fee Payments
                                </Link>
                                <h1 className="h4 mb-2">Edit Payment</h1>
                                <p className="text-muted mb-0">Update payment details and status.</p>
                            </div>
                            <button className="btn btn-primary" type="submit" form="feePaymentEditForm" disabled={saving || loading}>
                                <Save size={16} className="me-2" /> {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading payment details...</div>
                        ) : (
                            <FeePaymentForm
                                formId="feePaymentEditForm"
                                values={values}
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

