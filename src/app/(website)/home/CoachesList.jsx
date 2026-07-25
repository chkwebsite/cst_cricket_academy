"use client";
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image';

const CoachesList = ({ data, loading }) => {
    // const [coachList, setCoachList] = useState([]);
    // const [loading, setLoading] = useState(true);
    // const [error, setError] = useState(null);

    // useEffect(() => {
    //     async function loadCoachesList() {
    //         try {
    //             const res = await fetch("/api/profile?profile_type=0");
    //             const json = await res.json();
    //             if (!res.ok) throw new Error(json.message || "Unable to load coaching Program.");
    //             setCoachList(json.data || []);
    //         } catch (err) {
    //             setError(err.message);
    //         } finally {
    //             setLoading(false);
    //         }
    //     }

    //     loadCoachesList();
    // }, []);
    //console.log("coachList", coachList);
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
        <section ref={sectionRef} className={`coaches-section bg-info-subtle py-5 ${inView ? "in-view" : ""}`}>
            <div className="col-xl-11 col-lg-11 col-md-11 col-sm-12 m-auto">
                <div className="text-center mb-5">
                    <div className="d-inline-flex align-items-center gap-2 mb-2">
                        <span className="section-rule"></span>
                        <span className="theme_color fw-semibold text-uppercase small">Meet The Team</span>
                        <span className="section-rule"></span>
                    </div>
                    <h1 className="fw-bolder mb-2">Our Elite Coaches</h1>
                    <p className="text-secondary mb-0 mx-auto" style={{ maxWidth: 520 }}>
                        Certified coaches guiding every batch, at every branch, through structured game-ready programs.
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-5 text-muted">Loading Our Elite Coaches...</div>
                ) : data.length === 0 ? (
                    <div className="text-center py-5 text-muted">No Our Elite Coaches found yet.</div>
                ) : (
                    <div className="row g-4">
                        {data.map((item, index) => (
                            <div className="col-xl-3 col-lg-3 col-md-4 col-sm-6" key={index}>
                                <div className="card border-0 bg-transparent shadow-none extra people-card">
                                    <Link href={`/home/${item.id}/CoachDetail`} className='stretched-link'>
                                        <div style={{ position: 'relative', width: '100%', height: '250px' }}>
                                            <Image src={item.profile_image} alt={item.title} fill className='profile_img' />
                                        </div>
                                        <div className="card-body text-center">
                                            <h4 className='fw-bold text-center mb-1'>{item.first_name} {item.last_name}</h4>
                                            {item.designation && (
                                                <span className="people-badge">{item.designation}</span>
                                            )}
                                        </div>
                                    </Link>
                                </div>
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

                .people-card {
                    padding-top: 55px;
                }

                .people-badge {
                    display: inline-block;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #009688;
                    background: rgba(0, 150, 136, 0.1);
                    padding: 0.3rem 0.85rem;
                    border-radius: 999px;
                    margin-top: 0.25rem;
                }

                .coaches-section .row.g-4 > div {
                    opacity: 0;
                    transform: translateY(24px);
                    transition: opacity 0.6s ease, transform 0.6s ease;
                }

                .coaches-section.in-view .row.g-4 > div {
                    opacity: 1;
                    transform: translateY(0);
                }

                .coaches-section.in-view .row.g-4 > div:nth-child(1) { transition-delay: 0.05s; }
                .coaches-section.in-view .row.g-4 > div:nth-child(2) { transition-delay: 0.1s; }
                .coaches-section.in-view .row.g-4 > div:nth-child(3) { transition-delay: 0.15s; }
                .coaches-section.in-view .row.g-4 > div:nth-child(4) { transition-delay: 0.2s; }
                .coaches-section.in-view .row.g-4 > div:nth-child(n+5) { transition-delay: 0.25s; }

                @media (prefers-reduced-motion: reduce) {
                    .coaches-section .row.g-4 > div {
                        opacity: 1;
                        transform: none;
                        transition: none;
                    }
                }
            `}</style>
        </section>
    )
}

export default CoachesList
