"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CreditCard, Edit, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";

export default function FeePaymentPage() {
    const { user: userInfo } = useAuth();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState("all");
    const [selectedInvoice, setSelectedInvoice] = useState("all");
    const [selectedMonth, setSelectedMonth] = useState("all");

    const loadPayments = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/fee-payments");
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to load payments.");
            setPayments(json.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadPayments();
    }, []);

    const handleDelete = async (payment) => {
        if (!confirm(`Delete payment "${payment.receipt_no}"?`)) return;

        setDeletingId(payment.id);
        setError(null);

        try {
            const res = await fetch(`/api/fee-payments/${payment.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete payment.");
            setPayments((current) => current.filter((item) => item.id !== payment.id));
        } catch (err) {
            setError(err.message);
        } finally {
            setDeletingId(null);
        }
    };

    const statusBadge = (status) => {
        const map = {
            Paid: "bg-success",
            Failed: "bg-danger",
            Refunded: "bg-info text-dark",
        };
        return map[status] || "bg-secondary";
    };

    const studentOptions = useMemo(() => {
        const map = new Map();
        payments.forEach((payment) => {
            if (payment.student_id) {
                map.set(String(payment.student_id), payment.student_name || `Student #${payment.student_id}`);
            }
        });
        return Array.from(map, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
    }, [payments]);

    const invoiceOptions = useMemo(() => {
        const map = new Map();
        payments.forEach((payment) => {
            if (selectedStudent !== "all" && String(payment.student_id) !== selectedStudent) return;
            const invoiceId = payment.invoice_id || payment.academy_fee_id;
            if (invoiceId) {
                map.set(String(invoiceId), payment.invoice_no || `Invoice #${invoiceId}`);
            }
        });
        return Array.from(map, ([id, label]) => ({ id, label })).sort((a, b) => a.label.localeCompare(b.label));
    }, [payments, selectedStudent]);

    const monthOptions = useMemo(() => {
        const map = new Map();
        payments.forEach((payment) => {
            if (selectedStudent !== "all" && String(payment.student_id) !== selectedStudent) return;
            const invoiceId = String(payment.invoice_id || payment.academy_fee_id || "");
            if (selectedInvoice !== "all" && invoiceId !== selectedInvoice) return;
            if (payment.fee_month) {
                map.set(payment.fee_month, payment.fee_month_label || payment.fee_month);
            }
        });
        return Array.from(map, ([value, label]) => ({ value, label })).sort((a, b) => b.value.localeCompare(a.value));
    }, [payments, selectedStudent, selectedInvoice]);

    // Student badalne par purani invoice/month selection reset karein agar wo naye student par valid na ho
    useEffect(() => {
        if (selectedInvoice !== "all" && !invoiceOptions.some((invoice) => invoice.id === selectedInvoice)) {
            setSelectedInvoice("all");
        }
    }, [invoiceOptions, selectedInvoice]);

    useEffect(() => {
        if (selectedMonth !== "all" && !monthOptions.some((month) => month.value === selectedMonth)) {
            setSelectedMonth("all");
        }
    }, [monthOptions, selectedMonth]);

    const filteredPayments = useMemo(() => {
        return payments.filter((payment) => {
            const invoiceId = String(payment.invoice_id || payment.academy_fee_id || "");
            const studentMatches = selectedStudent === "all" || String(payment.student_id) === selectedStudent;
            const invoiceMatches = selectedInvoice === "all" || invoiceId === selectedInvoice;
            const monthMatches = selectedMonth === "all" || payment.fee_month === selectedMonth;
            return studentMatches && invoiceMatches && monthMatches;
        });
    }, [payments, selectedInvoice, selectedMonth, selectedStudent]);

    const canCreate = userInfo?.permissions?.includes("fee-payments.create") ?? true;
    const canEdit = userInfo?.permissions?.includes("fee-payments.edit") ?? true;
    const canDelete = userInfo?.permissions?.includes("fee-payments.delete") ?? true;

    return (
        <div className="container-fluid">
            <div className="row g-4">
                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                            <div>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <CreditCard size={24} />
                                    <h1 className="h4 mb-0">Fee Payments</h1>
                                </div>
                                <p className="text-muted mb-0">Track payments received against fee invoices.</p>
                            </div>

                            {userInfo.permissions.includes("fee-payments.create") && (
                                <Link href="/next_panel/fee-payments/new" className="btn btn-primary fw-semibold">
                                    <Plus size={16} className="me-2" /> New Payment
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-3 mb-4">
                        <div className="row g-3">
                            <div className="col-12 col-md-4">
                                <label className="form-label small text-muted mb-1">Student</label>
                                <select
                                    className="form-select"
                                    value={selectedStudent}
                                    onChange={(e) => setSelectedStudent(e.target.value)}
                                >
                                    <option value="all">All Students</option>
                                    {studentOptions.map((student) => (
                                        <option key={student.id} value={student.id}>
                                            {student.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-12 col-md-4">
                                <label className="form-label small text-muted mb-1">Invoice</label>
                                <select
                                    className="form-select"
                                    value={selectedInvoice}
                                    onChange={(e) => setSelectedInvoice(e.target.value)}
                                >
                                    <option value="all">All Invoices</option>
                                    {invoiceOptions.map((invoice) => (
                                        <option key={invoice.id} value={invoice.id}>
                                            {invoice.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-12 col-md-4">
                                <label className="form-label small text-muted mb-1">Payment Month</label>
                                <select
                                    className="form-select"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                >
                                    <option value="all">All Months</option>
                                    {monthOptions.map((month) => (
                                        <option key={month.value} value={month.value}>
                                            {month.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-4 shadow-sm p-3">
                        {error && <div className="alert alert-danger">{error}</div>}

                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading payments...</div>
                        ) : payments.length === 0 ? (
                            <div className="text-center py-5 text-muted">No payments found yet.</div>
                        ) : filteredPayments.length === 0 ? (
                            <div className="text-center py-5 text-muted">No payments match the selected filters.</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th scope="col">Receipt No</th>
                                            <th scope="col">Student</th>
                                            <th scope="col">Invoice</th>
                                            <th scope="col">Payment Date</th>
                                            <th scope="col">Amount</th>
                                            <th scope="col">Mode</th>
                                            <th scope="col">Status</th>
                                            <th scope="col" className="text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPayments.map((payment) => (
                                            <tr key={payment.id}>
                                                <td className="fw-semibold">{payment.receipt_no}</td>
                                                <td>
                                                    <div>{payment.student_name || "—"}</div>
                                                    <small className="text-muted">{payment.enrollment_no}</small>
                                                </td>
                                                <td>{payment.invoice_no || "—"}</td>
                                                <td>{payment.payment_date ? payment.payment_date.substring(0, 10) : "—"}</td>
                                                <td>{payment.paid_amount}</td>
                                                <td>{payment.payment_mode}</td>
                                                <td>
                                                    <span className={`badge ${statusBadge(payment.payment_status)}`}>
                                                        {payment.payment_status || "Unknown"}
                                                    </span>
                                                </td>
                                                <td className="text-end">
                                                    <div className="btn-group btn-group-sm" role="group">
                                                        <Link href={`/next_panel/fee-payments/${payment.id}`} className="btn btn-outline-primary" aria-label="View payment">
                                                            <ArrowUpRight size={16} />
                                                        </Link>
                                                        {userInfo.permissions.includes("fee-payments.edit") && (
                                                            <Link href={`/next_panel/fee-payments/${payment.id}/edit`} className="btn btn-outline-secondary" aria-label="Edit payment">
                                                                <Edit size={16} />
                                                            </Link>
                                                        )}
                                                        {userInfo.permissions.includes("fee-payments.delete") && (
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-danger"
                                                                onClick={() => handleDelete(payment)}
                                                                disabled={deletingId === payment.id}
                                                                aria-label="Delete payment"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
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