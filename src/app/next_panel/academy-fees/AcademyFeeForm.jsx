"use client";

import { useEffect, useMemo, useState } from "react";

const emptyFee = {
    enrollment_id: "",
    invoice_no: "",
    fee_type: "Monthly",
    fee_period_start: "",
    fee_period_end: "",
    due_date: "",
    amount: "",
    discount: "",
    tax_percent: "",
    tax_amount: "",
    late_fee: "",
    total_amount: "",
    paid_amount: "0",
    balance_amount: "",
    payment_status: "Pending",
    remarks: "",
    status: 1,
};

export function getEmptyFee() {
    return { ...emptyFee };
}

const toNumberOrNull = (value) => (value === "" || value === null || value === undefined ? null : Number(value));

export function normalizeFeePayload(values) {
    return {
        enrollment_id: toNumberOrNull(values.enrollment_id),
        invoice_no: values.invoice_no.trim(),
        fee_type: values.fee_type,
        fee_period_start: values.fee_period_start || null,
        fee_period_end: values.fee_period_end || null,
        due_date: values.due_date || null,
        amount: toNumberOrNull(values.amount),
        discount: toNumberOrNull(values.discount) || 0,
        tax_percent: toNumberOrNull(values.tax_percent) || 0,
        tax_amount: toNumberOrNull(values.tax_amount) || 0,
        late_fee: toNumberOrNull(values.late_fee) || 0,
        total_amount: toNumberOrNull(values.total_amount),
        paid_amount: toNumberOrNull(values.paid_amount) || 0,
        balance_amount: toNumberOrNull(values.balance_amount),
        payment_status: values.payment_status,
        remarks: values.remarks.trim(),
        status: Number(values.status),
    };
}

const formatDateValue = (value) => (value ? String(value).substring(0, 10) : "");

async function fetchJson(url) {
    const res = await fetch(url);
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || `Unable to load ${url}`);
    return json;
}

// Recalculates tax, total and balance from the raw amount / discount / paid figures.
function recalculate(next) {
    const amount = Number(next.amount) || 0;
    const discount = Number(next.discount) || 0;
    const taxPercent = Number(next.tax_percent) || 0;
    const lateFee = Number(next.late_fee) || 0;
    const paid = Number(next.paid_amount) || 0;

    const taxable = Math.max(amount - discount, 0);
    const taxAmount = Number(((taxable * taxPercent) / 100).toFixed(2));
    const total = Number((taxable + taxAmount + lateFee).toFixed(2));
    const balance = Number((total - paid).toFixed(2));

    return {
        ...next,
        tax_amount: taxAmount.toString(),
        total_amount: total.toString(),
        balance_amount: balance.toString(),
    };
}

function applyEnrollmentDetails(values, enrollment) {
    const amount = enrollment ? (enrollment.total_fee ?? enrollment.final_fee ?? enrollment.fees ?? "") : "";
    const next = {
        ...values,
        enrollment_id: enrollment?.id ? String(enrollment.id) : "",
        amount: amount === null ? "" : String(amount),
        fee_type: enrollment?.fee_structure || values.fee_type || "Monthly",
        fee_period_start: formatDateValue(enrollment?.start_date),
        fee_period_end: formatDateValue(enrollment?.end_date),
        due_date: formatDateValue(enrollment?.next_due_date || enrollment?.start_date),
        discount: values.discount || "0",
        tax_percent: values.tax_percent || "0",
        late_fee: values.late_fee || "0",
        paid_amount: values.paid_amount || "0",
    };

    return recalculate(next);
}

