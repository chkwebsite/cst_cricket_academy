"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2, Shield } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";
import { getTeamLogoUrl } from "../TeamForm";

const teamFields = [
    ["Team Code", "team_code"],
    ["Branch", "branch_name"],
    ["Category", "category"],
    ["Coach Name", "coach_name"],
];

export default function TeamDetailPage() {
    const { user } = useAuth();
    const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
    const hasPermission = (permission) => {
        if (Number(user?.role_id) === 1 || Number(user?.role_id) === 7) return true;
        return permissions.includes(permission);
    };
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        async function loadTeam() {
            try {
                const teamRes = await fetch(`/api/teams/${params.id}`);
                const teamJson = await teamRes.json();

                if (!teamRes.ok) throw new Error(teamJson.message || "Unable to load team.");

                setTeam(teamJson.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadTeam();
    }, [params.id]);

    const handleDelete = async () => {
        if (!confirm("Delete this team?")) return;

        setDeleting(true);
        setError(null);

        try {
            const res = await fetch(`/api/teams/${params.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete team.");
            router.push("/next_panel/teams");
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
                                <Link href="/next_panel/teams" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Teams
                                </Link>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    {getTeamLogoUrl(team) ? (
                                        <img src={getTeamLogoUrl(team)} alt={team?.team_name} className="rounded-circle border" style={{ height: "44px", width: "44px", objectFit: "cover" }} />
                                    ) : (
                                        <Shield size={24} />
                                    )}
                                    <h1 className="h4 mb-0">{team?.team_name || "Team Details"}</h1>
                                </div>
                                <p className="text-muted mb-0">View and manage this team.</p>
                            </div>
                            <div className="d-flex gap-2">
                                {hasPermission("teams.edit") && <Link href={`/next_panel/teams/${params.id}/edit`} className="btn btn-primary">
                                    <Edit size={16} className="me-2" /> Edit
                                </Link>}
                                {hasPermission("teams.delete") && <button className="btn btn-outline-danger" onClick={handleDelete} disabled={deleting}>
                                    <Trash2 size={16} className="me-2" /> {deleting ? "Deleting..." : "Delete"}
                                </button>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading team details...</div>
                        ) : error ? (
                            <div className="alert alert-danger">{error}</div>
                        ) : (
                            <div className="row gy-4">
                                <div className="col-12">
                                    <div className="d-flex flex-wrap align-items-center gap-2">
                                        <span className={`badge ${team.status === 1 ? "bg-success" : "bg-secondary"}`}>
                                            {team.status === 1 ? "Active" : "Inactive"}
                                        </span>
                                        <span className="text-muted small">ID: {team.id}</span>
                                    </div>
                                </div>

                                {teamFields.map(([label, key]) => (
                                    <div className="col-md-6" key={key}>
                                        <h2 className="h6 mb-1">{label}</h2>
                                        <p className="mb-0 text-muted">{team[key] || "Not provided"}</p>
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
