"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import emailjs from '@emailjs/browser';

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-mono" });

// NOTE: point this at wherever your contact route.js actually lives in your app/api tree,
// e.g. "/api/contact" if the file sits at app/api/contact/route.js
const CONTACT_API_URL = "/api/contact";

const CONTACT_CHANNELS = [
    {
        code: "CALL",
        color: "#2f5fdb",
        tint: "rgba(47, 95, 219, 0.09)",
        title: "Call the Academy",
        detail: "+91 8285831503, 9971109868",
        sub: "Mon – Sat, 5am – 7pm",
    },
    {
        code: "MAIL",
        color: "#7c3aed",
        tint: "rgba(124, 58, 237, 0.09)",
        title: "Email Us",
        detail: "info@cstcricketacademy.com",
        sub: "We reply within two business day",
    },
    {
        code: "LOC",
        color: "#0d9488",
        tint: "rgba(13, 148, 136, 0.09)",
        title: "Visit the Nets",
        detail: "CST Cricket Academy Maruti Kunj, Sector 29",
        sub: "Gurugram, Haryana",
    },
];

const FAQ = [
    {
        q: "How soon will I hear back after enrolling?",
        a: "Our coordinators review new enquiries every morning and confirm seat availability within one business day.",
    },
    {
        q: "Can I switch programs after enrolling?",
        a: "Yes — let us know in the message field and we'll help you move into a better-fit program before your first session.",
    },
    {
        q: "Do you offer trial sessions?",
        a: "Most programs offer a single trial net session. Mention it in your message and a coach will get back to you.",
    },
];

