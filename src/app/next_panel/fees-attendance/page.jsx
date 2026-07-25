"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarCheck, ReceiptIndianRupee } from "lucide-react";

const months = [
    { index: 0, short: "Jan", label: "January" },
    { index: 1, short: "Feb", label: "February" },
    { index: 2, short: "Mar", label: "March" },
    { index: 3, short: "Apr", label: "April" },
    { index: 4, short: "May", label: "May" },
    { index: 5, short: "Jun", label: "June" },
    { index: 6, short: "Jul", label: "July" },
    { index: 7, short: "Aug", label: "August" },
    { index: 8, short: "Sep", label: "September" },
    { index: 9, short: "Oct", label: "October" },
    { index: 10, short: "Nov", label: "November" },
    { index: 11, short: "Dec", label: "December" },
];

const monthKey = (year, monthIndex) => `${year}-${String(monthIndex + 1).padStart(2, "0")}`;

const money = (value) => {
    const amount = Number(value) || 0;
    return amount.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    });
};

function getFeeMonth(fee) {
    if (fee.fee_month) return fee.fee_month;
    const date = fee.fee_period_start || fee.due_date;
    return date ? date.substring(0, 7) : "";
}

function combineMonthFees(items) {
    if (!items.length) {
        return {
            status: "Pending",
            label: "Pending",
            className: "bg-danger-subtle text-danger border border-danger-subtle",
            total: 0,
            paid: 0,
            balance: 0,
            invoiceIds: [],
        };
    }

    const totals = items.reduce((acc, fee) => {
        acc.total += Number(fee.total_amount) || 0;
        acc.paid += Number(fee.paid_amount) || 0;
        acc.balance += Number(fee.balance_amount) || 0;
        acc.invoiceIds.push(fee.id);
        return acc;
    }, { total: 0, paid: 0, balance: 0, invoiceIds: [] });

    if (totals.balance <= 0 && totals.total > 0) {
        return {
            ...totals,
            status: "Paid",
            label: "Paid",
            className: "bg-success-subtle text-success border border-success-subtle",
        };
    }

    if (totals.paid > 0) {
        return {
            ...totals,
            status: "Partial",
            label: "Partial",
            className: "bg-warning-subtle text-warning-emphasis border border-warning-subtle",
        };
    }

    return {
        ...totals,
        status: "Pending",
        label: "Pending",
        className: "bg-danger-subtle text-danger border border-danger-subtle",
    };
}

