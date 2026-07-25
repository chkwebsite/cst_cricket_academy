"use client";

import { useEffect, useState } from "react";

const emptyEnrollment = {
    user_id: "",
    enrollment_no: "",
    admission_no: "",
    branch_id: "",
    program_id: "",
    age_group_id: "",
    coach_id: "",
    fee_structure: "Monthly",
    fees: "",
    registration_fee: "",
    admission_fee: "",
    kit_fee: "",
    security_deposit: "",
    discount_amount: "",
    final_fee: "",
    admission_date: "",
    start_date: "",
    end_date: "",
    next_due_date: "",
    status: "Active",
    remarks: "",
};

export function getEmptyEnrollment() {
    return { ...emptyEnrollment };
}

const toNumberOrNull = (value) => (value === "" || value === null || value === undefined ? null : Number(value));

const fullName = (item) => [item.first_name, item.last_name].filter(Boolean).join(" ").trim();

async function fetchOptions(url) {
    const res = await fetch(url);
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || `Unable to load ${url}`);
    return json.data || [];
}

export function normalizeEnrollmentPayload(values) {
    return {
        user_id: toNumberOrNull(values.user_id),
        enrollment_no: values.enrollment_no.trim(),
        admission_no: values.admission_no.trim(),
        branch_id: toNumberOrNull(values.branch_id),
        program_id: toNumberOrNull(values.program_id),
        age_group_id: toNumberOrNull(values.age_group_id),
        coach_id: toNumberOrNull(values.coach_id),
        fee_structure: values.fee_structure,
        fees: toNumberOrNull(values.fees),
        registration_fee: toNumberOrNull(values.registration_fee),
        admission_fee: toNumberOrNull(values.admission_fee),
        kit_fee: toNumberOrNull(values.kit_fee),
        security_deposit: toNumberOrNull(values.security_deposit),
        discount_amount: toNumberOrNull(values.discount_amount),
        final_fee: toNumberOrNull(values.final_fee),
        admission_date: values.admission_date || null,
        start_date: values.start_date || null,
        end_date: values.end_date || null,
        next_due_date: values.next_due_date || null,
        status: values.status,
        remarks: values.remarks.trim(),
    };
}