function ContactPageInner() {
    const searchParams = useSearchParams();
    const programFromQuery = searchParams.get("program") || "";

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        program: programFromQuery,
        message: "",
    });
    const [status, setStatus] = useState("idle"); // idle | submitting | success | error
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (programFromQuery) {
            setForm((f) => ({ ...f, program: programFromQuery }));
        }
    }, [programFromQuery]);

    function update(field, value) {
        setForm((f) => ({ ...f, [field]: value }));
    }

    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
            setStatus("error");
            setErrorMsg("Please fill in your name, email and message before sending.");
            return;
        }
        if (!EMAIL_RE.test(form.email.trim())) {
            setStatus("error");
            setErrorMsg("Please enter a valid email address.");
            return;
        }

        setStatus("submitting");
        setErrorMsg("");

        const serviceId = "service_fswtfoy";
        const templateId = "template_djnso1s";
        const publicKey = "HSz0XtqlOkBUfR3l6";

        try {
            await emailjs.send(serviceId, templateId, form, publicKey);
            alert("Email sent successfully!");
            const res = await fetch(CONTACT_API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const json = await res.json().catch(() => ({}));

            if (!res.ok || json.success === false) {
                throw new Error(json.message || "Could not send your message. Please try again.");
            }

            setStatus("success");
            setForm({ name: "", email: "", phone: "", program: "", message: "" });
        } catch (err) {
            setStatus("error");
            setErrorMsg(err?.message || "Something went wrong. Please try again.");
        }
    }

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-xl-11 col-lg-11 col-md-11 col-sm-12 m-auto">
                    <div className={`page ${inter.variable} ${plexMono.variable}`}>
                        <section className="hero">
                            <p className="hero-eyebrow">The Academy</p>
                            <h1 className="hero-title">Get in Touch</h1>
                            <p className="hero-sub">
                                Questions about a program, seat availability, or trial sessions? Send us a message and a
                                coordinator will get back to you within one business day.
                            </p>
                        </section>

                        <section className="channel-grid">
                            {CONTACT_CHANNELS.map((c) => (
                                <div
                                    className="channel-card"
                                    key={c.code}
                                    style={{ "--card-accent": c.color, "--card-tint": c.tint }}
                                >
                                    <span className="channel-code">{c.code}</span>
                                    <h3>{c.title}</h3>
                                    <p className="channel-detail">{c.detail}</p>
                                    <p className="channel-sub">{c.sub}</p>
                                </div>
                            ))}
                        </section>

                        <div className="seam-divider" role="presentation" />

                        <section className="contact-layout">
                            <form className="contact-form" onSubmit={handleSubmit} noValidate>
                                <div className="form-head">
                                    <p className="eyebrow">Enquiry Form</p>
                                    <h2>Send us a message</h2>
                                    <p className="form-lead">
                                        {form.program
                                            ? `Enquiring about "${form.program}". Update it below if that's not right.`
                                            : "Tell us a bit about what you're looking for and we'll take it from there."}
                                    </p>
                                </div>

                                <div className="field-row">
                                    <label className="field">
                                        <span>Full name</span>
                                        <input
                                            type="text"
                                            value={form.name}
                                            onChange={(e) => update("name", e.target.value)}
                                            placeholder="Your name"
                                            required
                                        />
                                    </label>
                                    <label className="field">
                                        <span>Phone</span>
                                        <input
                                            type="tel"
                                            value={form.phone}
                                            onChange={(e) => update("phone", e.target.value)}
                                            placeholder="Optional"
                                        />
                                    </label>
                                </div>

                                <div className="field-row">
                                    <label className="field">
                                        <span>Email</span>
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => update("email", e.target.value)}
                                            placeholder="you@example.com"
                                            required
                                        />
                                    </label>
                                    <label className="field">
                                        <span>Program</span>
                                        <input
                                            type="text"
                                            value={form.program}
                                            onChange={(e) => update("program", e.target.value)}
                                            placeholder="e.g. Junior Cricket Program"
                                        />
                                    </label>
                                </div>

                                <label className="field">
                                    <span>Message</span>
                                    <textarea
                                        rows={5}
                                        value={form.message}
                                        onChange={(e) => update("message", e.target.value)}
                                        placeholder="Let us know what you'd like help with"
                                        required
                                    />
                                </label>

                                {status === "error" && <p className="form-alert form-alert-error">{errorMsg}</p>}
                                {status === "success" && (
                                    <p className="form-alert form-alert-success">
                                        Thanks — your message has been sent. We'll be in touch shortly.
                                    </p>
                                )}

                                <button type="submit" className="submit-btn" disabled={status === "submitting"}>
                                    {status === "submitting" ? "Sending…" : "Send message"}
                                </button>
                            </form>

                            <aside className="faq-panel">
                                <h3 className="why-heading">Common questions</h3>
                                <div className="faq-list">
                                    {FAQ.map((item) => (
                                        <div className="faq-item" key={item.q}>
                                            <p className="faq-q">{item.q}</p>
                                            <p className="faq-a">{item.a}</p>
                                        </div>
                                    ))}
                                </div>
                            </aside>
                        </section>

                        <style jsx global>{`
                            .page {
                                --ink: #1a1f2b;
                                --bg: #f4f5f7;
                                --card: #ffffff;
                                --accent: #2f5fdb;
                                --accent-dark: #24439f;
                                --border: rgba(20, 24, 33, 0.09);
                                --slate: #616a7a;
                                --slate-light: #8a93a3;
                                --amber: #b8720a;
                                --red: #c33b2f;
                                --green: #16794f;
                                font-family: var(--font-body), "Segoe UI", system-ui, sans-serif;
                                color: var(--ink);
                                background: var(--bg);
                                min-height: 100vh;
                                padding: 48px 24px 88px;
                                max-width: 100%;
                                margin: 0 auto;
                            }

                            .eyebrow {
                                font-size: 12.5px;
                                font-weight: 600;
                                letter-spacing: 0.06em;
                                text-transform: uppercase;
                                color: var(--slate-light);
                                margin: 0 0 8px;
                            }

                            .hero {
                                text-align: center;
                                max-width: 620px;
                                margin: 0 auto 44px;
                            }
                            .hero-eyebrow {
                                font-size: 13px;
                                font-weight: 600;
                                letter-spacing: 0.08em;
                                text-transform: uppercase;
                                color: var(--accent);
                                margin: 0 0 10px;
                            }
                            .hero-title {
                                font-size: clamp(30px, 4.5vw, 42px);
                                font-weight: 700;
                                letter-spacing: -0.02em;
                                margin: 0 0 14px;
                                line-height: 1.15;
                            }
                            .hero-sub {
                                color: var(--slate);
                                font-size: 16px;
                                line-height: 1.6;
                                margin: 0;
                            }

                            .channel-grid {
                                display: grid;
                                grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                                gap: 16px;
                                max-width: 1000px;
                                margin: 0 auto 40px;
                            }
                            .channel-card {
                                background: var(--card);
                                border: 1px solid var(--border);
                                border-top: 3px solid var(--card-accent, var(--accent));
                                border-radius: 14px;
                                padding: 22px 20px;
                                transition: border-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
                            }
                            .channel-card:hover {
                                border-color: var(--card-accent, var(--accent));
                                border-top-color: var(--card-accent, var(--accent));
                                transform: translateY(-3px);
                                box-shadow: 0 12px 24px -16px rgba(15, 18, 26, 0.3);
                            }
                            .channel-code {
                                display: inline-flex;
                                align-items: center;
                                justify-content: center;
                                min-width: 34px;
                                height: 26px;
                                padding: 0 8px;
                                border-radius: 7px;
                                background: var(--card-tint, rgba(47, 95, 219, 0.08));
                                color: var(--card-accent, var(--accent-dark));
                                font-family: var(--font-mono), monospace;
                                font-size: 12px;
                                font-weight: 600;
                                letter-spacing: 0.02em;
                                margin-bottom: 14px;
                            }
                            .channel-card h3 {
                                font-size: 16px;
                                font-weight: 700;
                                letter-spacing: -0.01em;
                                margin: 0 0 8px;
                                line-height: 1.3;
                            }
                            .channel-detail {
                                font-family: var(--font-mono), monospace;
                                font-size: 13.5px;
                                font-weight: 600;
                                color: var(--ink);
                                margin: 0 0 4px;
                            }
                            .channel-sub {
                                color: var(--slate);
                                font-size: 13px;
                                margin: 0;
                            }

                            .seam-divider {
                                position: relative;
                                height: 1px;
                                background: var(--border);
                                margin: 8px auto 44px;
                                max-width: 1000px;
                            }
                            .seam-divider::before {
                                content: "";
                                position: absolute;
                                left: 0;
                                right: 0;
                                top: -5px;
                                height: 11px;
                                background-image: repeating-linear-gradient(
                                    112deg,
                                    var(--accent) 0px,
                                    var(--accent) 2px,
                                    transparent 2px,
                                    transparent 15px
                                );
                                opacity: 0.32;
                                pointer-events: none;
                            }

                            .contact-layout {
                                display: grid;
                                grid-template-columns: 1.5fr 1fr;
                                gap: 24px;
                                max-width: 1000px;
                                margin: 0 auto;
                                align-items: start;
                            }
                            @media (max-width: 860px) {
                                .contact-layout {
                                    grid-template-columns: 1fr;
                                }
                            }

                            .contact-form {
                                background: var(--card);
                                border: 1px solid var(--border);
                                border-radius: 16px;
                                padding: 28px 30px 30px;
                            }
                            .form-head h2 {
                                font-size: 22px;
                                font-weight: 700;
                                letter-spacing: -0.01em;
                                margin: 0 0 8px;
                            }
                            .form-lead {
                                color: var(--slate);
                                font-size: 14px;
                                line-height: 1.6;
                                margin: 0 0 24px;
                            }

                            .field-row {
                                display: grid;
                                grid-template-columns: 1fr 1fr;
                                gap: 16px;
                            }
                            @media (max-width: 480px) {
                                .field-row {
                                    grid-template-columns: 1fr;
                                }
                            }

                            .field {
                                display: flex;
                                flex-direction: column;
                                gap: 6px;
                                margin-bottom: 18px;
                            }
                            .field span {
                                font-size: 13px;
                                font-weight: 600;
                                color: var(--ink);
                            }
                            .field input,
                            .field textarea {
                                font-family: var(--font-body), sans-serif;
                                font-size: 14px;
                                padding: 11px 14px;
                                border-radius: 10px;
                                border: 1px solid var(--border);
                                background: var(--bg);
                                color: var(--ink);
                                resize: vertical;
                            }
                            .field input:focus,
                            .field textarea:focus {
                                outline: 2px solid var(--accent);
                                outline-offset: 1px;
                                background: var(--card);
                            }

                            .form-alert {
                                font-size: 13.5px;
                                line-height: 1.5;
                                padding: 10px 14px;
                                border-radius: 10px;
                                margin: 4px 0 18px;
                            }
                            .form-alert-error {
                                background: rgba(195, 59, 47, 0.08);
                                color: var(--red);
                                border: 1px solid rgba(195, 59, 47, 0.2);
                            }
                            .form-alert-success {
                                background: rgba(22, 121, 79, 0.08);
                                color: var(--green);
                                border: 1px solid rgba(22, 121, 79, 0.2);
                            }

                            .submit-btn {
                                font-family: var(--font-body), sans-serif;
                                font-size: 14px;
                                font-weight: 600;
                                padding: 12px 22px;
                                border-radius: 10px;
                                border: none;
                                background: var(--accent);
                                color: #ffffff;
                                cursor: pointer;
                                transition: background 0.15s ease;
                                width: 100%;
                            }
                            .submit-btn:hover:not(:disabled) {
                                background: var(--accent-dark);
                            }
                            .submit-btn:disabled {
                                background: var(--slate-light);
                                cursor: not-allowed;
                            }
                            .submit-btn:focus-visible {
                                outline: 2px solid var(--accent-dark);
                                outline-offset: 2px;
                            }

                            .faq-panel {
                                background: linear-gradient(180deg, rgba(47, 95, 219, 0.05), rgba(47, 95, 219, 0.02));
                                border: 1px solid rgba(47, 95, 219, 0.14);
                                border-radius: 16px;
                                padding: 26px 26px 28px;
                            }
                            .why-heading {
                                font-size: 17px;
                                font-weight: 700;
                                letter-spacing: -0.01em;
                                margin: 0 0 18px;
                            }
                            .faq-list {
                                display: flex;
                                flex-direction: column;
                                gap: 18px;
                            }
                            .faq-q {
                                font-size: 14px;
                                font-weight: 600;
                                margin: 0 0 6px;
                            }
                            .faq-a {
                                font-size: 13.5px;
                                line-height: 1.6;
                                color: var(--slate);
                                margin: 0;
                            }

                            @media (prefers-reduced-motion: reduce) {
                                .channel-card,
                                .submit-btn {
                                    transition: none;
                                }
                            }
                        `}</style>
                    </div>
                </div>
            </div>
        </div>
    );
}

const Page = () => {
    return (
        <Suspense fallback={null}>
            <ContactPageInner />
        </Suspense>
    );
};

export default Page;