export default function FeesAttendancePage() {
    const [enrollments, setEnrollments] = useState([]);
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
    const [selectedProgram, setSelectedProgram] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");

    useEffect(() => {
        let active = true;

        async function loadData() {
            setLoading(true);
            setError(null);

            try {
                const [enrollmentRes, feeRes] = await Promise.all([
                    fetch("/api/enroll-player-programs"),
                    fetch("/api/academy-fees"),
                ]);
                const [enrollmentJson, feeJson] = await Promise.all([
                    enrollmentRes.json(),
                    feeRes.json(),
                ]);

                if (!enrollmentRes.ok || !enrollmentJson.success) {
                    throw new Error(enrollmentJson.message || "Unable to load enrollments.");
                }
                if (!feeRes.ok || !feeJson.success) {
                    throw new Error(feeJson.message || "Unable to load fees.");
                }

                if (!active) return;
                setEnrollments(enrollmentJson.data || []);
                setFees(feeJson.data || []);
            } catch (err) {
                if (active) setError(err.message);
            } finally {
                if (active) setLoading(false);
            }
        }

        loadData();

        return () => {
            active = false;
        };
    }, []);

    const feesByEnrollmentAndMonth = useMemo(() => {
        return fees.reduce((acc, fee) => {
            const key = `${fee.enrollment_id}-${getFeeMonth(fee)}`;
            if (!acc[key]) acc[key] = [];
            acc[key].push(fee);
            return acc;
        }, {});
    }, [fees]);

    const years = useMemo(() => {
        const found = new Set([String(new Date().getFullYear())]);
        fees.forEach((fee) => {
            const feeMonth = getFeeMonth(fee);
            if (feeMonth) found.add(feeMonth.substring(0, 4));
        });
        return Array.from(found).sort((a, b) => Number(b) - Number(a));
    }, [fees]);

    const programs = useMemo(() => {
        const map = new Map();
        enrollments.forEach((enrollment) => {
            if (enrollment.program_id) {
                map.set(String(enrollment.program_id), enrollment.program_name || `Program #${enrollment.program_id}`);
            }
        });
        return Array.from(map, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
    }, [enrollments]);

    const rows = useMemo(() => {
        return enrollments
            .filter((enrollment) => selectedProgram === "all" || String(enrollment.program_id) === selectedProgram)
            .map((enrollment) => {
                const monthStatuses = months.map((month) => {
                    const key = `${enrollment.id}-${monthKey(selectedYear, month.index)}`;
                    return combineMonthFees(feesByEnrollmentAndMonth[key] || []);
                });

                return {
                    enrollment,
                    monthStatuses,
                    paidCount: monthStatuses.filter((item) => item.status === "Paid").length,
                    pendingCount: monthStatuses.filter((item) => item.status === "Pending").length,
                    partialCount: monthStatuses.filter((item) => item.status === "Partial").length,
                };
            })
            .filter((row) => {
                if (selectedStatus === "all") return true;
                return row.monthStatuses.some((item) => item.status === selectedStatus);
            });
    }, [enrollments, feesByEnrollmentAndMonth, selectedProgram, selectedStatus, selectedYear]);

    const summary = useMemo(() => {
        return rows.reduce((acc, row) => {
            row.monthStatuses.forEach((item) => {
                acc[item.status] = (acc[item.status] || 0) + 1;
                acc.total += item.total;
                acc.paid += item.paid;
                acc.balance += item.balance;
            });
            return acc;
        }, { Paid: 0, Partial: 0, Pending: 0, total: 0, paid: 0, balance: 0 });
    }, [rows]);

    return (
        <div className="container-fluid">
            <div className="row g-4">
                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                        <div className="d-flex flex-column flex-xl-row justify-content-between align-items-start align-items-xl-center gap-3">
                            <div>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <CalendarCheck size={24} />
                                    <h1 className="h4 mb-0">Fees Attendance</h1>
                                </div>
                                <p className="text-muted mb-0">Player wise 12-month fee status for paid and pending fees.</p>
                            </div>

                            <div className="d-flex flex-column flex-sm-row gap-2">
                                <select className="form-select" value={selectedYear} onChange={(event) => setSelectedYear(event.target.value)} aria-label="Year">
                                    {years.map((year) => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                                <select className="form-select" value={selectedProgram} onChange={(event) => setSelectedProgram(event.target.value)} aria-label="Program">
                                    <option value="all">All Programs</option>
                                    {programs.map((program) => (
                                        <option key={program.id} value={program.id}>{program.name}</option>
                                    ))}
                                </select>
                                <select className="form-select" value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)} aria-label="Fee status">
                                    <option value="all">All Status</option>
                                    <option value="Paid">Paid</option>
                                    <option value="Partial">Partial</option>
                                    <option value="Pending">Pending</option>
                                </select>
                                <Link href="/next_panel/academy-fees/new" className="btn btn-primary fw-semibold text-nowrap">
                                    <ReceiptIndianRupee size={16} className="me-2" /> Add Fee
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="row g-3 mb-4">
                        <div className="col-md-3">
                            <div className="bg-white border rounded-3 p-3 h-100">
                                <div className="text-muted small">Players</div>
                                <div className="fw-bold">{rows.length}</div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="bg-white border rounded-3 p-3 h-100">
                                <div className="text-muted small">Paid Months</div>
                                <div className="fw-bold text-success">{summary.Paid}</div>
                                <small className="text-muted">{money(summary.paid)} received</small>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="bg-white border rounded-3 p-3 h-100">
                                <div className="text-muted small">Partial Months</div>
                                <div className="fw-bold text-warning-emphasis">{summary.Partial}</div>
                                <small className="text-muted">Some amount paid</small>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="bg-white border rounded-3 p-3 h-100">
                                <div className="text-muted small">Pending Balance</div>
                                <div className="fw-bold text-danger">{money(summary.balance)}</div>
                                <small className="text-muted">{summary.Pending} pending month(s)</small>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-3">
                        {error && <div className="alert alert-danger">{error}</div>}

                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading fee attendance...</div>
                        ) : rows.length === 0 ? (
                            <div className="text-center py-5 text-muted">No players found for this filter.</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th scope="col" style={{ minWidth: 220 }}>Player</th>
                                            <th scope="col" style={{ minWidth: 180 }}>Program</th>
                                            {months.map((month) => (
                                                <th key={month.short} scope="col" className="text-center">{month.short}</th>
                                            ))}
                                            <th scope="col" className="text-center">Paid</th>
                                            <th scope="col" className="text-center">Pending</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((row) => (
                                            <tr key={row.enrollment.id}>
                                                <td>
                                                    <div className="fw-semibold">{row.enrollment.student_name || "-"}</div>
                                                    <small className="text-muted">{row.enrollment.enrollment_no || row.enrollment.admission_no || ""}</small>
                                                </td>
                                                <td>{row.enrollment.program_name || "-"}</td>
                                                {row.monthStatuses.map((item, index) => (
                                                    <td key={`${row.enrollment.id}-${months[index].short}`} className="text-center">
                                                        <span
                                                            className={`badge rounded-pill ${item.className}`}
                                                            title={`${months[index].label}: ${item.label}. Total ${money(item.total)}, Paid ${money(item.paid)}, Pending ${money(item.balance)}`}
                                                        >
                                                            {item.label}
                                                        </span>
                                                    </td>
                                                ))}
                                                <td className="text-center fw-semibold text-success">{row.paidCount}</td>
                                                <td className="text-center fw-semibold text-danger">{row.pendingCount + row.partialCount}</td>
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
