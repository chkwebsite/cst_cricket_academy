"use client";
import { useState } from "react";
import CommonCompo from '@/components/website/CommonCompo';
import styles from "./TrainingPackages.module.css";

const plansByCadence = {
    monthly: {
        label: "Monthly Coaching",
        plans: [
            {
                id: "foundation",
                name: "Foundation",
                fee: "₹2,500",
                feeUnit: "per month",
                duration: "Ages 5–12 · 2 sessions/week",
                includes: "Batting, bowling and fielding basics, fitness habits, and small-group coaching (max 8 per coach)",
            },
            {
                id: "development",
                name: "Development",
                fee: "₹4,000",
                feeUnit: "per month",
                duration: "Ages 12–16 · 3 sessions/week",
                includes: "Match-situation training, video analysis and feedback, shot selection, and bowling variations",
            },
            {
                id: "performance",
                name: "Performance",
                fee: "₹7,500",
                feeUnit: "per month",
                duration: "Serious competitors · 5 sessions/week",
                includes: "School, district and state trial prep, strength & conditioning, and 1-on-1 coaching time",
            },
        ],
    },
    camp: {
        label: "Holiday Camps",
        plans: [
            {
                id: "holiday-camp",
                name: "Holiday Camp",
                fee: "₹6,000",
                feeUnit: "per camp",
                duration: "All levels · 2–4 weeks",
                includes: "Daily 2-hour intensive sessions, no long-term commitment, and a camp scorecard on completion",
            },
        ],
    },
};

const page = () => {
    const [cadence, setCadence] = useState("monthly");
    const activeGroup = plansByCadence[cadence];

    return (
        <>
            <section className={styles.feeSection}>
                <div className={styles.inner}>
                    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                        <span>Home</span>
                        <span className={styles.breadcrumbSep}>/</span>
                        <span className={styles.breadcrumbCurrent}>Training Packages</span>
                    </nav>

                    <h1 className={styles.headline}>Training Packages</h1>

                    <div className={styles.narrative}>
                        <span className={styles.narrativeLabel}>Coaching Built Around Where You Stand</span>
                        <div className={styles.copy}>
                            <p>
                                Every player&apos;s run-up to the crease starts somewhere different. Our Training Packages are structured around four stages — from a first grip on the bat to selection-trial preparation — so players train at a level that actually matches where they are today.
                            </p>
                            <p>
                                Group sizes stay small at every stage, so coaches can watch technique closely and correct it early, before habits set in.
                            </p>
                            <p>
                                For families who want to try the sport before committing, our Holiday Camp runs as a short, intensive block with no long-term sign-up required.
                            </p>
                            <p>
                                Before choosing a package, we recommend a free trial session — it lets us place your child in the right group from day one.
                            </p>
                        </div>
                    </div>

                    <div className={styles.residencyToggle} role="tablist" aria-label="Packages by cadence">
                        {Object.entries(plansByCadence).map(([key, group]) => (
                            <button
                                key={key}
                                type="button"
                                role="tab"
                                aria-selected={cadence === key}
                                className={`${styles.residencyTab} ${cadence === key ? styles.residencyTabActive : ""}`}
                                onClick={() => setCadence(key)}
                            >
                                {group.label}
                            </button>
                        ))}
                    </div>

                    <div className={styles.planList}>
                        {activeGroup.plans.map((plan, index) => (
                            <article key={plan.id} className={styles.planCard}>
                                <span className={styles.planIndex}>{String(index + 1).padStart(2, "0")}</span>
                                <div className={styles.planBody}>
                                    <header className={styles.planHeader}>
                                        <h2 className={styles.planName}>{plan.name}</h2>
                                        <div className={styles.planFee}>
                                            <span className={styles.feeValue}>{plan.fee}</span>
                                            <span className={styles.feeUnit}>{plan.feeUnit}</span>
                                        </div>
                                    </header>
                                    <p className={styles.planDuration}>{plan.duration}</p>
                                    <p className={styles.planIncludes}>Includes: {plan.includes}</p>
                                </div>
                            </article>
                        ))}
                    </div>

                    <div className={styles.checklistBlock}>
                        <span className={styles.narrativeLabel}>Before You Sign Up</span>
                        <ul className={styles.checklist}>
                            <li><strong>Coach ratio</strong> — ask how many players share each coach.</li>
                            <li><strong>Ground & kit</strong> — check the nets and pitch, and whether kit is provided.</li>
                            <li><strong>Trial session</strong> — take one before committing to a full package.</li>
                            <li><strong>Pause & refund</strong> — get the policy in writing.</li>
                        </ul>
                    </div>

                    <div className={styles.contactBlock}>
                        <div>
                            <span className={styles.contactLabel}>Call Us</span>
                            <p className={styles.contactValue}>
                                <a href="tel:+918285831503">+91-8285831503</a>
                                {" "}&nbsp;
                                <a href="tel:+919971109868">+91-9971109868</a>
                            </p>
                        </div>
                        <div>
                            <span className={styles.contactLabel}>Email Us</span>
                            <p className={styles.contactValue}>
                                <a href="mailto:info@cstcricketacademy.com">info@cstcricketacademy.com</a>
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            <CommonCompo />
        </>
    )
}

export default page