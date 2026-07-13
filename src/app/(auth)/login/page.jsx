"use client";

import { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "same-origin",
                body: JSON.stringify({ email, password }),
            });
            const json = await res.json();

            if (res.ok && json.success) {
                if (json.token) {
                    sessionStorage.setItem("token", json.token);
                }
                if (json.user) {
                    sessionStorage.setItem("user", JSON.stringify(json.user));
                }
                router.push("/next_panel/dashboard");
            } else {
                setError(json.message || "Login failed");
            }
        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-5">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h3 className="card-title mb-3">Login</h3>
                            {error && <div className="alert alert-danger">{error}</div>}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <div className="input-group">
                                        <span className="input-group-text"><Mail size={16} /></span>
                                        <input value={email} onChange={(e) => setEmail(e.target.value)} name="email" type="email" className="form-control" placeholder="you@example.com" required />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Password</label>
                                    <div className="input-group">
                                        <span className="input-group-text"><Lock size={16} /></span>
                                        <input value={password} onChange={(e) => setPassword(e.target.value)} name="password" type="password" className="form-control" placeholder="Password" required />
                                    </div>
                                </div>

                                <div className="d-grid">
                                    <button className="btn btn-primary" type="submit" disabled={loading}>
                                        {loading ? "Logging in..." : "Login"}
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
