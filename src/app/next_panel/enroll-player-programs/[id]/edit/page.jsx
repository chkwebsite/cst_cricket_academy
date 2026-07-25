"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";
import EnrollmentForm, { getEmptyEnrollment, normalizeEnrollmentPayload } from "../../EnrollmentForm";

export default function EditEnrollmentPage() {
    const { user: userInfo } = useAuth();
    const [values, setValues] = useState(getEmptyEnrollment());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        async function loadEnrollment() {
            try {
                const res = await fetch(`/api/enroll-player-programs/${params.id}`);
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || "Unable to load enrollment.");
                const enrollment = json.data;
                setValues({
                    user_id: enrollment.user_id ?? "",
                    enrollment_no: enrollment.enrollment_no || "",
                    admission_no: enrollment.admission_no || "",
                    branch_id: enrollment.branch_id ?? "",
                    program_id: enrollment.program_id ?? "",
                    age_group_id: enrollment.age_group_id ?? "",
                    coach_id: enrollment.coach_id ?? "",
                    fee_structure: enrollment.fee_structure || "Monthly",
                    fees: enrollment.fees ?? "",
                    registration_fee: enrollment.registration_fee ?? "",
                    admission_fee: enrollment.admission_fee ?? "",
                    kit_fee: enrollment.kit_fee ?? "",
                    security_deposit: enrollment.security_deposit ?? "",
                    discount_amount: enrollment.discount_amount ?? "",
                    final_fee: enrollment.final_fee ?? "",
                    admission_date: enrollment.admission_date ? enrollment.admission_date.substring(0, 10) : "",
                    start_date: enrollment.start_date ? enrollment.start_date.substring(0, 10) : "",
                    end_date: enrollment.end_date ? enrollment.end_date.substring(0, 10) : "",
                    next_due_date: enrollment.next_due_date ? enrollment.next_due_date.substring(0, 10) : "",
                    status: enrollment.status || "Active",
                    remarks: enrollment.remarks || "",
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadEnrollment();
    }, [params.id]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const res = await fetch(`/api/enroll-player-programs/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...normalizeEnrollmentPayload(values),
                    updated_by: userInfo?.id,
                }),
            });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message || "Unable to update enrollment.");
            router.push(`/next_panel/enroll-player-programs/${params.id}`);
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
                                <Link href="/next_panel/enroll-player-programs" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Enrollments
                                </Link>
                                <h1 className="h4 mb-2">Edit Enrollment</h1>
                                <p className="text-muted mb-0">Update enrollment, fee, and schedule details.</p>
                            </div>
                            <button className="btn btn-primary" type="submit" form="enrollmentEditForm" disabled={saving || loading}>
                                <Save size={16} className="me-2" /> {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading enrollment details...</div>
                        ) : (
                            <EnrollmentForm
                                formId="enrollmentEditForm"
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

