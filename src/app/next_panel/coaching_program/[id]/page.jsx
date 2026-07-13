"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2, Trophy } from "lucide-react";
import { formatDateInput, formatTimeInput, getImageSrc, getUserName } from "../ProfileForm";
import { useAuth } from "@/components/utils/AuthContext";

const programFields = [
    ["Designation", "designation"],
    ["Sub Designation", "sub_designation"],
    ["Branch", "branch_name"],
    ["Coach Designation", "coach_designation"],
    ["Start Date", "start_date"],
    ["End Date", "end_date"],
    ["Start Time", "start_time"],
    ["End Time", "end_time"],
    ["Duration", "duration"],
    ["Days", "days"],
    ["Age Group", "age_group"],
    ["Skill Level", "skill_level"],
    ["Total Seats", "total_seats"],
    ["Available Seats", "available_seats"],
    ["Fees", "fees"],
    ["Display Order", "display_order"],
];

export default function ProfileDetailPage() {
    const { user } = useAuth();
    const [program, setProgram] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        async function loadProgram() {
            try {
                const res = await fetch(`/api/coaching-program/${params.id}`);
                const json = await res.json();

                if (!res.ok || !json.success) throw new Error(json.message || "Unable to load coaching program.");

                setProgram(json.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadProgram();
    }, [params.id]);

    const handleDelete = async () => {
        if (!confirm("Delete this coaching program?")) return;

        setDeleting(true);
        setError(null);

        try {
            const res = await fetch(`/api/coaching-program/${params.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message || "Unable to delete coaching program.");
            router.push("/next_panel/coaching_program");
        } catch (err) {
            setError(err.message);
        } finally {
            setDeleting(false);
        }
    };

    const getValue = (key) => {
        if (!program) return "";
        if (key === "start_date" || key === "end_date") return formatDateInput(program[key]);
        if (key === "start_time" || key === "end_time") return formatTimeInput(program[key]);
        if (key === "fees" && program[key] !== null && program[key] !== undefined && program[key] !== "") return program[key];
        return program[key];
    };

    const imageSrc = getImageSrc(program?.program_image);

    return (
        <div className="container-fluid">
            <div className="row g-4">
                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                            <div>
                                <Link href="/next_panel/coaching_program" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Coaching Programs
                                </Link>
                                <div className="d-flex align-items-center gap-3 mb-2">
                                    {imageSrc ? (
                                        <Image src={imageSrc} alt={program?.title || "Program"} className="rounded-3 border" width={64} height={64} style={{ objectFit: "cover" }} unoptimized />
                                    ) : (
                                        <Trophy size={28} />
                                    )}
                                    <div>
                                        <h1 className="h4 mb-1">{program?.title || "Coaching Program Details"}</h1>
                                        <p className="text-muted mb-0">{program?.slug || "View and manage this program."}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex gap-2">
                                {user.permissions.includes("coaching_program.edit") && (
                                    <Link href={`/next_panel/coaching_program/${params.id}/edit`} className="btn btn-primary">
                                        <Edit size={16} className="me-2" /> Edit
                                    </Link>
                                )}
                                {user.permissions.includes("coaching_program.delete") && (
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
                            <div className="text-center py-5 text-muted">Loading coaching program details...</div>
                        ) : error ? (
                            <div className="alert alert-danger">{error}</div>
                        ) : (
                            <div className="row gy-4">
                                <div className="col-12">
                                    <div className="d-flex flex-wrap align-items-center gap-2">
                                        <span className={`badge ${Number(program.status) === 1 ? "bg-success" : "bg-secondary"}`}>
                                            {Number(program.status) === 1 ? "Active" : "Inactive"}
                                        </span>
                                        <span className={`badge ${Number(program.featured) === 1 ? "bg-warning text-dark" : "bg-light text-dark"}`}>
                                            {Number(program.featured) === 1 ? "Featured" : "Not Featured"}
                                        </span>
                                        <span className="text-muted small">ID: {program.id}</span>
                                        <span className="text-muted small">User: {getUserName(program) || `User #${program.user_id}`}</span>
                                    </div>
                                </div>

                                {programFields.map(([label, key]) => (
                                    <div className="col-md-4" key={key}>
                                        <h2 className="h6 mb-1">{label}</h2>
                                        <p className="mb-0 text-muted">{getValue(key) || "Not provided"}</p>
                                    </div>
                                ))}

                                <div className="col-md-12">
                                    <h2 className="h6 mb-1 fw-semibold">About Program</h2>
                                    <div className="mb-0 text-muted" dangerouslySetInnerHTML={{ __html: program.about_me || "Not provided" }} />
                                </div>

                                <div className="col-md-12">
                                    <h2 className="h6 mb-1 fw-semibold">Description</h2>
                                    <div className="mb-0 text-muted" dangerouslySetInnerHTML={{ __html: program.description || "Not provided" }} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
