"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Edit, Plus, Receipt, Trash2 } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";

export default function AcademyFeePage() {
    const { user: userInfo } = useAuth();
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");

    const loadFees = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/academy-fees");
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to load fees.");
            setFees(json.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadFees();
    }, []);

    const handleDelete = async (fee) => {
        if (!confirm(`Delete invoice "${fee.invoice_no}"?`)) return;

        setDeletingId(fee.id);
        setError(null);

        try {
            const res = await fetch(`/api/academy-fees/${fee.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete fee.");
            setFees((current) => current.filter((item) => item.id !== fee.id));
        } catch (err) {
            setError(err.message);
        } finally {
            setDeletingId(null);
        }
    };

    const paymentBadge = (status) => {
        const map = {
            Paid: "bg-success",
            Partial: "bg-warning text-dark",
            Pending: "bg-secondary",
        };
        return map[status] || "bg-secondary";
    };

    const canCreate = userInfo?.permissions?.includes("academy-fees.create") ?? true;
    const canEdit = userInfo?.permissions?.includes("academy-fees.edit") ?? true;
    const canDelete = userInfo?.permissions?.includes("academy-fees.delete") ?? true;

    const formatMoney = (value) => {
        const amount = Number(value) || 0;
        return amount.toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2,
        });
    };

    const formatDate = (value) => (value ? value.substring(0, 10) : "-");

    const monthOptions = useMemo(() => {
        const months = new Map();
        fees.forEach((fee) => {
            if (fee.fee_month) months.set(fee.fee_month, fee.fee_month_label || fee.fee_month);
        });
        return Array.from(months, ([value, label]) => ({ value, label }));
    }, [fees]);

    const filteredFees = useMemo(() => {
        return fees.filter((fee) => {
            const monthMatches = selectedMonth === "all" || fee.fee_month === selectedMonth;
            const statusMatches = selectedStatus === "all" || fee.payment_status === selectedStatus;
            return monthMatches && statusMatches;
        });
    }, [fees, selectedMonth, selectedStatus]);

    const summary = useMemo(() => {
        return filteredFees.reduce((acc, fee) => {
            const status = fee.payment_status || "Pending";
            acc.total += Number(fee.total_amount) || 0;
            acc.paid += Number(fee.paid_amount) || 0;
            acc.balance += Number(fee.balance_amount) || 0;
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, { total: 0, paid: 0, balance: 0, Pending: 0, Partial: 0, Paid: 0 });
    }, [filteredFees]);

    return (
        <div className="container-fluid">
            <div className="row g-4">
                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                            <div>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <Receipt size={24} />
                                    <h1 className="h4 mb-0">Academy Fees</h1>
                                </div>
                                <p className="text-muted mb-0">Month-wise player fee status: pending, partial and paid.</p>
                            </div>

                            {canCreate && (
                                <Link href="/next_panel/academy-fees/new" className="btn btn-primary fw-semibold">
                                    <Plus size={16} className="me-2" /> New Fee Invoice
                                </Link>
                            )}
                            
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-3">
                        {error && <div className="alert alert-danger">{error}</div>}

                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading fees...</div>
                        ) : fees.length === 0 ? (
                            <div className="text-center py-5 text-muted">No fee invoices found yet.</div>
                        ) : (
                            <>
                                <div className="row g-3 mb-3">
                                    <div className="col-md-3">
                                        <div className="border rounded-3 p-3 h-100">
                                            <div className="text-muted small">Total Fees</div>
                                            <div className="fw-bold">{formatMoney(summary.total)}</div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="border rounded-3 p-3 h-100">
                                            <div className="text-muted small">Paid</div>
                                            <div className="fw-bold text-success">{formatMoney(summary.paid)}</div>
                                            <small className="text-muted">{summary.Paid} invoice(s)</small>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="border rounded-3 p-3 h-100">
                                            <div className="text-muted small">Pending Balance</div>
                                            <div className="fw-bold text-danger">{formatMoney(summary.balance)}</div>
                                            <small className="text-muted">{summary.Pending} pending, {summary.Partial} partial</small>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="border rounded-3 p-3 h-100">
                                            <div className="text-muted small">Showing</div>
                                            <div className="fw-bold">{filteredFees.length}</div>
                                            <small className="text-muted">fee invoice(s)</small>
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex flex-column flex-md-row gap-2 justify-content-between mb-3">
                                    <div className="d-flex flex-column flex-sm-row gap-2">
                                        <select className="form-select" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} aria-label="Filter by month">
                                            <option value="all">All Months</option>
                                            {monthOptions.map((month) => (
                                                <option key={month.value} value={month.value}>{month.label}</option>
                                            ))}
                                        </select>
                                        <select className="form-select" value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)} aria-label="Filter by payment status">
                                            <option value="all">All Status</option>
                                            <option value="Pending">Pending</option>
                                            <option value="Partial">Partial</option>
                                            <option value="Paid">Paid</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="table-responsive">
                                    <table className="table align-middle mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th scope="col">Month</th>
                                                <th scope="col">Player</th>
                                                <th scope="col">Invoice No</th>
                                                <th scope="col">Program</th>
                                                <th scope="col">Fee Period</th>
                                                <th scope="col">Due Date</th>
                                                <th scope="col">Total</th>
                                                <th scope="col">Paid</th>
                                                <th scope="col">Pending</th>
                                                <th scope="col">Status</th>
                                                <th scope="col" className="text-end">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredFees.map((fee) => (
                                                <tr key={fee.id}>
                                                    <td className="fw-semibold">{fee.fee_month_label || "-"}</td>
                                                    <td>
                                                        <div>{fee.student_name || "-"}</div>
                                                        <small className="text-muted">{fee.enrollment_no || fee.admission_no || ""}</small>
                                                    </td>
                                                    <td>{fee.invoice_no}</td>
                                                    <td>{fee.program_name || "-"}</td>
                                                    <td>{formatDate(fee.fee_period_start)} to {formatDate(fee.fee_period_end)}</td>
                                                    <td>{formatDate(fee.due_date)}</td>
                                                    <td>{formatMoney(fee.total_amount)}</td>
                                                    <td>{formatMoney(fee.paid_amount)}</td>
                                                    <td className={Number(fee.balance_amount) > 0 ? "text-danger fw-semibold" : "text-success fw-semibold"}>
                                                        {formatMoney(fee.balance_amount)}
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${paymentBadge(fee.payment_status)}`}>
                                                            {fee.payment_status || "Unknown"}
                                                        </span>
                                                    </td>
                                                    <td className="text-end">
                                                        <div className="btn-group btn-group-sm" role="group">
                                                            <Link href={`/next_panel/academy-fees/${fee.id}`} className="btn btn-outline-primary" aria-label="View fee">
                                                                <ArrowUpRight size={16} />
                                                            </Link>
                                                            {canDelete && (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-outline-danger"
                                                                    onClick={() => handleDelete(fee)}
                                                                    disabled={deletingId === fee.id}
                                                                    aria-label="Delete fee"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            )}
                                                            {canEdit && (
                                                                <Link href={`/next_panel/academy-fees/${fee.id}/edit`} className="btn btn-outline-secondary" aria-label="Edit fee">
                                                                    <Edit size={16} />
                                                                </Link>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
