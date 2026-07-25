"use client";

import { useEffect, useState } from "react";

const emptyPayment = {
    academy_fee_id: "",
    receipt_no: "",
    payment_date: "",
    paid_amount: "",
    payment_mode: "Cash",
    transaction_id: "",
    bank_name: "",
    cheque_no: "",
    cheque_date: "",
    payment_status: "Paid",
    remarks: "",
};

export function getEmptyPayment() {
    return { ...emptyPayment };
}

const toNumberOrNull = (value) => (value === "" || value === null || value === undefined ? null : Number(value));

export function normalizePaymentPayload(values) {
    return {
        academy_fee_id: toNumberOrNull(values.academy_fee_id),
        receipt_no: values.receipt_no.trim(),
        payment_date: values.payment_date || null,
        paid_amount: toNumberOrNull(values.paid_amount),
        payment_mode: values.payment_mode,
        transaction_id: values.transaction_id.trim(),
        bank_name: values.bank_name.trim(),
        cheque_no: values.cheque_no.trim(),
        cheque_date: values.cheque_date || null,
        payment_status: values.payment_status,
        remarks: values.remarks.trim(),
    };
}

export default function FeePaymentForm({ formId, values, onChange, onSubmit, error, loading = false }) {
    const [invoices, setInvoices] = useState([]);
    const [invoicesLoading, setInvoicesLoading] = useState(true);

    useEffect(() => {
        async function loadInvoices() {
            try {
                const res = await fetch("/api/academy-fees");
                const json = await res.json();
                if (res.ok) setInvoices(json.data || []);
            } catch {
                // Non-blocking: fall back to manual entry if the invoice list can't be loaded.
            } finally {
                setInvoicesLoading(false);
            }
        }

        loadInvoices();
    }, []);

    const handleChange = (field) => (event) => {
        onChange({ ...values, [field]: event.target.value });
    };

    const showBankFields = ["Cheque", "Bank Transfer"].includes(values.payment_mode);
    const showTransactionField = ["Bank Transfer", "UPI", "Card"].includes(values.payment_mode);

    return (
        <form id={formId} onSubmit={onSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="row g-3">
                <div className="col-12">
                    <h2 className="h6 text-muted text-uppercase mb-0">Payment Against</h2>
                    <hr className="mt-2" />
                </div>

                <div className="col-md-6">
                    <label className="form-label">Fee Invoice</label>
                    {invoicesLoading ? (
                        <input className="form-control" value="Loading invoices..." disabled />
                    ) : invoices.length > 0 ? (
                        <select className="form-select" value={values.academy_fee_id} onChange={handleChange("academy_fee_id")} required disabled={loading}>
                            <option value="">Select an invoice</option>
                            {invoices.map((invoice) => (
                                <option key={invoice.id} value={invoice.id}>
                                    {invoice.invoice_no} — {invoice.student_name || "Unknown"} (Balance: {invoice.balance_amount})
                                </option>
                            ))}
                        </select>
                    ) : (
                        <input
                            type="number"
                            className="form-control"
                            value={values.academy_fee_id}
                            onChange={handleChange("academy_fee_id")}
                            placeholder="Fee Invoice ID"
                            required
                            disabled={loading}
                        />
                    )}
                </div>

                <div className="col-md-6">
                    <label className="form-label">Receipt No</label>
                    <input
                        className="form-control"
                        value={values.receipt_no}
                        onChange={handleChange("receipt_no")}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="col-12 mt-4">
                    <h2 className="h6 text-muted text-uppercase mb-0">Payment Details</h2>
                    <hr className="mt-2" />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Payment Date</label>
                    <input type="date" className="form-control" value={values.payment_date} onChange={handleChange("payment_date")} required disabled={loading} />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Paid Amount</label>
                    <input type="number" step="0.01" className="form-control" value={values.paid_amount} onChange={handleChange("paid_amount")} required disabled={loading} />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Payment Mode</label>
                    <select className="form-select" value={values.payment_mode} onChange={handleChange("payment_mode")} disabled={loading}>
                        <option value="Cash">Cash</option>
                        <option value="Cheque">Cheque</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="UPI">UPI</option>
                        <option value="Card">Card</option>
                    </select>
                </div>

                {showTransactionField && (
                    <div className="col-md-6">
                        <label className="form-label">Transaction ID</label>
                        <input className="form-control" value={values.transaction_id} onChange={handleChange("transaction_id")} disabled={loading} />
                    </div>
                )}

                {showBankFields && (
                    <>
                        <div className="col-md-6">
                            <label className="form-label">Bank Name</label>
                            <input className="form-control" value={values.bank_name} onChange={handleChange("bank_name")} disabled={loading} />
                        </div>

                        {values.payment_mode === "Cheque" && (
                            <>
                                <div className="col-md-6">
                                    <label className="form-label">Cheque No</label>
                                    <input className="form-control" value={values.cheque_no} onChange={handleChange("cheque_no")} disabled={loading} />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Cheque Date</label>
                                    <input type="date" className="form-control" value={values.cheque_date} onChange={handleChange("cheque_date")} disabled={loading} />
                                </div>
                            </>
                        )}
                    </>
                )}

                <div className="col-md-4">
                    <label className="form-label">Payment Status</label>
                    <select className="form-select" value={values.payment_status} onChange={handleChange("payment_status")} disabled={loading}>
                        <option value="Paid">Paid</option>
                        <option value="Failed">Failed</option>
                        <option value="Refunded">Refunded</option>
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
