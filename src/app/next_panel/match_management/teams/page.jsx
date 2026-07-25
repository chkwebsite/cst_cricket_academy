"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Edit, Plus, Trash2, Shield } from "lucide-react";
import { useAuth } from "@/components/utils/AuthContext";
import { getTeamLogoUrl } from "./TeamForm";

export default function TeamPage() {
    const { user } = useAuth();
    const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
    const hasPermission = (permission) => {
        if (Number(user?.role_id) === 1 || Number(user?.role_id) === 7) return true;
        return permissions.includes(permission);
    };
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadTeams() {
            try {
                const teamRes = await fetch("/api/teams");
                const teamJson = await teamRes.json();

                if (!teamRes.ok) throw new Error(teamJson.message || "Unable to load teams.");

                setTeams(teamJson.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadTeams();
    }, []);

    const handleDelete = async (team) => {
        if (!confirm(`Delete team "${team.team_name}"?`)) return;

        setDeletingId(team.id);
        setError(null);

        try {
            const res = await fetch(`/api/teams/${team.id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to delete team.");
            setTeams((current) => current.filter((item) => item.id !== team.id));
        } catch (err) {
            setError(err.message);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="container-fluid">
            <div className="row g-4">
                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                            <div>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <Shield size={24} />
                                    <h1 className="h4 mb-0">Teams</h1>
                                </div>
                                <p className="text-muted mb-0">Manage teams, coaches, and branch assignments.</p>
                            </div>

                            {hasPermission("teams.create") &&
                                <Link href="/next_panel/teams/new" className="btn btn-primary fw-semibold">
                                    <Plus size={16} className="me-2" /> New Team
                                </Link>
                            }
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-3">
                        {error && <div className="alert alert-danger">{error}</div>}

                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading teams...</div>
                        ) : teams.length === 0 ? (
                            <div className="text-center py-5 text-muted">No teams found yet.</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th scope="col">Team</th>
                                            <th scope="col">Code</th>
                                            <th scope="col">Branch</th>
                                            <th scope="col">Category</th>
                                            <th scope="col">Coach</th>
                                            <th scope="col">Status</th>
                                            <th scope="col" className="text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {teams.map((team) => (
                                            <tr key={team.id}>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        {getTeamLogoUrl(team) ? (
                                                            <img src={getTeamLogoUrl(team)} alt={team.team_name} className="rounded-circle border" style={{ height: "36px", width: "36px", objectFit: "cover" }} />
                                                        ) : (
                                                            <div className="rounded-circle border d-flex align-items-center justify-content-center bg-light" style={{ height: "36px", width: "36px" }}>
                                                                <Shield size={16} className="text-muted" />
                                                            </div>
                                                        )}
                                                        <span className="fw-semibold">{team.team_name}</span>
                                                    </div>
                                                </td>
                                                <td className="text-muted">{team.team_code || "Not provided"}</td>
                                                <td>{team.branch_name || "Not provided"}</td>
                                                <td>{team.category || "Not provided"}</td>
                                                <td className="text-muted">{team.coach_name || "Not provided"}</td>
                                                <td>
                                                    <span className={`badge ${team.status === 1 ? "bg-success" : "bg-secondary"}`}>
                                                        {team.status === 1 ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td className="text-end">
                                                    <div className="btn-group btn-group-sm" role="group">
                                                        <Link href={`/next_panel/teams/${team.id}`} className="btn btn-outline-primary" aria-label="View team">
                                                            <ArrowUpRight size={16} />
                                                        </Link>

                                                        {hasPermission("teams.edit") && <Link href={`/next_panel/teams/${team.id}/edit`} className="btn btn-outline-secondary" aria-label="Edit team">
                                                            <Edit size={16} />
                                                        </Link>}
                                                        {hasPermission("teams.delete") &&
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-danger"
                                                                onClick={() => handleDelete(team)}
                                                                disabled={deletingId === team.id}
                                                                aria-label="Delete team"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        }
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
