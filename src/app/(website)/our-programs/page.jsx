"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Inter, IBM_Plex_Mono } from "next/font/google";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-mono" });

// NOTE: point this at wherever route.js actually lives in your app/api tree,
// e.g. "/api/coaching-program" if the file sits at app/api/coaching-program/route.js
const API_URL = "/api/coaching-program";

const PROGRAM_TYPES = [
    {
        code: "JR",
        color: "#2f5fdb",
        tint: "rgba(47, 95, 219, 0.09)",
        title: "Junior Cricket Program",
        description:
            "Designed for young beginners, this program focuses on developing fundamental cricket skills, coordination, fitness, and confidence in a fun and supportive environment.",
    },
    {
        code: "ADV",
        color: "#7c3aed",
        tint: "rgba(124, 58, 237, 0.09)",
        title: "Advanced Coaching Program",
        description:
            "Ideal for intermediate and advanced players, this program provides specialized coaching in batting, bowling, fielding, match strategy, and performance analysis to prepare players for competitive cricket.",
    },
    {
        code: "1:1",
        color: "#0d9488",
        tint: "rgba(13, 148, 136, 0.09)",
        title: "Personal Training",
        description:
            "Receive one-on-one coaching sessions tailored to your individual strengths and areas for improvement. Personal training helps accelerate skill development through customized practice plans and expert feedback.",
    },
    {
        code: "WK",
        color: "#d97706",
        tint: "rgba(217, 119, 6, 0.1)",
        title: "Weekend Cricket Camps",
        description:
            "Our weekend camps offer intensive coaching sessions, match practice, fitness drills, and team-building activities for players looking to maximize their learning during weekends.",
    },
    {
        code: "HP",
        color: "#dc2626",
        tint: "rgba(220, 38, 38, 0.09)",
        title: "High Performance Program",
        description:
            "This elite program is designed for aspiring professional cricketers. It includes advanced technical coaching, strength and conditioning, video analysis, mental conditioning, and regular competitive match exposure.",
    },
    {
        code: "FIT",
        color: "#16a34a",
        tint: "rgba(22, 163, 74, 0.09)",
        title: "Fitness & Conditioning",
        description:
            "Improve endurance, agility, strength, speed, and flexibility with specialized fitness programs designed specifically for cricket players.",
    },
    {
        code: "MP",
        color: "#0891b2",
        tint: "rgba(8, 145, 178, 0.09)",
        title: "Tournament & Match Practice",
        description:
            "Players gain valuable match experience through regular practice matches, tournaments, and performance evaluations, helping them develop game awareness and confidence under pressure.",
    },
];

const WHY_CHOOSE = [
    "Qualified and experienced coaches",
    "Structured training curriculum",
    "Modern coaching techniques",
    "Individual performance tracking",
    "Regular practice matches",
    "Safe and professional training environment",
    "Programs suitable for all age groups",
    "Focus on both skill development and character building",
];

const STATUS_META = {
    open: { label: "Enrolling", tone: "open" },
    full: { label: "Full", tone: "full" },
    closed: { label: "Closed", tone: "closed" },
};

function resolveStatus(program) {
    const raw = (program.status || "").toString().toLowerCase();
    const seatsLeft = Number(program.available_seats);

    if (raw === "closed" || raw === "0" || raw === "inactive") {
        return STATUS_META.closed;
    }
    if (!Number.isNaN(seatsLeft) && seatsLeft <= 0) {
        return STATUS_META.full;
    }
    return STATUS_META.open;
}

function formatDateRange(start, end) {
    if (!start && !end) return null;
    const opts = { day: "numeric", month: "short" };
    const s = start ? new Date(start).toLocaleDateString("en-IN", opts) : null;
    const e = end ? new Date(end).toLocaleDateString("en-IN", opts) : null;
    if (s && e) return `${s} – ${e}`;
    return s || e;
}

function formatTimeRange(start, end) {
    if (!start && !end) return null;
    const clean = (t) => (t ? t.toString().slice(0, 5) : null);
    const s = clean(start);
    const e = clean(end);
    if (s && e) return `${s}–${e}`;
    return s || e;
}

function formatFees(fees) {
    if (fees === null || fees === undefined || fees === "") return "—";
    const n = Number(fees);
    if (Number.isNaN(n)) return fees;
    return `₹${n.toLocaleString("en-IN")}`;
}

