"use client";
import React, { useEffect, useRef, useState } from 'react';

const CricketCoachingCTA = () => {
    const sectionRef = useRef(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.disconnect(); // animate once
                }
            },
            { threshold: 0.2 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div className="dca-cta-wrap" ref={sectionRef}>
            {/* Contact bar */}
            <div className="contact-bar-outer">
                <div className={`contact-bar ${inView ? 'anim-in' : ''}`}>
                    <div className="contact-item">
                        <span className="contact-label">Call Us :</span>
                        <div className="contact-value">
                            <a href="tel:+919811196738">+91-8285831503</a>
                            <a href="tel:+919220166100">+91-9971109868</a>
                        </div>
                    </div>

                    <div className="or-circle">or</div>

                    <div className="contact-item">
                        <span className="contact-label">E-mail Us :</span>
                        <div className="contact-value">
                            <a href="mailto:info@dcaindia.co.in">info@cstcricketacademy.com</a>
                        </div>
                    </div>

                    <img className="shape float-slow shape-1" src="https://www.dronacharyacricketacademy.com/assets/images/cta/shape-06.png" alt="" />
                    <img className="shape float-med shape-2" src="https://www.dronacharyacricketacademy.com/assets/images/cta/shape-12.png" alt="" />
                    <img className="shape float-slow shape-3" src="https://www.dronacharyacricketacademy.com/assets/images/cta/shape-04.png" alt="" />
                </div>
            </div>

            {/* Hero CTA */}
            <section className="hero-cta">
                <div className="hero-inner">
                    <div className={`hero-image-col ${inView ? 'anim-in-left' : ''}`}>
                        <img
                            className="cricketer-img float-batsman"
                            src="/images/cricketer.png"
                            alt="Dronacharya Cricket Academy"
                        />
                        <img className="shape float-slow shape-43" src="https://www.dronacharyacricketacademy.com/assets/images/cta/shape-43.png" alt="" />
                        <img className="shape float-med shape-42" src="https://www.dronacharyacricketacademy.com/assets/images/cta/shape-42.png" alt="" />
                        <img className="shape float-slow shape-40" src="https://www.dronacharyacricketacademy.com/assets/images/cta/shape-40.png" alt="" />
                        <img className="shape float-med shape-38" src="https://www.dronacharyacricketacademy.com/assets/images/cta/shape-38.png" alt="" />
                    </div>

                    <div className={`hero-text-col ${inView ? 'anim-in-right' : ''}`}>
                        <h2>Get Best Cricket Coaching @ CST Cricket Academy !</h2>
                        <p>
                            Provides expert training for players of all levels, offering personalized sessions,
                            skill development, fitness programs, and match strategies to enhance performance
                            and foster passion for the game.
                        </p>
                        <a href="/contact" className="contact-btn">
                            <span>Contact Us</span>
                            <span className="arrow">&rarr;</span>
                        </a>
                    </div>
                </div>

                <img className="shape float-slow shape-39" src="https://www.dronacharyacricketacademy.com/assets/images/cta/shape-39.png" alt="" />
                <img className="shape spin-slow shape-round" src="https://www.dronacharyacricketacademy.com/assets/images/cta/cta-round.svg" alt="" />
            </section>

            <style jsx>{`
                .dca-cta-wrap {
                    font-family: 'Inter', 'Segoe UI', sans-serif;
                    background: #ffffff;
                    overflow: hidden;
                }

                /* ---------- Contact bar ---------- */
                .contact-bar-outer {
                    position: relative;
                    padding: 48px 5vw 56px;
                }
                .contact-bar {
                    position: relative;
                    max-width: 780px;
                    margin: 0 auto 0 60px;
                    background: linear-gradient(120deg, #14944c 0%, #3bbf6e 100%);
                    border-radius: 12px;
                    padding: 36px 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 28px;
                    flex-wrap: wrap;
                    color: #fff;
                    z-index: 2;
                    opacity: 0;
                    transform: translateY(28px);
                    margin:auto
                }
                .contact-bar.anim-in {
                    animation: riseFade 0.7s ease forwards;
                }

                .contact-item { text-align: center; }
                .contact-label {
                    display: block;
                    font-size: 0.95rem;
                    opacity: 0.9;
                    margin-bottom: 4px;
                }
                .contact-value {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    font-weight: 700;
                    font-size: 1.15rem;
                }
                .contact-value a { color: #fff; text-decoration: none; transition: opacity 0.2s ease; }
                .contact-value a:hover { text-decoration: underline; opacity: 0.85; }

                .or-circle {
                    width: 56px;
                    height: 56px;
                    border-radius: 50%;
                    background: #fff;
                    color: #14944c;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    animation: pulseRing 2.4s ease-in-out infinite;
                }

                .contact-bar-outer .shape { position: absolute; pointer-events: none; z-index: 1; }
                .shape-1 { top: -10px; left: 0; width: 140px; opacity: 0.6; }
                .shape-2 { top: 0; left: 90px; width: 90px; opacity: 0.5; }
                .shape-3 { bottom: -10px; right: 40px; width: 120px; opacity: 0.6; }

                /* ---------- Hero ---------- */
                .hero-cta {
                    position: relative;
                    background: linear-gradient(120deg, #14944c 0%, #3bbf6e 100%);
                    padding: 60px 5vw 70px;
                }
                .hero-inner {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    align-items: center;
                    gap: 40px;
                    flex-wrap: wrap;
                    position: relative;
                    z-index: 2;
                }

                .hero-image-col {
                    position: relative;
                    flex: 1 1 380px;
                    display: flex;
                    justify-content: center;
                    opacity: 0;
                    transform: translateX(-40px);
                }
                .hero-image-col.anim-in-left {
                    animation: slideInLeft 0.8s ease 0.15s forwards;
                }

                .cricketer-img {
                    max-width: 420px;
                    width: 100%;
                    height: auto;
                    position: relative;
                    z-index: 2;
                }
                .float-batsman { animation: floatY 4.5s ease-in-out infinite; }

                .hero-image-col .shape { position: absolute; pointer-events: none; }
                .shape-43 { top: 0; left: -10px; width: 90px; opacity: 0.5; z-index: 1; }
                .shape-42 { bottom: 20px; right: 20px; width: 60px; opacity: 0.7; z-index: 1; }
                .shape-40 { top: 40%; right: -10px; width: 140px; opacity: 0.6; z-index: 1; }
                .shape-38 { bottom: -10px; left: 10%; width: 110px; opacity: 0.5; z-index: 1; }

                .hero-text-col {
                    flex: 1 1 420px;
                    color: #fff;
                    opacity: 0;
                    transform: translateX(40px);
                }
                .hero-text-col.anim-in-right {
                    animation: slideInRight 0.8s ease 0.3s forwards;
                }

                .hero-text-col h2 {
                    font-size: clamp(1.7rem, 3.2vw, 2.4rem);
                    font-weight: 800;
                    line-height: 1.25;
                    margin: 0 0 18px;
                }
                .hero-text-col p {
                    font-size: 1rem;
                    line-height: 1.7;
                    opacity: 0.95;
                    margin: 0 0 26px;
                    max-width: 540px;
                }

                .contact-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    background: #14532d;
                    color: #fff;
                    text-decoration: none;
                    font-weight: 600;
                    padding: 14px 26px;
                    border-radius: 8px;
                    transition: background 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
                }
                .contact-btn:hover {
                    background: #0e3f21;
                    transform: translateY(-3px);
                    box-shadow: 0 10px 22px rgba(0,0,0,0.25);
                }
                .contact-btn .arrow {
                    display: inline-block;
                    transition: transform 0.25s ease;
                }
                .contact-btn:hover .arrow {
                    transform: translateX(5px);
                }

                .hero-cta > .shape { position: absolute; pointer-events: none; z-index: 1; }
                .shape-39 { bottom: 0; right: 10%; width: 130px; opacity: 0.4; }
                .shape-round { top: 20px; right: 6%; width: 90px; opacity: 0.5; }

                /* ---------- Shared floating / spinning shapes ---------- */
                .float-slow { animation: floatY 6s ease-in-out infinite; }
                .float-med { animation: floatY 4s ease-in-out infinite; }
                .spin-slow { animation: spin 18s linear infinite; }

                @keyframes riseFade {
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideInLeft {
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes slideInRight {
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes floatY {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-14px); }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes pulseRing {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.5); }
                    50% { box-shadow: 0 0 0 8px rgba(255,255,255,0); }
                }

                @media (prefers-reduced-motion: reduce) {
                    .contact-bar,
                    .hero-image-col,
                    .hero-text-col,
                    .float-batsman,
                    .float-slow,
                    .float-med,
                    .spin-slow,
                    .or-circle {
                        animation: none !important;
                        opacity: 1 !important;
                        transform: none !important;
                    }
                }

                @media (max-width: 768px) {
                    .contact-bar { margin: 0 auto; padding: 28px 24px; }
                    .hero-cta { padding: 48px 24px 56px; }
                    .hero-inner { flex-direction: column; text-align: center; }
                    .hero-text-col p { margin-left: auto; margin-right: auto; }
                }
            `}</style>
        </div>
    );
};

export default CricketCoachingCTA;
