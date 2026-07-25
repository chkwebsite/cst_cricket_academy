"use client";
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

const CoachingProgram = ({ data, loading }) => {
    // const [coachingProgram, setCoachingProgram] = useState([]);
    // const [loading, setLoading] = useState(true);
    // const [error, setError] = useState(null);

    // useEffect(() => {
    //     async function loadCoFounders() {
    //         try {
    //             const res = await fetch("/api/coaching-program");
    //             const json = await res.json();
    //             if (!res.ok) throw new Error(json.message || "Unable to load coaching Program.");
    //             setCoachingProgram(json.data || []);
    //         } catch (err) {
    //             setError(err.message);
    //         } finally {
    //             setLoading(false);
    //         }
    //     }

    //     loadCoFounders();
    // }, []);

    const sectionRef = useRef(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const node = sectionRef.current;
        if (!node) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.15 }
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    return (
        <section ref={sectionRef} className={`programs-section bg-warning-subtle py-5 ${inView ? "in-view" : ""}`}>
            <div className="col-xl-11 col-lg-11 col-md-11 col-sm-12 m-auto">
                <div className="text-center mb-5">
                    <div className="d-inline-flex align-items-center gap-2 mb-2">
                        <span className="section-rule"></span>
                        <span className="theme_color fw-semibold text-uppercase small">What We Offer</span>
                        <span className="section-rule"></span>
                    </div>
                    <h1 className="fw-bolder mb-2">Coaching Program</h1>
                    <p className="text-secondary mb-0 mx-auto" style={{ maxWidth: 520 }}>
                        Choose a track built around your goals, from first-timer basics to competitive match play.
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-5 text-muted">Loading coaching Program...</div>
                ) : data.length === 0 ? (
                    <div className="text-center py-5 text-muted">No coaching Program found yet.</div>
                ) : (
                    <div className="row g-4">
                        {data.map((item, index) => (
                            <div className="col-xl-3 col-lg-3 col-md-4 col-sm-6" key={index}>
                                <Link href={`/home/${item.id}/CoachingProgram`} className="program-card d-block">
                                    <div style={{ position: 'relative', width: '100%', height: '280px' }}>
                                        <Image src={item.program_image} alt={item.title} fill className="program-card-img" />
                                        <div className="program-card-overlay"></div>
                                        <div className="program-card-content">
                                            <h4 className="fw-bold mb-1">{item.title}</h4>
                                            <span className="program-card-cta">
                                                Explore Program <ArrowUpRight size={15} />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                .section-rule {
                    display: inline-block;
                    width: 24px;
                    height: 2px;
                    background: #009688;
                    opacity: 0.5;
                }

                .program-card {
                    display: block;
                    border-radius: 16px;
                    overflow: hidden;
                    text-decoration: none;
                    box-shadow: 0 12px 30px -18px rgba(0,0,0,0.3);
                    transition: transform 0.35s ease, box-shadow 0.35s ease;
                }

                .program-card:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 20px 38px -16px rgba(0,0,0,0.35);
                }

                .program-card-img {
                    object-fit: cover;
                    transition: transform 0.5s ease;
                }

                .program-card:hover .program-card-img {
                    transform: scale(1.08);
                }

                .program-card-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.75) 100%);
                    transition: background 0.35s ease;
                }

                .program-card:hover .program-card-overlay {
                    background: linear-gradient(180deg, rgba(0,0,0,0.05) 20%, rgba(0,0,0,0.85) 100%);
                }

                .program-card-content {
                    position: absolute;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    padding: 1.1rem 1.25rem;
                    color: #fff;
                }

                .program-card-cta {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.3rem;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: #fff;
                    opacity: 0;
                    transform: translateY(6px);
                    transition: opacity 0.3s ease, transform 0.3s ease;
                }

                .program-card:hover .program-card-cta {
                    opacity: 1;
                    transform: translateY(0);
                }

                .programs-section .row.g-4 > div {
                    opacity: 0;
                    transform: translateY(24px);
                    transition: opacity 0.6s ease, transform 0.6s ease;
                }

                .programs-section.in-view .row.g-4 > div {
                    opacity: 1;
                    transform: translateY(0);
                }

                .programs-section.in-view .row.g-4 > div:nth-child(1) { transition-delay: 0.05s; }
                .programs-section.in-view .row.g-4 > div:nth-child(2) { transition-delay: 0.1s; }
                .programs-section.in-view .row.g-4 > div:nth-child(3) { transition-delay: 0.15s; }
                .programs-section.in-view .row.g-4 > div:nth-child(4) { transition-delay: 0.2s; }
                .programs-section.in-view .row.g-4 > div:nth-child(n+5) { transition-delay: 0.25s; }

                @media (prefers-reduced-motion: reduce) {
                    .programs-section .row.g-4 > div {
                        opacity: 1;
                        transform: none;
                        transition: none;
                    }
                }
            `}</style>
        </section>
    )
}

export default CoachingProgram
