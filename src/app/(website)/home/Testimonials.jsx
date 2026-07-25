"use client";
import React, { useRef, useState } from 'react'
import Slider from "react-slick";

const Star = ({ filled }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "#F5A623" : "none"} stroke="#F5A623" strokeWidth="1.5">
        <path d="M12 2.5l2.9 6.2 6.6.7-4.9 4.7 1.3 6.6L12 17.6l-5.9 3.1 1.3-6.6-4.9-4.7 6.6-.7z" strokeLinejoin="round" />
    </svg>
);

const Arrow = ({ direction }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {direction === "left" ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
    </svg>
);

const QuoteMark = () => (
    <svg width="46" height="34" viewBox="0 0 46 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13.2 0C5.9 3.1 0 10.6 0 19.1c0 8 5.1 14 12 14 6 0 10.5-4.6 10.5-10.6 0-5.6-3.9-9.7-9-9.7-1 0-1.8.1-2.4.3C12.2 8.4 16 4 21.8 1.7L13.2 0zm23.5 0C29.4 3.1 23.5 10.6 23.5 19.1c0 8 5.1 14 12 14 6 0 10.5-4.6 10.5-10.6 0-5.6-3.9-9.7-9-9.7-1 0-1.8.1-2.4.3C35.7 8.4 39.5 4 45.3 1.7L36.7 0z" fill="#0A5F55" fillOpacity="0.12" />
    </svg>
);

const Testimonials = ({ data, loading }) => {

    const sliderRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const total = data?.length || 0;

    const settings = {
        dots: false,
        arrows: false,
        infinite: true,
        speed: 600,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 20000,
        fade: true,
        cssEase: "ease-in-out",
        beforeChange: (_, next) => setActiveIndex(next),
    };

    const pad = (n) => String(n + 1).padStart(2, "0");

    return (
        <section className="testimonials-section py-5">
            <div className="container-xl">
                <div className="row align-items-center gy-5">

                    {/* LEFT: copy + controls */}
                    <div className="col-xl-5 col-lg-5 col-md-12">
                        <div className="testi-eyebrow d-inline-flex align-items-center gap-2 mb-3">
                            <span className="testi-eyebrow-line"></span>
                            <span className="text-danger fw-semibold text-uppercase small">Reviews</span>
                        </div>

                        <h1 className="fw-bolder testi-heading mb-3">
                            Student Stories &amp; Experiences
                        </h1>

                        <p className="text-secondary testi-copy mb-4">
                            <b className="text-dark">CST Cricket Academy</b> prides itself on its expansion to five branches across Delhi NCR, offering top-class coaching and contemporary facilities &mdash; including premium turf pitches equipped with practice nets and Astro-cement pitches tailored for beginners.
                        </p>

                        {!loading && total > 0 && (
                            <div className="d-flex align-items-center gap-4 testi-controls">
                                <div className="d-flex align-items-baseline gap-1 testi-counter">
                                    <span className="fw-bold text-dark">{pad(activeIndex)}</span>
                                    <span className="text-secondary">/ {pad(total - 1)}</span>
                                </div>

                                <div className="d-flex gap-2">
                                    <button
                                        type="button"
                                        aria-label="Previous testimonial"
                                        className="testi-nav-btn"
                                        onClick={() => sliderRef.current?.slickPrev()}
                                    >
                                        <Arrow direction="left" />
                                    </button>
                                    <button
                                        type="button"
                                        aria-label="Next testimonial"
                                        className="testi-nav-btn"
                                        onClick={() => sliderRef.current?.slickNext()}
                                    >
                                        <Arrow direction="right" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT: slider */}
                    <div className="col-xl-7 col-lg-7 col-md-12">
                        {loading ? (
                            <div className="testi-card d-flex align-items-center justify-content-center text-muted">
                                Loading testimonials...
                            </div>
                        ) : total === 0 ? (
                            <div className="testi-card d-flex align-items-center justify-content-center text-muted">
                                No testimonials found yet.
                            </div>
                        ) : (
                            <Slider ref={sliderRef} {...settings}>
                                {data.map((item, index) => (
                                    <div key={index}>
                                        <div className="testi-card">
                                            <div className="testi-quote-mark">
                                                <QuoteMark />
                                            </div>

                                            {item.rating ? (
                                                <div className="d-flex gap-1 mb-3">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star key={i} filled={i < item.rating} />
                                                    ))}
                                                </div>
                                            ) : null}

                                            <p
                                                className="testi-text mb-4"
                                                dangerouslySetInnerHTML={{ __html: item.testimonial }}
                                            ></p>

                                            <div className="testi-person d-flex align-items-center gap-3">
                                                <img
                                                    src={item.profile_image}
                                                    alt={item.student_name}
                                                    className="testi-avatar"
                                                />
                                                <div className="flex-grow-1">
                                                    <p className="fw-semibold mb-0">{item.student_name}</p>
                                                    {item.parent_name && (
                                                        <p className="text-secondary small mb-0">S/O {item.parent_name}</p>
                                                    )}
                                                </div>
                                                {item.presented && (
                                                    <span className="testi-badge">{item.presented}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </Slider>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .testimonials-section {
                    background: linear-gradient(180deg, #EAF3F1 0%, #F4F9F8 100%);
                }

                .testi-eyebrow-line {
                    display: inline-block;
                    width: 28px;
                    height: 2px;
                    background: #dc3545;
                }

                .testi-heading {
                    font-size: clamp(1.9rem, 3vw, 2.6rem);
                    line-height: 1.15;
                    color: #0A2E29;
                }

                .testi-copy {
                    max-width: 34rem;
                    line-height: 1.7;
                }

                .testi-nav-btn {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    border: 1.5px solid #0A5F55;
                    background: transparent;
                    color: #0A5F55;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
                }

                .testi-nav-btn:hover {
                    background: #0A5F55;
                    color: #fff;
                    transform: translateY(-2px);
                }

                .testi-nav-btn:active {
                    transform: translateY(0);
                }

                .testi-counter {
                    font-variant-numeric: tabular-nums;
                    font-size: 0.95rem;
                }

                .testi-card {
                    position: relative;
                    background: #fff;
                    border-radius: 22px;
                    padding: 2.75rem 2.5rem 2.25rem;
                    min-height: 300px;
                    box-shadow: 0 20px 45px -25px rgba(10, 47, 41, 0.35);
                    border: 1px solid rgba(10, 95, 85, 0.08);
                }

                .testi-quote-mark {
                    margin-bottom: 0.75rem;
                }

                .testi-text {
                    font-size: 1.05rem;
                    line-height: 1.75;
                    color: #33403D;
                }

                .testi-avatar {
                    width: 52px;
                    height: 52px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 2px solid #EAF3F1;
                }

                .testi-badge {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #0A5F55;
                    background: #EAF3F1;
                    padding: 0.35rem 0.75rem;
                    border-radius: 999px;
                    white-space: nowrap;
                }

                .testi-person {
                    border-top: 1px solid #EFF3F2;
                    padding-top: 1.25rem;
                }

                @media (max-width: 991px) {
                    .testi-card {
                        padding: 2.25rem 1.75rem 1.75rem;
                        min-height: unset;
                    }
                }
            `}</style>
        </section>
    )
}

export default Testimonials