export default function AcademyFeeForm({ formId, values, onChange, onSubmit, error, loading = false, autoGenerateInvoice = false }) {
    const [enrollments, setEnrollments] = useState([]);
    const [enrollmentsLoading, setEnrollmentsLoading] = useState(true);
    const [enrollmentsError, setEnrollmentsError] = useState(null);
    const [invoiceLoading, setInvoiceLoading] = useState(autoGenerateInvoice);

    useEffect(() => {
        let active = true;

        async function loadEnrollments() {
            setEnrollmentsLoading(true);
            setEnrollmentsError(null);

            try {
                const json = await fetchJson("/api/enroll-player-programs");
                if (active) setEnrollments(json.data || []);
            } catch (err) {
                if (active) setEnrollmentsError(err.message);
            } finally {
                if (active) setEnrollmentsLoading(false);
            }
        }

        loadEnrollments();

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (!autoGenerateInvoice || values.invoice_no) {
            return;
        }

        let active = true;

        async function loadInvoiceNo() {
            setInvoiceLoading(true);

            try {
                const json = await fetchJson("/api/academy-fees?next_invoice=1");
                if (active && json.invoice_no) {
                    onChange((current) => ({ ...current, invoice_no: json.invoice_no }));
                }
            } catch (err) {
                if (active) setEnrollmentsError(err.message);
            } finally {
                if (active) setInvoiceLoading(false);
            }
        }

        loadInvoiceNo();

        return () => {
            active = false;
        };
    }, [autoGenerateInvoice, onChange, values.invoice_no]);

    useEffect(() => {
        if (!values.enrollment_id || enrollmentsLoading) return;
        if (enrollments.some((enrollment) => String(enrollment.id) === String(values.enrollment_id))) return;

        let active = true;

        async function loadSelectedEnrollment() {
            try {
                const json = await fetchJson(`/api/enroll-player-programs/${values.enrollment_id}`);
                if (active && json.data) {
                    setEnrollments((current) => [json.data, ...current]);
                }
            } catch {
                // The form can still submit the stored enrollment id; this only hydrates read-only labels.
            }
        }

        loadSelectedEnrollment();

        return () => {
            active = false;
        };
    }, [enrollments, enrollmentsLoading, values.enrollment_id]);

    const selectedEnrollment = useMemo(() => {
        return enrollments.find((enrollment) => String(enrollment.id) === String(values.enrollment_id));
    }, [enrollments, values.enrollment_id]);

    const handleChange = (field) => (event) => {
        const value = field === "status" ? Number(event.target.value) : event.target.value;
        onChange({ ...values, [field]: value });
    };

    const handleEnrollmentChange = (event) => {
        const enrollment = enrollments.find((item) => String(item.id) === event.target.value);
        onChange(applyEnrollmentDetails(values, enrollment));
    };

    const handleRecalcField = (field) => (event) => {
        onChange(recalculate({ ...values, [field]: event.target.value }));
    };

    return (
        <form id={formId} onSubmit={onSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}
            {enrollmentsError && <div className="alert alert-warning">{enrollmentsError}</div>}

            <div className="row g-3">
                <div className="col-12">
                    <h2 className="h6 text-muted text-uppercase mb-0">Invoice</h2>
                    <hr className="mt-2" />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Enrollment</label>
                    <select
                        className="form-select"
                        value={values.enrollment_id}
                        onChange={handleEnrollmentChange}
                        required
                        disabled={loading || enrollmentsLoading}
                    >
                        <option value="">{enrollmentsLoading ? "Loading enrollments..." : "Select enrollment"}</option>
                        {enrollments.map((enrollment) => (
                            <option key={enrollment.id} value={enrollment.id}>
                                {enrollment.label || `${enrollment.enrollment_no || enrollment.id} - ${enrollment.player_name || enrollment.student_name || "Player"}`}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-md-4">
                    <label className="form-label">Invoice No</label>
                    <input
                        className="form-control"
                        value={invoiceLoading ? "Generating..." : values.invoice_no}
                        readOnly
                        required
                        disabled={loading || invoiceLoading}
                    />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Fee Type</label>
                    <select className="form-select" value={values.fee_type} onChange={handleChange("fee_type")} disabled={loading}>
                        <option value="Registration">Registration</option>
                        <option value="Admission">Admission</option>
                        <option value="Kit">Kit</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Half Yearly">Half Yearly</option>
                        <option value="Yearly">Yearly</option>
                        <option value="Tournament">Tournament</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                {selectedEnrollment && (
                    <>
                        <div className="col-12 mt-4">
                            <h2 className="h6 text-muted text-uppercase mb-0">Enrollment Details</h2>
                            <hr className="mt-2" />
                        </div>

                        <div className="col-md-4">
                            <label className="form-label">Player Name</label>
                            <input className="form-control" value={selectedEnrollment.player_name || selectedEnrollment.student_name || ""} readOnly disabled />
                        </div>

                        <div className="col-md-4">
                            <label className="form-label">Program</label>
                            <input className="form-control" value={selectedEnrollment.program_name || ""} readOnly disabled />
                        </div>

                        <div className="col-md-4">
                            <label className="form-label">Branch</label>
                            <input className="form-control" value={selectedEnrollment.branch_name || ""} readOnly disabled />
                        </div>

                        <div className="col-md-4">
                            <label className="form-label">Batch</label>
                            <input className="form-control" value={selectedEnrollment.batch_name || ""} readOnly disabled />
                        </div>

                        <div className="col-md-4">
                            <label className="form-label">Fee Structure</label>
                            <input className="form-control" value={selectedEnrollment.fee_structure || ""} readOnly disabled />
                        </div>

                        <div className="col-md-4">
                            <label className="form-label">Admission Date</label>
                            <input className="form-control" value={formatDateValue(selectedEnrollment.admission_date)} readOnly disabled />
                        </div>

                        <div className="col-md-4">
                            <label className="form-label">Start Date</label>
                            <input className="form-control" value={formatDateValue(selectedEnrollment.start_date)} readOnly disabled />
                        </div>

                        <div className="col-md-4">
                            <label className="form-label">End Date</label>
                            <input className="form-control" value={formatDateValue(selectedEnrollment.end_date)} readOnly disabled />
                        </div>

                        <div className="col-md-4">
                            <label className="form-label">Default Fee Amount</label>
                            <input className="form-control" value={selectedEnrollment.total_fee ?? selectedEnrollment.final_fee ?? selectedEnrollment.fees ?? ""} readOnly disabled />
                        </div>
                    </>
                )}

                <div className="col-md-4">
                    <label className="form-label">Fee Period Start</label>
                    <input type="date" className="form-control" value={values.fee_period_start} onChange={handleChange("fee_period_start")} disabled={loading} />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Fee Period End</label>
                    <input type="date" className="form-control" value={values.fee_period_end} onChange={handleChange("fee_period_end")} disabled={loading} />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Due Date</label>
                    <input type="date" className="form-control" value={values.due_date} onChange={handleChange("due_date")} disabled={loading} />
                </div>

                <div className="col-12 mt-4">
                    <div className="d-flex justify-content-between align-items-center">
                        <h2 className="h6 text-muted text-uppercase mb-0">Amount Breakdown</h2>
                        <span className="badge bg-light text-dark border">Tax, total &amp; balance auto-calculate</span>
                    </div>
                    <hr className="mt-2" />
                </div>

                <div className="col-md-3">
                    <label className="form-label">Amount</label>
                    <input type="number" step="0.01" className="form-control" value={values.amount} onChange={handleRecalcField("amount")} required disabled={loading} />
                </div>

                <div className="col-md-3">
                    <label className="form-label">Discount</label>
                    <input type="number" step="0.01" className="form-control" value={values.discount} onChange={handleRecalcField("discount")} disabled={loading} />
                </div>

                <div className="col-md-3">
                    <label className="form-label">Tax %</label>
                    <input type="number" step="0.01" className="form-control" value={values.tax_percent} onChange={handleRecalcField("tax_percent")} disabled={loading} />
                </div>

                <div className="col-md-3">
                    <label className="form-label">Late Fee</label>
                    <input type="number" step="0.01" className="form-control" value={values.late_fee} onChange={handleRecalcField("late_fee")} disabled={loading} />
                </div>

                <div className="col-md-3">
                    <label className="form-label">Tax Amount</label>
                    <input type="number" step="0.01" className="form-control" value={values.tax_amount} onChange={handleChange("tax_amount")} disabled={loading} />
                </div>

                <div className="col-md-3">
                    <label className="form-label">Total Amount</label>
                    <input type="number" step="0.01" className="form-control" value={values.total_amount} onChange={handleChange("total_amount")} disabled={loading} />
                </div>

                <div className="col-md-3">
                    <label className="form-label">Paid Amount</label>
                    <input type="number" step="0.01" className="form-control" value={values.paid_amount} onChange={handleRecalcField("paid_amount")} disabled={loading} />
                </div>

                <div className="col-md-3">
                    <label className="form-label">Balance Amount</label>
                    <input type="number" step="0.01" className="form-control" value={values.balance_amount} onChange={handleChange("balance_amount")} disabled={loading} />
                </div>

                <div className="col-12 mt-4">
                    <h2 className="h6 text-muted text-uppercase mb-0">Status</h2>
                    <hr className="mt-2" />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Payment Status</label>
                    <select className="form-select" value={values.payment_status} onChange={handleChange("payment_status")} disabled={loading}>
                        <option value="Pending">Pending</option>
                        <option value="Partial">Partial</option>
                        <option value="Paid">Paid</option>
                    </select>
                </div>

                <div className="col-md-4">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={values.status} onChange={handleChange("status")} disabled={loading}>
                        <option value={1}>Active</option>
                        <option value={0}>Inactive</option>
                    </select>
                </div>

                <div className="col-12">
                    <label className="form-label">Remarks</label>
                    <textarea className="form-control" rows={3} value={values.remarks} onChange={handleChange("remarks")} disabled={loading} />
                </div>
            </div>
        </form>
    );
}
