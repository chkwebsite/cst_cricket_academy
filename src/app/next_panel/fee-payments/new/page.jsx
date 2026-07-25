"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";
import FeePaymentForm, { getEmptyPayment, normalizePaymentPayload } from "../FeePaymentForm";

export default function NewFeePaymentPage() {
    const { user: userInfo } = useAuth();
    const [values, setValues] = useState(getEmptyPayment());
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const res = await fetch("/api/fee-payments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...normalizePaymentPayload(values),
                    created_by: userInfo?.id,
                }),
            });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message || "Unable to record payment.");
            router.push("/next_panel/fee-payments");
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
                                <h1 className="h4 mb-2">Record Payment</h1>
                                <p className="text-muted mb-0">Record a payment received against a fee invoice.</p>
                            </div>
                            <button className="btn btn-primary" type="submit" form="feePaymentForm" disabled={saving}>
                                <Plus size={16} className="me-2" /> {saving ? "Saving..." : "Save Payment"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        <FeePaymentForm
                            formId="feePaymentForm"
                            values={values}
                            onChange={setValues}
                            onSubmit={handleSubmit}
                            error={error}
                            loading={saving}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
