"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { User, Mail, Lock } from "lucide-react";

export default function RegisterPage() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [profilePreview, setProfilePreview] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        setError(null);

        try {
            const form = new FormData(e.target);

            // Ensure required fields exist
            if (!form.get("role_id")) form.set("role_id", "2");

            const res = await fetch("/api/auth/register", {
                method: "POST",
                body: form,
            });
            const json = await res.json();
            if (res.ok && json.success) {
                setMessage(json.message || "Registered successfully");
                e.target.reset();
                setProfilePreview(null);
            } else {
                setError(json.message || "Registration failed");
            }
        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        return () => {
            if (profilePreview) URL.revokeObjectURL(profilePreview);
        };
    }, [profilePreview]);

    const handleImageChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            if (profilePreview) URL.revokeObjectURL(profilePreview);
            const url = URL.createObjectURL(file);
            setProfilePreview(url);
        } else {
            setProfilePreview(null);
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h3 className="card-title mb-3">Register</h3>

                            {message && <div className="alert alert-success">{message}</div>}
                            {error && <div className="alert alert-danger">{error}</div>}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Role</label>
                                    <select name="role_id" className="form-select" defaultValue="2" required>
                                        <option value="7">User</option>
                                        <option value="2">Student</option>
                                        <option value="3">Coach</option>
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Full name</label>
                                    <div className="input-group">
                                        <span className="input-group-text"><User size={16} /></span>
                                        <input name="first_name" type="text" className="form-control" placeholder="First name" required />
                                        <input name="last_name" type="text" className="form-control" placeholder="Last name" />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Username</label>
                                    <div className="input-group">
                                        <span className="input-group-text">@</span>
                                        <input name="username" type="text" className="form-control" placeholder="username" />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <div className="input-group">
                                        <span className="input-group-text"><Mail size={16} /></span>
                                        <input name="email" type="email" className="form-control" placeholder="you@example.com" required />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Mobile</label>
                                    <input name="mobile" type="tel" className="form-control" placeholder="Mobile number" />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Profile image</label>
                                    <div className="d-flex align-items-center gap-3">
                                        <div style={{ width: 80, height: 80 }}>
                                            {profilePreview ? (
                                                <Image src={profilePreview} alt="preview" width={80} height={80} unoptimized className="img-thumbnail" style={{ objectFit: 'cover' }} />
                                            ) : (
                                                <div className="border rounded d-flex align-items-center justify-content-center bg-light" style={{ width: '80px', height: '80px' }}>
                                                    <User size={28} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-grow-1">
                                            <input name="profile_image" onChange={handleImageChange} type="file" accept="image/*" className="form-control" />
                                            <div className="form-text">Optional. Max file size enforced server-side.</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Password</label>
                                    <div className="input-group">
                                        <span className="input-group-text"><Lock size={16} /></span>
                                        <input name="password" type="password" className="form-control" placeholder="Password" required />
                                    </div>
                                </div>

                                <div className="d-grid">
                                    <button className="btn btn-primary" type="submit" disabled={loading}>
                                        {loading ? "Registering..." : "Register"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
