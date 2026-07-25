"use client";
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image';
import { MailCheck, MapPinHouse, PhoneCall, ArrowUpRight } from 'lucide-react';

const Branchs = ({ data, loading }) => {
    // const [branches, setBranches] = useState([]);
    // const [loading, setLoading] = useState(true);
    // const [error, setError] = useState(null);

    // useEffect(() => {
    //     async function loadCoachesList() {
    //         try {
    //             const res = await fetch("/api/branch");
    //             const json = await res.json();
    //             if (!res.ok) throw new Error(json.message || "Unable to load coaching Program.");
    //             setBranches(json.data || []);
    //         } catch (err) {
    //             setError(err.message);
    //         } finally {
    //             setLoading(false);
    //         }
    //     }

    //     loadCoachesList();
    // }, []);
    // console.log("branches", branches);
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
        <section ref={sectionRef} className={`branches-section bg-info-subtle py-5 ${inView ? "in-view" : ""}`}>
            <div className="col-xl-11 col-lg-11 col-md-11 col-sm-12 m-auto">
                <div className="text-center mb-5">
                    <div className="d-inline-flex align-items-center gap-2 mb-2">
                        <span className="section-rule"></span>
                        <span className="theme_color fw-semibold text-uppercase small">Find Us</span>
                        <span className="section-rule"></span>
                    </div>
                    <h1 className="fw-bolder mb-2">Our Elite Branches</h1>
                    <p className="text-secondary mb-0 mx-auto" style={{ maxWidth: 520 }}>
                        Five branches across Delhi NCR, each with premium turf pitches and dedicated coaching staff.
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-5 text-muted">Loading Our Elite Branches...</div>
                ) : data.length === 0 ? (
                    <div className="text-center py-5 text-muted">No Our Elite Branches found yet.</div>
                ) : (
                    <div className="row g-4">
                        {data.map((item, index) => (
                            <div className="col-xl-3 col-lg-3 col-md-4 col-sm-6" key={index}>
                                <div className="branch-card h-100 d-flex flex-column">
                                    <div className="branch-map-wrap">
                                        <Image src="/images/maps.avif" alt={item.branch_name} fill className="branch-map-img" />
                                        <span className="branch-code-badge">{item.branch_code}</span>
                                    </div>

                                    <div className="branch-body flex-grow-1 d-flex flex-column">
                                        <h4 className="fw-bold mb-0">{item.branch_name}</h4>
                                        {item.contact_person && (
                                            <span className="text-secondary small mb-3">{item.contact_person}</span>
                                        )}

                                        <div className="d-flex flex-column gap-2 mb-3">
                                            {item.email && (
                                                <div className="branch-info-row">
                                                    <span className="branch-icon"><MailCheck size={13} /></span>
                                                    <span className="small text-truncate">{item.email}</span>
                                                </div>
                                            )}
                                            {item.address && (
                                                <div className="branch-info-row">
                                                    <span className="branch-icon"><MapPinHouse size={13} /></span>
                                                    <span className="small">{item.address}</span>
                                                </div>
                                            )}
                                            {item.mobile && (
                                                <div className="branch-info-row">
                                                    <span className="branch-icon"><PhoneCall size={13} /></span>
                                                    <span className="small">{item.mobile}</span>
                                                </div>
                                            )}
                                        </div>

                                        {item.map_link && (
                                            <Link
                                                href={item.map_link}
                                                target='_blank'
                                                className="branch-directions-btn mt-auto d-inline-flex align-items-center justify-content-center gap-2"
                                            >
                                                Get Directions <ArrowUpRight size={15} />
                                            </Link>
                                        )}
                                    </div>
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

                .branch-card {
                    background: #fff;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 12px 30px -18px rgba(0,0,0,0.25);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }

                .branch-card:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 18px 36px -16px rgba(0,0,0,0.3);
                }

                .branch-map-wrap {
                    position: relative;
                    width: 100%;
                    height: 160px;
                }

                .branch-map-img {
                    object-fit: cover;
                }

                .branch-code-badge {
                    position: absolute;
                    top: 12px;
                    left: 12px;
                    background: rgba(0,0,0,0.55);
                    color: #fff;
                    font-size: 0.7rem;
                    font-weight: 600;
                    letter-spacing: 0.03em;
                    padding: 0.25rem 0.6rem;
                    border-radius: 999px;
                }

                .branch-body {
                    padding: 1.25rem 1.25rem 1.5rem;
                }

                .branch-info-row {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.6rem;
                    color: #495057;
                }

                .branch-icon {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 24px;
                    height: 24px;
                    flex: none;
                    border-radius: 50%;
                    background: rgba(0,150,136,0.1);
                    color: #009688;
                }

                .branch-directions-btn {
                    background: #009688;
                    color: #fff;
                    font-size: 0.85rem;
                    font-weight: 600;
                    padding: 0.55rem 1rem;
                    border-radius: 10px;
                    text-decoration: none;
                    transition: background 0.2s ease;
                }

                .branch-directions-btn:hover {
                    background: #00877a;
                    color: #fff;
                }

                .branches-section .row.g-4 > div {
                    opacity: 0;
                    transform: translateY(24px);
                    transition: opacity 0.6s ease, transform 0.6s ease;
                }

                .branches-section.in-view .row.g-4 > div {
                    opacity: 1;
                    transform: translateY(0);
                }

                .branches-section.in-view .row.g-4 > div:nth-child(1) { transition-delay: 0.05s; }
                .branches-section.in-view .row.g-4 > div:nth-child(2) { transition-delay: 0.1s; }
                .branches-section.in-view .row.g-4 > div:nth-child(3) { transition-delay: 0.15s; }
                .branches-section.in-view .row.g-4 > div:nth-child(4) { transition-delay: 0.2s; }
                .branches-section.in-view .row.g-4 > div:nth-child(n+5) { transition-delay: 0.25s; }

                @media (prefers-reduced-motion: reduce) {
                    .branches-section .row.g-4 > div {
                        opacity: 1;
                        transform: none;
                        transition: none;
                    }
                }
            `}</style>
        </section>
    )
}

export default Branchs
