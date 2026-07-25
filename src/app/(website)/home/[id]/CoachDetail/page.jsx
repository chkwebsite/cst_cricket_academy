"use client";
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
// import CommonCompo from '../../../../../components/website/CommonCompo';
import CommonCompo from '@/components/website/CommonCompo';
const SOCIALS = [
    { key: 'website_url', label: 'Website' },
    { key: 'linkedin_url', label: 'LinkedIn' },
    { key: 'instagram_url', label: 'Instagram' },
    { key: 'facebook_url', label: 'Facebook' },
    { key: 'twitter_url', label: 'Twitter' },
    { key: 'youtube_url', label: 'YouTube' },
];

const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const Page = () => {
    const { id } = useParams();
    const router = useRouter();
    const [single_cd, setSingle_Cd] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) return;

        const singleCoachProfile = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/profile/${id}`);
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || "Unable to load profile.");
                setSingle_Cd(json.data || null);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        singleCoachProfile();
    }, [id]);

    if (loading) {
        return (
            <div className="state-screen">
                <div className="spinner" />
                <p>Loading profile…</p>
                <style jsx>{`
                    .state-screen { min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; font-family: 'Inter', sans-serif; color: #22231f; }
                    .spinner { width: 34px; height: 34px; border: 3px solid #e4ddc9; border-top-color: #a6332b; border-radius: 50%; animation: spin 0.8s linear infinite; }
                    @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    if (error) {
        return (
            <div className="state-screen">
                <p className="err">{error}</p>
                <button onClick={() => router.back()} className="ghost-btn">&larr; Go back</button>
                <style jsx>{`
                    .state-screen { min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; font-family: 'Inter', sans-serif; }
                    .err { color: #a6332b; font-weight: 600; }
                    .ghost-btn { border: 1px solid #22231f; background: transparent; padding: 8px 18px; border-radius: 999px; cursor: pointer; font-family: 'Inter', sans-serif; }
                `}</style>
            </div>
        );
    }

    if (!single_cd) {
        return (
            <div className="state-screen">
                <p>No profile found.</p>
                <style jsx>{`.state-screen { min-height: 60vh; display: flex; align-items: center; justify-content: center; font-family: 'Inter', sans-serif; }`}</style>
            </div>
        );
    }

    const fullName = `${single_cd.first_name || ''} ${single_cd.last_name || ''}`.trim();
    const socialLinks = SOCIALS.filter(s => single_cd[s.key]);

    return (
        <div className="row bg-warning-subtle">
            <div className="col-xl-11 col-lg-11 col-md-11 col-sm-12 m-auto py-5">
                <div className="cp-wrap">
                    <link rel="preconnect" href="https://fonts.googleapis.com" />
                    <link
                        href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap"
                        rel="stylesheet"
                    />

                    {/* Hero */}
                    <section className="hero" style={{
                        backgroundImage: `url(${single_cd.profile_image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                    }}>
                        <Image
                            src={single_cd.profile_image}
                            alt={fullName}
                            fill
                            style={{ objectFit: 'contain' }}
                            priority
                        />
                        <div className="hero-scrim" />
                        <div className="hero-content">
                            <button onClick={() => router.back()} className="back-btn">&larr; Back Coaches</button>
                            <div className="eyebrow">
                                {single_cd.designation}{single_cd.sub_designation ? ` · ${single_cd.sub_designation}` : ''}
                            </div>
                            <h1 className="title">{fullName}</h1>
                            <p className="role-title">{single_cd.title}</p>
                            <div className="coach-line">
                                <span>{single_cd.branch_name}</span>
                                {single_cd.date_of_joining && (
                                    <>
                                        <span className="dot">•</span>
                                        <span>Since {formatDate(single_cd.date_of_joining)}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Credentials plate */}
                    <section className="ticket">
                        <div className="ticket-main">
                            <div className="stat-grid">
                                <div className="stat">
                                    <span className="stat-label">Experience</span>
                                    <span className="stat-value">{single_cd.experience}</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-label">Qualification</span>
                                    <span className="stat-value">{single_cd.qualification}</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-label">Specialization</span>
                                    <span className="stat-value small">{single_cd.specialization}</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-label">Branch</span>
                                    <span className="stat-value">{single_cd.branch_name}</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-label">Email</span>
                                    <span className="stat-value small">{single_cd.email}</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-label">Mobile</span>
                                    <span className="stat-value small">{single_cd.mobile}</span>
                                </div>
                            </div>

                            {socialLinks.length > 0 && (
                                <div className="social-row">
                                    {socialLinks.map(s => (
                                        <a
                                            key={s.key}
                                            href={single_cd[s.key]}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="social-pill"
                                        >
                                            {s.label}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="perforation" aria-hidden="true">
                            {Array.from({ length: 22 }).map((_, i) => <span key={i} />)}
                        </div>

                        <div className="ticket-stub">
                            <span className="fees-label">Achievements</span>
                            <span className="fees-value small-value">{single_cd.achievements}</span>
                        </div>
                    </section>

                    {/* About */}
                    {single_cd.about_me && (
                        <section className="about">
                            <h2>About the Coach</h2>
                            <div
                                className="about-body"
                                dangerouslySetInnerHTML={{ __html: single_cd.about_me }}
                            />
                        </section>
                    )}

                    {/* Academy description */}
                    {single_cd.description && (
                        <section className="about">
                            <h2>The Academy</h2>
                            <div
                                className="about-body"
                                dangerouslySetInnerHTML={{ __html: single_cd.description }}
                            />
                        </section>
                    )}

                    <style jsx>{`
                .cp-wrap {
                   font-family: 'Inter', sans-serif;
                    color: #22231f;
                    background: #fff6da;
                    max-width: 100%;
                    margin: 0 auto;
                    padding-bottom: 64px;
                }

                .hero {
                    position: relative;
                    height: 420px;
                    overflow: hidden;
                }
                .hero-scrim {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(180deg, rgba(22,48,31,0.15) 0%, rgba(17,26,19,0.55) 55%, rgba(12,18,13,0.92) 100%);
                }
                .hero-content {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                    padding: 24px 28px 28px;
                    color: #f6f1e4;
                }
                .back-btn {
                    align-self: flex-start;
                    background: rgba(246,241,228,0.12);
                    border: 1px solid rgba(246,241,228,0.4);
                    color: #f6f1e4;
                    padding: 6px 16px;
                    border-radius: 999px;
                    font-size: 0.85rem;
                    cursor: pointer;
                    margin-bottom: auto;
                    backdrop-filter: blur(4px);
                }
                .back-btn:hover { background: rgba(246,241,228,0.22); }
                .eyebrow {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 0.78rem;
                    letter-spacing: 0.14em;
                    text-transform: uppercase;
                    color: #c79a2e;
                    margin-bottom: 8px;
                }
                .title {
                    font-family: 'Anton', sans-serif;
                    font-weight: 400;
                    font-size: clamp(2.2rem, 6vw, 3.6rem);
                    line-height: 0.98;
                    letter-spacing: 0.01em;
                    text-transform: uppercase;
                    margin: 0 0 6px;
                }
                .role-title {
                    font-size: 1.02rem;
                    color: #f6f1e4;
                    margin: 0 0 10px;
                    font-weight: 600;
                }
                .coach-line {
                    font-size: 0.9rem;
                    color: #d8d2be;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    align-items: center;
                }
                .dot { opacity: 0.5; }

                .ticket {
                    margin: -28px 20px 0;
                    background: #fffdf7;
                    border: 1px solid #e4ddc9;
                    border-radius: 14px;
                    box-shadow: 0 18px 40px rgba(22,48,31,0.16);
                    display: flex;
                    position: relative;
                    z-index: 2;
                    overflow: hidden;
                }
                .ticket-main { flex: 1; padding: 26px 24px; }
                .stat-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 18px 20px;
                }
                .stat { display: flex; flex-direction: column; gap: 4px; }
                .stat-label {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 0.68rem;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    color: #8a8368;
                }
                .stat-value {
                    font-family: 'JetBrains Mono', monospace;
                    font-weight: 600;
                    font-size: 1.02rem;
                    color: #16301f;
                }
                .stat-value.small { font-size: 0.86rem; line-height: 1.3; }

                .social-row {
                    margin-top: 22px;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }
                .social-pill {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 0.72rem;
                    letter-spacing: 0.04em;
                    text-transform: uppercase;
                    color: #16301f;
                    border: 1px solid #e4ddc9;
                    background: #f6f1e4;
                    padding: 6px 14px;
                    border-radius: 999px;
                    text-decoration: none;
                    transition: background 0.2s ease, transform 0.2s ease;
                }
                .social-pill:hover {
                    background: #16301f;
                    color: #f6f1e4;
                    transform: translateY(-2px);
                }

                .perforation {
                    display: flex;
                    flex-direction: column;
                    justify-content: space-evenly;
                    align-items: center;
                    padding: 8px 0;
                }
                .perforation span {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: #f6f1e4;
                    border: 1px solid #e4ddc9;
                }

                .ticket-stub {
                    width: 200px;
                    background: #16301f;
                    color: #f6f1e4;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 24px 18px;
                    text-align: center;
                }
                .fees-label {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 0.7rem;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    color: #a9c2ab;
                }
                .fees-value {
                    font-family: 'Anton', sans-serif;
                    font-size: 1.5rem;
                    color: #c79a2e;
                    line-height: 1.15;
                    text-transform: uppercase;
                }
                .fees-value.small-value { font-size: 1.15rem; }

                .about { padding: 44px 24px 0; }
                .about h2 {
                    font-family: 'Anton', sans-serif;
                    font-weight: 400;
                    text-transform: uppercase;
                    letter-spacing: 0.02em;
                    font-size: 1.5rem;
                    color: #16301f;
                    margin: 0 0 16px;
                }
                .about-body { font-size: 1rem; line-height: 1.75; color: #3a3a34; }
                .about-body :global(strong) { color: #16301f; }
                .about-body :global(p) { margin: 0 0 14px; }
                .about-body :global(br) { display: block; content: ''; margin-top: 6px; }

                @media (max-width: 640px) {
                    .hero { height: 380px; }
                    .ticket { flex-direction: column; margin: -20px 14px 0; }
                    .stat-grid { grid-template-columns: repeat(2, 1fr); }
                    .perforation { flex-direction: row; padding: 0 8px; }
                    .ticket-stub { width: auto; flex-direction: row; justify-content: space-between; padding: 18px 20px; text-align: left; }
                    .about { padding: 36px 14px 0; }
                }
            `}</style>
                </div>
            </div>
            <CommonCompo />
        </div>
    );
};

export default Page;

