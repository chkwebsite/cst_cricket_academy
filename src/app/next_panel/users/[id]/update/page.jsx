"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

const page = () => {
    const [roles, setRoles] = useState([]);
    const [branch, setBranch] = useState([]);
    const [values, setValues] = useState({
        role_id: "",
        branch_id: "",
        first_name: "",
        last_name: "",
        username: "",
        email: "",
        mobile: "",
        profile_image: "",
        gender: "",
        date_of_birth: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        status: 1,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();
    // const params = useParams();
    const { id } = useParams();

    useEffect(() => {
        async function loadData() {
            try {
                const [rolesRes, branchRes, userRes] = await Promise.all([
                    fetch("/api/roles"),
                    fetch("/api/branch"),
                    fetch(`/api/users/${id}`),
                ]);

                const rolesJson = await rolesRes.json();
                const branchJson = await branchRes.json();
                const userJson = await userRes.json();


                if (!rolesRes.ok) throw new Error(rolesJson.message || "Unable to load roles.");
                if (!branchRes.ok) throw new Error(branchJson.message || "Unable to load Branch.");
                if (!userRes.ok) throw new Error(userJson.message || "Unable to load user.");

                setRoles(rolesJson.data || []);
                setBranch(branchJson.data || []);
                setValues({
                    role_id: userJson.data.role_id || "",
                    branch_id: userJson.data.branch_id || "",
                    first_name: userJson.data.first_name || "",
                    last_name: userJson.data.last_name || "",
                    username: userJson.data.username || "",
                    email: userJson.data.email || "",
                    mobile: userJson.data.mobile || "",
                    profile_image: userJson.data.profile_image || "",
                    gender: userJson.data.gender || "",
                    date_of_birth: userJson.data.date_of_birth || "",
                    address: userJson.data.address || "",
                    city: userJson.data.city || "",
                    state: userJson.data.state || "",
                    pincode: userJson.data.pincode || "",
                    status: userJson.data.status || 0,
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [id]);

    const handleChange = (key) => (e) => {
        const value = key === "role_id" || key === "status" ? Number(e.target.value) : e.target.value;
        setValues((prev) => ({ ...prev, [key]: value }));
    };
    const payload = {
        ...values,
        date_of_birth: values.date_of_birth
            ? values.date_of_birth.split("T")[0]
            : "",
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const res = await fetch(`/api/users/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Unable to update user.");
            router.push(`/next_panel/users/${id}`);
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
                                <h1 className="h4 mb-2">Edit User</h1>
                                <p className="text-muted mb-0">Update the user account details.</p>
                            </div>
                            <button className="btn btn-primary" type="submit" form="userForm" disabled={saving || loading}>
                                <Save size={16} className="me-2" /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        {loading ? (
                            <div className="text-center py-5 text-muted">Loading user data...</div>
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
                                            <option value="">Select Branch</option>
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
                                        <input type="date" className="form-control" value={values.date_of_birth.split("T")[0]} onChange={handleChange("date_of_birth")} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Address</label>
                                        <input className="form-control" value={values.address} onChange={handleChange("address")} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">City</label>
                                        <input className="form-control" value={values.city} onChange={handleChange("city")} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">State</label>
                                        <input className="form-control" value={values.state} onChange={handleChange("state")} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Pincode</label>
                                        <input className="form-control" value={values.pincode} onChange={handleChange("pincode")} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Profile Image URL</label>
                                        <input className="form-control" value={values.profile_image} onChange={handleChange("profile_image")} placeholder="/images/uploads/users/filename.jpg" />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Status</label>
                                        <select className="form-select" value={values.status} onChange={handleChange("status")}>
                                            <option value={1}>Active</option>
                                            <option value={0}>Inactive</option>
                                        </select>
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default page