export default function EnrollmentForm({ formId, values, onChange, onSubmit, error, loading = false }) {
    const [options, setOptions] = useState({
        students: [],
        branches: [],
        programs: [],
        ageGroups: [],
        coaches: [],
    });
    const [optionsLoading, setOptionsLoading] = useState(true);
    const [optionsError, setOptionsError] = useState(null);

    useEffect(() => {
        let active = true;

        async function loadOptions() {
            setOptionsLoading(true);
            setOptionsError(null);

            try {
                const [students, branches, programs, ageGroups, coaches] = await Promise.all([
                    fetchOptions("/api/users"),
                    fetchOptions("/api/branch"),
                    fetchOptions("/api/coaching-program"),
                    fetchOptions("/api/age_groups"),
                    fetchOptions("/api/profile"),
                ]);

                if (!active) return;

                setOptions({
                    students,
                    branches,
                    programs,
                    ageGroups,
                    coaches: coaches.filter((coach) => coach.user_id),
                });
            } catch (err) {
                if (active) setOptionsError(err.message);
            } finally {
                if (active) setOptionsLoading(false);
            }
        }

        loadOptions();

        return () => {
            active = false;
        };
    }, []);

    const handleChange = (field) => (event) => {
        onChange({ ...values, [field]: event.target.value });
    };

    // Auto-calculate the final fee whenever the underlying fee components change.
    const handleFeeChange = (field) => (event) => {
        const next = { ...values, [field]: event.target.value };

        const registration = Number(next.registration_fee) || 0;
        const admission = Number(next.admission_fee) || 0;
        const kit = Number(next.kit_fee) || 0;
        const deposit = Number(next.security_deposit) || 0;
        const discount = Number(next.discount_amount) || 0;

        next.final_fee = (registration + admission + kit + deposit - discount).toString();

        onChange(next);
    };

    return (
        <form id={formId} onSubmit={onSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}
            {optionsError && <div className="alert alert-warning">{optionsError}</div>}

            <div className="row g-3">
                <div className="col-12">
                    <h2 className="h6 text-muted text-uppercase mb-0">Student &amp; Enrollment</h2>
                    <hr className="mt-2" />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Student</label>
                    <select
                        className="form-control"
                        value={values.user_id}
                        onChange={handleChange("user_id")}
                        required
                        disabled={loading || optionsLoading}
                    >
                        <option value="">{optionsLoading ? "Loading students..." : "Select student"}</option>
                        {options.students.map((student) => (
                            <option key={student.id} value={student.id}>
                                {fullName(student) || student.username || student.email || `User #${student.id}`} {student.mobile ? `(${student.mobile})` : ""}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-md-4">
                    <label className="form-label">Enrollment No</label>
                    <input
                        className="form-control"
                        value={values.enrollment_no}
                        onChange={handleChange("enrollment_no")}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Admission No</label>
                    <input
                        className="form-control"
                        value={values.admission_no}
                        onChange={handleChange("admission_no")}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="col-md-3">
                    <label className="form-label">Branch</label>
                    <select className="form-select" value={values.branch_id} onChange={handleChange("branch_id")} disabled={loading || optionsLoading}>
                        <option value="">{optionsLoading ? "Loading branches..." : "Select branch"}</option>
                        {options.branches.map((branch) => (
                            <option key={branch.id} value={branch.id}>
                                {branch.branch_name || `Branch #${branch.id}`}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-md-3">
                    <label className="form-label">Program</label>
                    <select className="form-select" value={values.program_id} onChange={handleChange("program_id")} disabled={loading || optionsLoading}>
                        <option value="">{optionsLoading ? "Loading programs..." : "Select program"}</option>
                        {options.programs.map((program) => (
                            <option key={program.id} value={program.id}>
                                {program.title || `Program #${program.id}`}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-md-3">
                    <label className="form-label">Age Group</label>
                    <select className="form-select" value={values.age_group_id} onChange={handleChange("age_group_id")} disabled={loading || optionsLoading}>
                        <option value="">{optionsLoading ? "Loading age groups..." : "Select age group"}</option>
                        {options.ageGroups.map((ageGroup) => (
                            <option key={ageGroup.id} value={ageGroup.id}>
                                {ageGroup.age_group || `${ageGroup.min_age}-${ageGroup.max_age} years`}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-md-3">
                    <label className="form-label">Coach</label>
                    <select className="form-select" value={values.coach_id} onChange={handleChange("coach_id")} disabled={loading || optionsLoading}>
                        <option value="">{optionsLoading ? "Loading coaches..." : "Select coach"}</option>
                        {options.coaches.map((coach) => (
                            <option key={coach.id} value={coach.user_id}>
                                {fullName(coach) || coach.title || `Coach #${coach.user_id}`} {coach.designation ? `- ${coach.designation}` : ""}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-12 mt-4">
                    <h2 className="h6 text-muted text-uppercase mb-0">Fee Details</h2>
                    <hr className="mt-2" />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Fee Structure</label>
                    <select className="form-select" value={values.fee_structure} onChange={handleChange("fee_structure")} disabled={loading}>
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Half Yearly">Half Yearly</option>
                        <option value="Yearly">Yearly</option>
                    </select>
                </div>

                <div className="col-md-4">
                    <label className="form-label">Fees</label>
                    <input type="number" step="0.01" className="form-control" value={values.fees} onChange={handleChange("fees")} disabled={loading} />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Final Fee</label>
                    <input type="number" step="0.01" className="form-control" value={values.final_fee} onChange={handleChange("final_fee")} disabled={loading} />
                    <small className="text-muted">Auto-calculated from the fields below, editable if needed.</small>
                </div>

                <div className="col-md-3">
                    <label className="form-label">Registration Fee</label>
                    <input type="number" step="0.01" className="form-control" value={values.registration_fee} onChange={handleFeeChange("registration_fee")} disabled={loading} />
                </div>

                <div className="col-md-3">
                    <label className="form-label">Admission Fee</label>
                    <input type="number" step="0.01" className="form-control" value={values.admission_fee} onChange={handleFeeChange("admission_fee")} disabled={loading} />
                </div>

                <div className="col-md-3">
                    <label className="form-label">Kit Fee</label>
                    <input type="number" step="0.01" className="form-control" value={values.kit_fee} onChange={handleFeeChange("kit_fee")} disabled={loading} />
                </div>

                <div className="col-md-3">
                    <label className="form-label">Security Deposit</label>
                    <input type="number" step="0.01" className="form-control" value={values.security_deposit} onChange={handleFeeChange("security_deposit")} disabled={loading} />
                </div>

                <div className="col-md-3">
                    <label className="form-label">Discount Amount</label>
                    <input type="number" step="0.01" className="form-control" value={values.discount_amount} onChange={handleFeeChange("discount_amount")} disabled={loading} />
                </div>

                <div className="col-12 mt-4">
                    <h2 className="h6 text-muted text-uppercase mb-0">Schedule &amp; Status</h2>
                    <hr className="mt-2" />
                </div>

                <div className="col-md-3">
                    <label className="form-label">Admission Date</label>
                    <input type="date" className="form-control" value={values.admission_date} onChange={handleChange("admission_date")} disabled={loading} />
                </div>

                <div className="col-md-3">
                    <label className="form-label">Start Date</label>
                    <input type="date" className="form-control" value={values.start_date} onChange={handleChange("start_date")} disabled={loading} />
                </div>

                <div className="col-md-3">
                    <label className="form-label">End Date</label>
                    <input type="date" className="form-control" value={values.end_date} onChange={handleChange("end_date")} disabled={loading} />
                </div>

                <div className="col-md-3">
                    <label className="form-label">Next Due Date</label>
                    <input type="date" className="form-control" value={values.next_due_date} onChange={handleChange("next_due_date")} disabled={loading} />
                </div>

                <div className="col-md-4">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={values.status} onChange={handleChange("status")} disabled={loading}>
                        <option value="Active">Active</option>
                        <option value="Completed">Completed</option>
                        <option value="Hold">Hold</option>
                        <option value="Cancelled">Cancelled</option>
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
