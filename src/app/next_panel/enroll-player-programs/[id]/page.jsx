"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, GraduationCap, Trash2 } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";

const fields = [
    ["Branch", "branch_name"],
    ["Program", "program_name"],
    ["Age Group", "age_group"],
    ["Coach", "coach_name"],
    ["Fee Structure", "fee_structure"],
    ["Fees", "fees"],
    ["Registration Fee", "registration_fee"],
    ["Admission Fee", "admission_fee"],
    ["Kit Fee", "kit_fee"],
    ["Security Deposit", "security_deposit"],
    ["Discount Amount", "discount_amount"],
    ["Final Fee", "final_fee"],
    ["Admission Date", "admission_date"],
    ["Start Date", "start_date"],
    ["End Date", "end_date"],
    ["Next Due Date", "next_due_date"],
    ["Remarks", "remarks"],
];

export default function EnrollmentDetailPage() {
    const { user: userInfo } = useAuth();
    const [enrollment, setEnrollment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);
    const params = useParams();
    const router = useRouter();
    const canEdit = userInfo?.permissions?.includes("enroll-player.edit") ?? true;
    const canDelete = userInfo?.permissions?.includes("enroll-player.delete") ?? true;

    useEffect(() => {
        async function loadEnrollment() {
            try {
                const res = await fetch(`/api/enroll-player-programs/${params.id}`);
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || "Unable to load enrollment.");
                setEnrollment(json.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadEnrollment();
    }, [params.id]);

    const handleDelete = async () => {
        if (!confirm("Delete this enrollment?")) return;

        setDeleting(true);
        setError(null);

        try {
            const res = await fetch(`/api/enroll-player-programs/${params.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete enrollment.");
            router.push("/next_panel/enroll-player-programs");
        } catch (err) {
            setError(err.message);
        } finally {
            setDeleting(false);
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
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <GraduationCap size={24} />
                                    <h1 className="h4 mb-0">{enrollment?.enrollment_no || "Enrollment Details"}</h1>
                                </div>
                                <p className="text-muted mb-0">View and manage this player enrollment.</p>
                            </div>
                            <div className="d-flex gap-2">
                                {canEdit && (
                                    <Link href={`/next_panel/enroll-player-programs/${params.id}/edit`} className="btn btn-primary">
                                        <Edit size={16} className="me-2" /> Edit
                                    </Link>
                                )}
                                {canDelete && (
                                    <button className="btn btn-outline-danger" onClick={handleDelete} disabled={deleting}>
                                        <Trash2 size={16} className="me-2" /> {deleting ? "Deleting..." : "Delete"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading enrollment details...</div>
                        ) : error ? (
                            <div className="alert alert-danger">{error}</div>
                        ) : (
                            <div className="row gy-4">
                                <div className="col-12">
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="badge bg-info text-dark">{enrollment.status}</span>
                                        <span className="text-muted small">Admission No: {enrollment.admission_no}</span>
                                        <span className="text-muted small">ID: {enrollment.id}</span>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <h2 className="h6 mb-1">Student</h2>
                                    <p className="mb-0 text-muted">{enrollment.student_name || "Not provided"}</p>
                                </div>

                                {fields.map(([label, key]) => (
                                    <div className="col-md-6" key={key}>
                                        <h2 className="h6 mb-1">{label}</h2>
                                        <p className="mb-0 text-muted">{enrollment[key] || "Not provided"}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
