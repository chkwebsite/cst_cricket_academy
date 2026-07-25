"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import AcademyFeeForm, { getEmptyFee, normalizeFeePayload } from "../../AcademyFeeForm";

export default function EditAcademyFeePage() {
    const [values, setValues] = useState(getEmptyFee());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        async function loadFee() {
            try {
                const res = await fetch(`/api/academy-fees/${params.id}`);
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || "Unable to load fee.");
                const fee = json.data;
                setValues({
                    enrollment_id: fee.enrollment_id ?? "",
                    invoice_no: fee.invoice_no || "",
                    fee_type: fee.fee_type || "Monthly",
                    fee_period_start: fee.fee_period_start ? fee.fee_period_start.substring(0, 10) : "",
                    fee_period_end: fee.fee_period_end ? fee.fee_period_end.substring(0, 10) : "",
                    due_date: fee.due_date ? fee.due_date.substring(0, 10) : "",
                    amount: fee.amount ?? "",
                    discount: fee.discount ?? "",
                    tax_percent: fee.tax_percent ?? "",
                    tax_amount: fee.tax_amount ?? "",
                    late_fee: fee.late_fee ?? "",
                    total_amount: fee.total_amount ?? "",
                    paid_amount: fee.paid_amount ?? "0",
                    balance_amount: fee.balance_amount ?? "",
                    payment_status: fee.payment_status || "Pending",
                    remarks: fee.remarks || "",
                    status: fee.status ?? 1,
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadFee();
    }, [params.id]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!values.enrollment_id) {
            setError("Please select an enrollment.");
            return;
        }
        if (!values.invoice_no) {
            setError("Invoice number is required.");
            return;
        }
        if (!values.total_amount || Number(values.total_amount) <= 0) {
            setError("Total amount must be greater than zero.");
            return;
        }

        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const res = await fetch(`/api/academy-fees/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(normalizeFeePayload(values)),
            });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message || "Unable to update fee.");
            setSuccess(json.message || "Fee invoice updated successfully.");
            setTimeout(() => router.push(`/next_panel/academy-fees/${params.id}`), 500);
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
                                <Link href="/next_panel/academy-fees" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Academy Fees
                                </Link>
                                <h1 className="h4 mb-2">Edit Fee Invoice</h1>
                                <p className="text-muted mb-0">Update amounts, dates, and payment status.</p>
                            </div>
                            <button className="btn btn-primary" type="submit" form="academyFeeEditForm" disabled={saving || loading}>
                                <Save size={16} className="me-2" /> {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading fee details...</div>
                        ) : (
                            <>
                                <AcademyFeeForm
                                    formId="academyFeeEditForm"
                                    values={values}
                                    onChange={setValues}
                                    onSubmit={handleSubmit}
                                    error={error}
                                    loading={saving}
                                />
                                {success && <div className="alert alert-success mt-3 mb-0">{success}</div>}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

