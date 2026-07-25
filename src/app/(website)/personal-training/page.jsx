"use client";
import { useEffect, useState } from "react";
import CoachingProgram from "../home/CoachingProgram";
import AssociatedExperts from "../home/AssociatedExperts";
import CommonCompo from '@/components/website/CommonCompo';
import styles from "./PersonalTraining.module.css";

const page = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const loadHome = async () => {
            try {
                const res = await fetch("/api/getAllHome");
                const json = await res.json();

                if (json.success) {
                    setData(json.data);
                } else {
                    setError(json.message || "Something went wrong");
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        loadHome();
    }, []);
    return (
        <>
            <section className={styles.programSection}>
                <div className={styles.inner}>
                    <span className={styles.eyebrow}>One-to-One Program</span>
                    <h1 className={styles.headline}>Personal Cricket Training</h1>
                    <p className={styles.tagline}>
                        Individual attention and a training plan built entirely around your goals, playing style, and pace of progress.
                    </p>

                    <div className={styles.quickFacts}>
                        <span className={styles.chip}>Age Group <strong>8+ Yrs</strong></span>
                        <span className={styles.chip}>Level <strong>Beginner–Advanced</strong></span>
                        <span className={styles.chip}>Open To <strong>Boys & Girls</strong></span>
                        <span className={styles.chip}>Format <strong>One-on-One</strong></span>
                    </div>

                    <div className={styles.narrative}>
                        <span className={styles.narrativeLabel}>Description</span>
                        <div className={styles.copy}>
                            <p>
                                Our Personal Cricket Training Program is designed for players who want individual attention and a customized coaching experience. Whether you are a beginner looking to build a strong foundation or an advanced player preparing for competitive cricket, our one-on-one sessions are tailored to your specific goals and playing style.
                            </p>
                            <p>
                                With personalized coaching, experienced trainers analyze your strengths and areas for improvement to create a structured development plan. Each session focuses on enhancing technical skills, fitness, match awareness, and mental confidence, ensuring faster progress and measurable performance improvement.
                            </p>
                            <p>
                                This program is ideal for players preparing for school, club, district, state, university, or national-level competitions who require focused guidance and professional mentorship.
                            </p>
                        </div>
                    </div>

                    <div className={styles.block}>
                        <span className={styles.narrativeLabel}>Highlights</span>
                        <div>
                            <ul className={styles.highlightGrid}>
                                <li>One-on-one coaching with experienced cricket coaches</li>
                                <li>Personalized training plans based on individual goals</li>
                                <li>Specialized batting, bowling, fielding, and wicket-keeping sessions</li>
                                <li>Video analysis and technical performance review</li>
                                <li>Strength, fitness, speed, and agility training</li>
                                <li>Match strategy and game awareness development</li>
                                <li>Flexible training schedules</li>
                                <li>Regular progress tracking and performance reports</li>
                            </ul>
                        </div>
                    </div>

                    <div className={styles.block}>
                        <span className={styles.narrativeLabel}>Suitable For</span>
                        <ul className={styles.suitableList}>
                            <li>Age Group: 8 Years & Above</li>
                            <li>Beginner, Intermediate, and Advanced Players</li>
                            <li>Boys and Girls</li>
                            <li>Players preparing for trials, tournaments, and professional cricket</li>
                        </ul>
                    </div>

                    <div className={styles.block}>
                        <span className={styles.narrativeLabel}>Benefits</span>
                        <ul className={styles.benefitsList}>
                            <li>Individual attention for faster improvement</li>
                            <li>Customized coaching based on playing style</li>
                            <li>Improved technique and consistency</li>
                            <li>Enhanced confidence and match performance</li>
                            <li>Professional guidance for higher-level cricket opportunities</li>
                        </ul>
                    </div>

                    <div className={styles.block}>
                        <span className={styles.narrativeLabel}>Goal</span>
                        <p className={styles.goal}>
                            Our Personal Cricket Training Program is dedicated to unlocking every player&apos;s full potential through customized coaching, expert mentorship, and focused skill development. By addressing individual strengths and improvement areas, we help players build confidence, achieve consistent performance, and prepare for success at every level of competitive cricket.
                        </p>
                    </div>
                </div>
            </section>
            <CoachingProgram data={data?.coachingProgram} loading={loading} />
            <AssociatedExperts data={data?.experts} loading={loading} />
            <CommonCompo />
        </>
    )
}

export default page
