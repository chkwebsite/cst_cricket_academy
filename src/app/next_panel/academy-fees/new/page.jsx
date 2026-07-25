"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import AcademyFeeForm, { getEmptyFee, normalizeFeePayload } from "../AcademyFeeForm";

export default function NewAcademyFeePage() {
    const [values, setValues] = useState(getEmptyFee());
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const router = useRouter();

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!values.enrollment_id) {
            setError("Please select an enrollment.");
            return;
        }
        if (!values.invoice_no) {
            setError("Invoice number is still generating. Please try again in a moment.");
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
            const res = await fetch("/api/academy-fees", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(normalizeFeePayload(values)),
            });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message || "Unable to create fee invoice.");
            setSuccess(json.message || "Fee invoice created successfully.");
            setTimeout(() => router.push("/next_panel/academy-fees"), 500);
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
                                <h1 className="h4 mb-2">Create Fee Invoice</h1>
                                <p className="text-muted mb-0">Raise a new fee invoice against an enrollment.</p>
                            </div>
                            <button className="btn btn-primary" type="submit" form="academyFeeForm" disabled={saving || !values.invoice_no}>
                                <Plus size={16} className="me-2" /> {saving ? "Saving..." : "Save Invoice"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        <AcademyFeeForm
                            formId="academyFeeForm"
                            values={values}
                            onChange={setValues}
                            onSubmit={handleSubmit}
                            error={error}
                            autoGenerateInvoice
                            loading={saving}
                        />
                        {success && <div className="alert alert-success mt-3 mb-0">{success}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}