function initials(first, last) {
    const a = (first || "").trim()[0] || "";
    const b = (last || "").trim()[0] || "";
    return (a + b).toUpperCase() || "C";
}

function SeatBar({ total, available }) {
    const t = Number(total);
    const a = Number(available);
    const valid = !Number.isNaN(t) && t > 0 && !Number.isNaN(a);
    const filled = valid ? Math.min(Math.max(t - a, 0), t) : 0;
    const pct = valid ? Math.round((filled / t) * 100) : 0;

    return (
        <div className="seat-bar">
            <div className="seat-track">
                <div className="seat-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="seat-label">{valid ? `${a} of ${t} seats left` : "Seats TBA"}</span>
        </div>
    );
}

function ProgramCard({ program, onViewDetails }) {
    const router = useRouter();
    const status = resolveStatus(program);
    const dateRange = formatDateRange(program.start_date, program.end_date);
    const timeRange = formatTimeRange(program.start_time, program.end_time);
    const coachName = [program.first_name, program.last_name].filter(Boolean).join(" ");
    const hasDetails = Boolean(program.about_me || program.description);

    return (
        <article className="card">
            <div className="card-media">
                {program.program_image ? (
                    <img src={program.program_image} alt={program.title} loading="lazy" />
                ) : (
                    <div className="media-fallback" aria-hidden="true">
                        {(program.title || "P").slice(0, 1)}
                    </div>
                )}
                {Number(program.featured) === 1 && <span className="featured-badge">Featured</span>}
                <span className={`status-badge tone-${status.tone}`}>{status.label}</span>
            </div>

            <div className="card-body">
                <p className="eyebrow">
                    {program.designation}
                    {program.sub_designation ? ` · ${program.sub_designation}` : ""}
                </p>
                <h3 className="title">{program.title}</h3>

                <div className="coach-row">
                    <span className="avatar">{initials(program.first_name, program.last_name)}</span>
                    <span className="coach-text">
                        {coachName || "Coach TBA"}
                        {program.branch_name ? <span className="dot"> · {program.branch_name}</span> : null}
                    </span>
                </div>

                <div className="tag-row">
                    {program.age_group && <span className="tag">{program.age_group}</span>}
                    {program.skill_level && <span className="tag">{program.skill_level}</span>}
                    {program.days && <span className="tag">{program.days}</span>}
                </div>

                <dl className="info-list">
                    <div>
                        <dt>Time</dt>
                        <dd>{timeRange || "—"}</dd>
                    </div>
                    <div>
                        <dt>Duration</dt>
                        <dd>{program.duration || "—"}</dd>
                    </div>
                    <div>
                        <dt>Dates</dt>
                        <dd>{dateRange || "—"}</dd>
                    </div>
                </dl>

                <SeatBar total={program.total_seats} available={program.available_seats} />

                {hasDetails && (
                    <button type="button" className="details-toggle" onClick={() => onViewDetails(program)}>
                        View details
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                            <path d="M2.5 6h7M6 2.5l3.5 3.5L6 9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                )}
            </div>

            <div className="card-footer">
                <span className="price">{formatFees(program.fees)}</span>
                <button
                    type="button"
                    className="enroll-btn"
                    disabled={status.tone !== "open"}
                    onClick={() => router.push(`/contact?program=${encodeURIComponent(program.title || "")}`)}
                >
                    {status.tone === "open" ? "Enroll now" : status.label}
                </button>
            </div>
        </article>
    );
}

function ProgramModal({ program, onClose }) {
    const router = useRouter();
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [onClose]);

    if (!program) return null;

    const coachName = [program.first_name, program.last_name].filter(Boolean).join(" ");
    const timeRange = formatTimeRange(program.start_time, program.end_time);
    const dateRange = formatDateRange(program.start_date, program.end_date);

    return (
        <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-box" role="dialog" aria-modal="true" aria-label={program.title}>
                <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                </button>

                {program.program_image && (
                    <div className="modal-media">
                        <img src={program.program_image} alt={program.title} />
                    </div>
                )}

                <div className="modal-content">
                    <p className="eyebrow">
                        {program.designation}
                        {program.sub_designation ? ` · ${program.sub_designation}` : ""}
                    </p>
                    <h2 className="modal-title">{program.title}</h2>
                    <p className="coach-text">
                        {coachName || "Coach TBA"}
                        {program.branch_name ? <span className="dot"> · {program.branch_name}</span> : null}
                    </p>

                    <dl className="info-list modal-info">
                        <div>
                            <dt>Schedule</dt>
                            <dd>{program.days || "—"}</dd>
                        </div>
                        <div>
                            <dt>Time</dt>
                            <dd>{timeRange || "—"}</dd>
                        </div>
                        <div>
                            <dt>Duration</dt>
                            <dd>{program.duration || "—"}</dd>
                        </div>
                        <div>
                            <dt>Dates</dt>
                            <dd>{dateRange || "—"}</dd>
                        </div>
                    </dl>

                    {program.about_me && (
                        <div className="modal-section">
                            <p className="details-label">About</p>
                            <div className="details-html" dangerouslySetInnerHTML={{ __html: program.about_me }} />
                        </div>
                    )}
                    {program.description && (
                        <div className="modal-section">
                            <p className="details-label">Description</p>
                            <div className="details-html" dangerouslySetInnerHTML={{ __html: program.description }} />
                        </div>
                    )}

                    <div className="modal-footer">
                        <span className="price">{formatFees(program.fees)}</span>
                        <button
                            type="button"
                            className="enroll-btn"
                            disabled={resolveStatus(program).tone !== "open"}
                            onClick={() => router.push(`/contact?program=${encodeURIComponent(program.title || "")}`)}
                        >
                            {resolveStatus(program).tone === "open" ? "Enroll now" : resolveStatus(program).label}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CardSkeleton() {
    return (
        <div className="card skeleton">
            <div className="sk-media" />
            <div className="sk-body">
                <div className="sk-line w40" />
                <div className="sk-line w70" />
                <div className="sk-line w90" />
                <div className="sk-line w60" />
            </div>
        </div>
    );
}

const Page = () => {
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [levelFilter, setLevelFilter] = useState("all");
    const [ageFilter, setAgeFilter] = useState("all");
    const [activeProgram, setActiveProgram] = useState(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(API_URL, { cache: "no-store" });
                const json = await res.json();
                if (!json.success) throw new Error(json.message || "Could not load programs.");
                if (!cancelled) setPrograms(Array.isArray(json.data) ? json.data : []);
            } catch (err) {
                if (!cancelled) setError(err.message || "Something went wrong.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const skillLevels = useMemo(
        () => Array.from(new Set(programs.map((p) => p.skill_level).filter(Boolean))),
        [programs]
    );
    const ageGroups = useMemo(
        () => Array.from(new Set(programs.map((p) => p.age_group).filter(Boolean))),
        [programs]
    );

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return programs.filter((p) => {
            if (levelFilter !== "all" && p.skill_level !== levelFilter) return false;
            if (ageFilter !== "all" && p.age_group !== ageFilter) return false;
            if (q) {
                const hay = `${p.title} ${p.designation} ${p.branch_name} ${p.first_name} ${p.last_name}`.toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        });
    }, [programs, search, levelFilter, ageFilter]);

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-xl-11 col-lg-11 col-md-11 colsm-12 m-auto">


                    <div className={`page ${inter.variable} ${plexMono.variable}`}>
                        <section className="top-content">
                            <div className="tc-head">
                                <p className="eyebrow">The Academy</p>
                                <h2 className="tc-heading">Our Programs</h2>
                                <p className="tc-lead">
                                    At our Cricket Academy, we offer professionally designed training programs for players of all ages and skill levels. Whether you are taking your first step into cricket or preparing for competitive tournaments, our experienced coaches provide structured guidance to help you achieve your goals.
                                </p>
                            </div>

                            <div className="seam-divider" role="presentation" />

                            <div className="program-type-grid">
                                {PROGRAM_TYPES.map((p) => (
                                    <div
                                        className="program-type"
                                        key={p.code}
                                        style={{ "--card-accent": p.color, "--card-tint": p.tint }}
                                    >
                                        <span className="program-code">{p.code}</span>
                                        <h3>{p.title}</h3>
                                        <p>{p.description}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="seam-divider" role="presentation" />

                            <div className="why-panel">
                                <h3 className="why-heading">Why choose our programs?</h3>
                                <ul className="why-list">
                                    {WHY_CHOOSE.map((item) => (
                                        <li key={item}>
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                                                <path d="M2.5 7.3l3 3L11.5 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </section>
                        <section className="hero">
                            <p className="hero-eyebrow">Programs</p>
                            <h1 className="hero-title">Our Coaching Programs</h1>
                            <p className="hero-sub">
                                Explore our current programs and find the right coach, schedule and skill level for you.
                            </p>

                        </section>

                        <section className="filters">
                            <input
                                type="search"
                                placeholder="Search by program, coach or branch"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
                                <option value="all">All levels</option>
                                {skillLevels.map((lvl) => (
                                    <option key={lvl} value={lvl}>
                                        {lvl}
                                    </option>
                                ))}
                            </select>
                            <select value={ageFilter} onChange={(e) => setAgeFilter(e.target.value)}>
                                <option value="all">All ages</option>
                                {ageGroups.map((age) => (
                                    <option key={age} value={age}>
                                        {age}
                                    </option>
                                ))}
                            </select>
                        </section>

                        <section className="grid">
                            {loading && Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}

                            {!loading && error && (
                                <div className="state-panel state-error">
                                    <h3>Programs didn't load</h3>
                                    <p>{error}</p>
                                </div>
                            )}

                            {!loading && !error && filtered.length === 0 && (
                                <div className="state-panel state-empty">
                                    <h3>No programs match your search</h3>
                                    <p>Try clearing a filter or searching a different term.</p>
                                </div>
                            )}

                            {!loading &&
                                !error &&
                                filtered.map((program) => (
                                    <ProgramCard key={program.id} program={program} onViewDetails={setActiveProgram} />
                                ))}
                        </section>

                        {activeProgram && <ProgramModal program={activeProgram} onClose={() => setActiveProgram(null)} />}

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
                    font-family: var(--font-body), "Segoe UI", system-ui, sans-serif;
                    color: var(--ink);
                    background: var(--bg);
                    min-height: 100vh;
                    padding: 48px 24px 88px;
                    max-width: 100%;
                    margin: 0 auto;
                }

                .hero {
                    text-align: center;
                    max-width: 620px;
                    margin: 0 auto 36px;
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

                .top-content {
                    max-width: 1000px;
                    margin: 0 auto 64px;
                }
                .tc-head {
                    max-width: 640px;
                    margin: 0 auto;
                    text-align: center;
                }
                .tc-heading {
                    font-size: clamp(26px, 3.6vw, 34px);
                    font-weight: 700;
                    letter-spacing: -0.02em;
                    margin: 0 0 14px;
                    line-height: 1.2;
                }
                .tc-lead {
                    color: var(--slate);
                    font-size: 15.5px;
                    line-height: 1.7;
                    margin: 0;
                }

                .seam-divider {
                    position: relative;
                    height: 1px;
                    background: var(--border);
                    margin: 40px auto;
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

                .program-type-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 16px;
                }
                .program-type {
                    background: var(--card);
                    border: 1px solid var(--border);
                    border-top: 3px solid var(--card-accent, var(--accent));
                    border-radius: 14px;
                    padding: 22px 20px;
                    transition: border-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
                }
                .program-type:hover {
                    border-color: var(--card-accent, var(--accent));
                    border-top-color: var(--card-accent, var(--accent));
                    transform: translateY(-3px);
                    box-shadow: 0 12px 24px -16px rgba(15, 18, 26, 0.3);
                }
                .program-code {
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
                .program-type h3 {
                    font-size: 16px;
                    font-weight: 700;
                    letter-spacing: -0.01em;
                    margin: 0 0 8px;
                    line-height: 1.3;
                }
                .program-type p {
                    color: var(--slate);
                    font-size: 13.5px;
                    line-height: 1.6;
                    margin: 0;
                }

                .why-panel {
                    background: linear-gradient(180deg, rgba(47, 95, 219, 0.05), rgba(47, 95, 219, 0.02));
                    border: 1px solid rgba(47, 95, 219, 0.14);
                    border-radius: 16px;
                    padding: 28px 30px 30px;
                }
                .why-heading {
                    font-size: 17px;
                    font-weight: 700;
                    letter-spacing: -0.01em;
                    margin: 0 0 18px;
                }
                .why-list {
                    list-style: none;
                    margin: 0;
                    padding: 0;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
                    gap: 12px 20px;
                }
                .why-list li {
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    font-size: 14px;
                    line-height: 1.5;
                }
                .why-list li svg {
                    flex-shrink: 0;
                    margin-top: 3px;
                    color: var(--accent);
                }

                .filters {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    margin-bottom: 32px;
                }
                .filters input,
                .filters select {
                    font-family: var(--font-body), sans-serif;
                    font-size: 14px;
                    padding: 11px 14px;
                    border-radius: 10px;
                    border: 1px solid var(--border);
                    background: var(--card);
                    color: var(--ink);
                }
                .filters input {
                    flex: 1 1 260px;
                }
                .filters select {
                    flex: 0 0 auto;
                    cursor: pointer;
                }
                .filters input:focus,
                .filters select:focus {
                    outline: 2px solid var(--accent);
                    outline-offset: 1px;
                }

                .grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 22px;
                }

                .card {
                    background: var(--card);
                    border-radius: 14px;
                    overflow: hidden;
                    border: 1px solid var(--border);
                    display: flex;
                    flex-direction: column;
                    transition: box-shadow 0.15s ease, transform 0.15s ease;
                }
                .card:hover {
                    box-shadow: 0 8px 24px -12px rgba(20, 24, 33, 0.25);
                    transform: translateY(-2px);
                }

                .card-media {
                    position: relative;
                    height: 150px;
                    background: var(--accent);
                }
                .card-media img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                }
                .media-fallback {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 40px;
                    font-weight: 700;
                    color: rgba(255, 255, 255, 0.85);
                }
                .featured-badge {
                    position: absolute;
                    top: 12px;
                    left: 12px;
                    background: #ffffff;
                    color: var(--accent-dark);
                    font-size: 11px;
                    font-weight: 600;
                    padding: 4px 10px;
                    border-radius: 999px;
                }
                .status-badge {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    font-size: 11px;
                    font-weight: 600;
                    padding: 4px 10px;
                    border-radius: 999px;
                    background: rgba(255, 255, 255, 0.94);
                }
                .status-badge.tone-open {
                    color: #157a4a;
                }
                .status-badge.tone-full {
                    color: var(--amber);
                }
                .status-badge.tone-closed {
                    color: var(--red);
                }

                .card-body {
                    padding: 18px 20px 4px;
                    flex: 1;
                }
                .eyebrow {
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    color: var(--accent);
                    margin: 0 0 6px;
                }
                .title {
                    font-size: 18px;
                    font-weight: 700;
                    letter-spacing: -0.01em;
                    margin: 0 0 12px;
                    line-height: 1.3;
                }

                .coach-row {
                    display: flex;
                    align-items: center;
                    gap: 9px;
                    margin-bottom: 12px;
                }
                .avatar {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background: var(--bg);
                    color: var(--slate);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: 600;
                    flex: none;
                }
                .coach-text {
                    font-size: 13px;
                    color: var(--slate);
                }
                .coach-text .dot {
                    color: var(--slate-light);
                }

                .summary {
                    font-size: 13.5px;
                    color: var(--slate);
                    line-height: 1.55;
                    margin: 0 0 14px;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .tag-row {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                    margin-bottom: 14px;
                }
                .tag {
                    font-size: 11.5px;
                    font-weight: 500;
                    color: var(--slate);
                    background: var(--bg);
                    border: 1px solid var(--border);
                    padding: 4px 10px;
                    border-radius: 999px;
                }

                .info-list {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                    margin: 0 0 14px;
                    padding-top: 12px;
                    border-top: 1px solid var(--border);
                }
                .info-list dt {
                    font-size: 10.5px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--slate-light);
                    margin: 0 0 3px;
                }
                .info-list dd {
                    font-size: 12.5px;
                    font-weight: 600;
                    margin: 0;
                    color: var(--ink);
                }

                .seat-bar {
                    margin-bottom: 16px;
                }
                .seat-track {
                    height: 6px;
                    border-radius: 999px;
                    background: var(--bg);
                    overflow: hidden;
                    margin-bottom: 6px;
                }
                .seat-fill {
                    height: 100%;
                    background: var(--accent);
                    border-radius: 999px;
                }
                .seat-label {
                    font-size: 11.5px;
                    color: var(--slate-light);
                }

                .details-toggle {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    font-family: var(--font-body), sans-serif;
                    font-size: 12.5px;
                    font-weight: 600;
                    color: var(--accent);
                    background: none;
                    border: none;
                    padding: 0 0 14px;
                    cursor: pointer;
                }
                .details-toggle:hover {
                    color: var(--accent-dark);
                }
                .details-toggle:focus-visible {
                    outline: 2px solid var(--accent);
                    outline-offset: 2px;
                    border-radius: 4px;
                }

                .details-label {
                    font-size: 10.5px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--slate-light);
                    margin: 0 0 4px;
                }
                .details-html {
                    font-size: 13.5px;
                    color: var(--ink);
                    line-height: 1.6;
                }
                .details-html :global(p) {
                    margin: 0 0 8px;
                }
                .details-html :global(p:last-child) {
                    margin-bottom: 0;
                }
                .details-html :global(ul),
                .details-html :global(ol) {
                    margin: 0 0 8px 18px;
                    padding: 0;
                }

                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(15, 18, 26, 0.55);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                    z-index: 1040;
                    animation: fadeIn 0.15s ease;
                }
                .modal-box {
                    position: relative;
                    background: var(--card);
                    border-radius: 16px;
                    width: 100%;
                    max-width: 990px;
                    max-height: 88vh;
                    overflow-y: auto;
                    box-shadow: 0 24px 60px -20px rgba(15, 18, 26, 0.45);
                    animation: slideUp 0.18s ease;
                }
                .modal-close {
                    position: absolute;
                    top: 14px;
                    right: 14px;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    border: none;
                    background: rgba(255, 255, 255, 0.92);
                    color: var(--ink);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    z-index: 2;
                }
                .modal-close:hover {
                    background: #ffffff;
                }
                .modal-close:focus-visible {
                    outline: 2px solid var(--accent);
                    outline-offset: 2px;
                }
                .modal-media {
                    height: 220px;
                    background: var(--accent);
                }
                .modal-media img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                }
                .modal-content {
                    padding: 22px 24px 24px;
                }
                .modal-title {
                    font-size: 22px;
                    font-weight: 700;
                    letter-spacing: -0.01em;
                    margin: 0 0 8px;
                    line-height: 1.25;
                }
                .modal-content .coach-text {
                    display: block;
                    margin: 0 0 16px;
                }
                .modal-info {
                    grid-template-columns: repeat(4, 1fr);
                    margin-bottom: 18px;
                    padding-top: 16px;
                }
                .modal-section {
                    margin-bottom: 16px;
                }
                .modal-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    margin-top: 20px;
                    padding-top: 18px;
                    border-top: 1px solid var(--border);
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(12px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .card-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 10px;
                    padding: 14px 20px 18px;
                    border-top: 1px solid var(--border);
                }
                .price {
                    font-family: var(--font-mono), monospace;
                    font-size: 17px;
                    font-weight: 600;
                }
                .enroll-btn {
                    font-family: var(--font-body), sans-serif;
                    font-size: 13px;
                    font-weight: 600;
                    padding: 9px 16px;
                    border-radius: 8px;
                    border: none;
                    background: var(--accent);
                    color: #ffffff;
                    cursor: pointer;
                    transition: background 0.15s ease;
                }
                .enroll-btn:hover:not(:disabled) {
                    background: var(--accent-dark);
                }
                .enroll-btn:disabled {
                    background: var(--bg);
                    color: var(--slate-light);
                    cursor: not-allowed;
                }
                .enroll-btn:focus-visible {
                    outline: 2px solid var(--accent-dark);
                    outline-offset: 2px;
                }

                .state-panel {
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 56px 24px;
                    border-radius: 14px;
                    background: var(--card);
                    border: 1px solid var(--border);
                }
                .state-panel h3 {
                    font-size: 16px;
                    font-weight: 700;
                    margin: 0 0 6px;
                }
                .state-panel p {
                    color: var(--slate);
                    margin: 0;
                    font-size: 14px;
                }
                .state-error h3 {
                    color: var(--red);
                }

                .skeleton {
                    pointer-events: none;
                }
                .sk-media {
                    height: 150px;
                    background: var(--border);
                }
                .sk-body {
                    padding: 18px 20px;
                }
                .sk-line {
                    height: 11px;
                    border-radius: 6px;
                    background: var(--border);
                    margin-bottom: 12px;
                    animation: pulse 1.4s ease-in-out infinite;
                }
                .w40 {
                    width: 40%;
                }
                .w60 {
                    width: 60%;
                }
                .w70 {
                    width: 70%;
                }
                .w90 {
                    width: 90%;
                }
                @keyframes pulse {
                    0%,
                    100% {
                        opacity: 0.6;
                    }
                    50% {
                        opacity: 1;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .card,
                    .enroll-btn,
                    .sk-line {
                        animation: none;
                        transition: none;
                    }
                }
            `}</style>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;