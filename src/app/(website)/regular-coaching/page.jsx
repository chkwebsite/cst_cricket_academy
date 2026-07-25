"use client";
import { useState } from "react";
import CommonCompo from '@/components/website/CommonCompo';
import styles from "./PrivateCoaching.module.css";

const plansByResidency = {
    indian: {
        label: "Indian Residents",
        plans: [
            {
                id: "session",
                name: "Session Plan",
                fee: "₹2,500",
                feeUnit: "per session",
                duration: "1.5 hours",
                includes: "1 net session, fitness training, and mental skills coaching",
            },
            {
                id: "package-1",
                name: "Package 1",
                fee: "₹27,500",
                feeUnit: "for 12 sessions",
                duration: "1.5 hours per session",
                includes: "12 net sessions, fitness training, mental skills coaching, and 2 friendly matches",
            },
            {
                id: "package-2",
                name: "Package 2",
                fee: "₹52,500",
                feeUnit: "for 24 sessions",
                duration: "1.5 hours per session",
                includes: "24 net sessions, fitness training, mental skills coaching, 5–6 friendly matches, and mentorship",
            },
        ],
    },
    foreign: {
        label: "Foreign Residents",
        plans: [
            {
                id: "session",
                name: "Session Plan",
                fee: "$60",
                feeUnit: "per session",
                duration: "1.5 hours",
                includes: "1 net session, fitness training, and mental skills coaching",
            },
            {
                id: "package-1",
                name: "Package 1",
                fee: "$600",
                feeUnit: "for 12 sessions",
                duration: "1.5 hours per session",
                includes: "12 net sessions, fitness training, mental skills coaching, and 2 friendly matches",
            },
            {
                id: "package-2",
                name: "Package 2",
                fee: "$1,100",
                feeUnit: "for 24 sessions",
                duration: "1.5 hours per session",
                includes: "24 net sessions, fitness training, mental skills coaching, 5–6 friendly matches, and mentorship",
            },
        ],
    },
};

const page = () => {
    const [residency, setResidency] = useState("indian");
    const activeGroup = plansByResidency[residency];

    return (
        <>
            <section className={styles.feeSection}>
                <div className={styles.inner}>
                    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                        <span>Home</span>
                        <span className={styles.breadcrumbSep}>/</span>
                        <span className={styles.breadcrumbCurrent}>Regular Coaching Fees</span>
                    </nav>

                    <h1 className={styles.headline}>Regular Coaching</h1>

                    <div className={styles.narrative}>
                        <span className={styles.narrativeLabel}>Targeted Individual Coaching</span>
                        <div className={styles.copy}>
                            <p>
                                While we maintain uniformity in coaching standards and training methodology, the fee structure at CST Cricket Academy varies across different branches due to several administrative factors. These include differences in ground infrastructure, facility maintenance costs, availability of indoor and outdoor practice areas, location-specific operational expenses, and arrangements for coaching staff. The fees are adjusted to account for these practical considerations at each centre. This ensures that we can provide quality coaching and facilities to all trainees sustainably and efficiently.
                            </p>

                        </div>
                    </div>

                    <div className={styles.residencyToggle} role="tablist" aria-label="Fee structure by residency">
                        {Object.entries(plansByResidency).map(([key, group]) => (
                            <button
                                key={key}
                                type="button"
                                role="tab"
                                aria-selected={residency === key}
                                className={`${styles.residencyTab} ${residency === key ? styles.residencyTabActive : ""}`}
                                onClick={() => setResidency(key)}
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
                                    <p className={styles.planDuration}>Duration: {plan.duration}</p>
                                    <p className={styles.planIncludes}>Includes: {plan.includes}</p>
                                </div>
                            </article>
                        ))}
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