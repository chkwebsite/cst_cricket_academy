"use client";
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import CommonCompo from '@/components/website/CommonCompo';
// const formatDate = (iso) => {
//     if (!iso) return '';
//     return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
// };

// const formatTime = (t) => {
//     if (!t) return '';
//     const [h, m] = t.split(':');
//     const hour = parseInt(h, 10);
//     const suffix = hour >= 12 ? 'PM' : 'AM';
//     const hr12 = ((hour + 11) % 12) + 1;
//     return `${hr12}:${m} ${suffix}`;
// };

const Page = () => {
    const { id } = useParams();
    const router = useRouter();
    const [single_cp, setSingle_Cp] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) return;

        const singleCoachingProgram = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/experts/${id}`);
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || "Unable to load coaching Program.");
                setSingle_Cp(json.data || null);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        singleCoachingProgram();
    }, [id]);

    if (loading) {
        return (
            <div className="state-screen">
                <div className="spinner" />
                <p>Loading Expert details…</p>
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

    if (!single_cp) {
        return (
            <div className="state-screen">
                <p>No Expert found.</p>
                <style jsx>{`.state-screen { min-height: 60vh; display: flex; align-items: center; justify-content: center; font-family: 'Inter', sans-serif; }`}</style>
            </div>
        );
    }

    const seatsLeft = single_cp.available_seats;
    const seatsTotal = single_cp.total_seats;
    const seatsPct = seatsTotal ? Math.max(4, Math.round((seatsLeft / seatsTotal) * 100)) : 0;
    const coachName = `${single_cp.first_name || ''} ${single_cp.last_name || ''}`.trim();

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
                    <section
                        className="hero"
                        style={{
                            backgroundImage: `url(${single_cp.profile_image})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                        }}
                    >
                        <Image
                            src={single_cp.profile_image}
                            alt={single_cp.designation}
                            fill
                            style={{ objectFit: "contain" }}
                            priority
                        />

                        <div className="hero-scrim" />

                        <div className="hero-content">
                            <button
                                onClick={() => router.back()}
                                className="back-btn"
                            >
                                &larr; Back to Expert
                            </button>

                            <div className="eyebrow">
                                {single_cp.designation}
                            </div>

                            <h1 className="title">
                                {single_cp.expert_name}
                            </h1>
                        </div>
                    </section>



                    {/* About */}
                    <section className="about">
                        <h2>About the Expert</h2>
                        <div
                            className="about-body"
                            dangerouslySetInnerHTML={{ __html: single_cp.about || '' }}
                        />
                    </section>

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
                    margin: 0 0 12px;
                }
                .coach-line {
                    font-size: 0.92rem;
                    color: #d8d2be;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    align-items: center;
                }
                .coach-name { font-weight: 700; color: #f6f1e4; }
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

                .seats-row { margin-top: 22px; display: flex; align-items: center; gap: 14px; }
                .seats-track { flex: 1; height: 6px; background: #e4ddc9; border-radius: 4px; overflow: hidden; }
                .seats-fill { height: 100%; background: #a6332b; border-radius: 4px; }
                .seats-text { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: #16301f; white-space: nowrap; }

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
                    width: 190px;
                    background: #16301f;
                    color: #f6f1e4;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    padding: 24px 16px;
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
                    font-size: 1.9rem;
                    color: #c79a2e;
                    line-height: 1;
                }
                .book-btn {
                    margin-top: 10px;
                    background: #a6332b;
                    color: #fffdf7;
                    border: none;
                    padding: 10px 18px;
                    border-radius: 999px;
                    font-weight: 600;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: transform 0.2s ease, background 0.2s ease;
                }
                .book-btn:hover { background: #8e2924; transform: translateY(-2px); }

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

                @media (max-width: 640px) {
                    .hero { height: 340px; }
                    .ticket { flex-direction: column; margin: -20px 14px 0; }
                    .stat-grid { grid-template-columns: repeat(2, 1fr); }
                    .perforation { flex-direction: row; padding: 0 8px; }
                    .ticket-stub { width: auto; flex-direction: row; justify-content: space-between; padding: 18px 20px; }
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
