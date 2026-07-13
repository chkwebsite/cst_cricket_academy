"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

export default function NewUserPage() {
    const [roles, setRoles] = useState([]);
    const [branch, setBranch] = useState([]);
    const [values, setValues] = useState({
        role_id: "",
        branch_id: "",
        first_name: "",
        last_name: "",
        username: "",
        email: "",
        password: "",
        mobile: "",
        gender: "",
        date_of_birth: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        profile_image: null,
    });
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        async function loadRoles() {
            try {
                const res = await fetch("/api/roles");
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || "Unable to load roles.");
                setRoles(json.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadRoles();
    }, []);

    useEffect(() => {
        async function loadBranch() {
            try {
                const res = await fetch("/api/branch");
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || "Unable to load roles.");
                setBranch(json.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadBranch();
    }, []);

    const handleChange = (key) => (e) => {
        const value = e.target.type === "file" ? e.target.files[0] : e.target.value;
        setValues((prev) => ({ ...prev, [key]: value }));

        if (key === "profile_image") {
            const file = e.target.files[0];
            setPreview(file ? URL.createObjectURL(file) : null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const formData = new FormData();
            Object.entries(values).forEach(([key, value]) => {
                if (value !== null && value !== "") {
                    if (key === "profile_image" && value instanceof File) {
                        formData.append(key, value);
                    } else if (key !== "profile_image") {
                        formData.append(key, value);
                    }
                }
            });

            const res = await fetch("/api/auth/register", {
                method: "POST",
                body: formData,
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to create user.");
            router.push("/next_panel/users");
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
                                <Link href="/next_panel/users" className="btn btn-sm btn-outline-secondary mb-3">
                                    <ArrowLeft size={16} className="me-2" /> Back to Users
                                </Link>
                                <h1 className="h4 mb-2">Create User</h1>
                                <p className="text-muted mb-0">Add a new user account.</p>
                            </div>
                            <button className="btn btn-primary" type="submit" form="userForm" disabled={saving || loading}>
                                <Plus size={16} className="me-2" /> Create User
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading role options...</div>
                        ) : (
                            <form id="userForm" onSubmit={handleSubmit}>
                                {error && <div className="alert alert-danger">{error}</div>}

                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Role</label>
                                        <select className="form-select" value={values.role_id} onChange={handleChange("role_id")} required>
                                            <option value="">Select role</option>
                                            {roles.map((role) => (
                                                <option key={role.id} value={role.id}>{role.role_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Branch</label>
                                        <select className="form-select" value={values.branch_id} onChange={handleChange("branch_id")} required>
                                            <option value="">Select role</option>
                                            {branch.map((branch) => (
                                                <option key={branch.id} value={branch.id}>{branch.branch_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">First Name</label>
                                        <input className="form-control" value={values.first_name} onChange={handleChange("first_name")} required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Last Name</label>
                                        <input className="form-control" value={values.last_name} onChange={handleChange("last_name")} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Username</label>
                                        <input className="form-control" value={values.username} onChange={handleChange("username")} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Email</label>
                                        <input type="email" className="form-control" value={values.email} onChange={handleChange("email")} required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Password</label>
                                        <input type="password" className="form-control" value={values.password} onChange={handleChange("password")} required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Mobile</label>
                                        <input className="form-control" value={values.mobile} onChange={handleChange("mobile")} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Gender</label>
                                        <select className="form-select" value={values.gender} onChange={handleChange("gender")}>
                                            <option value="">Select gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Date of Birth</label>
                                        <input type="date" className="form-control" value={values.date_of_birth} onChange={handleChange("date_of_birth")} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Address</label>
                                        <input className="form-control" value={values.address} onChange={handleChange("address")} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">City</label>
                                        <input className="form-control" value={values.city} onChange={handleChange("city")} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">State</label>
                                        <input className="form-control" value={values.state} onChange={handleChange("state")} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Pincode</label>
                                        <input className="form-control" value={values.pincode} onChange={handleChange("pincode")} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Profile Image</label>
                                        <input type="file" accept="image/*" className="form-control" onChange={handleChange("profile_image")} />
                                    </div>
                                    {preview && (
                                        <div className="col-12">
                                            <div className="border rounded-3 p-3 d-inline-block">
                                                <img src={preview} alt="Preview" className="img-fluid rounded-3" style={{ maxHeight: 180 }} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
