import React from 'react'

import CommonCompo from '@/components/website/CommonCompo';
import styles from "./AdvancedCoaching.module.css";

const page = () => {
    return (
        <>
            <section className={styles.programSection}>
                <div className={styles.inner}>
                    <span className={styles.eyebrow}>Advanced Program</span>
                    <h1 className={styles.headline}>Advanced Cricket Coaching</h1>
                    <p className={styles.tagline}>
                        High-performance training for dedicated players ready to compete at the district, state, and national level.
                    </p>

                    <div className={styles.quickFacts}>
                        <span className={styles.chip}>Age Group <strong>15+ Yrs</strong></span>
                        <span className={styles.chip}>Level <strong>Intermediate–Advanced</strong></span>
                        <span className={styles.chip}>Open To <strong>Boys & Girls</strong></span>
                        <span className={styles.chip}>Standard <strong>Club to State-Level</strong></span>
                    </div>

                    <div className={styles.narrative}>
                        <span className={styles.narrativeLabel}>Description</span>
                        <div className={styles.copy}>
                            <p>
                                Our Advanced Cricket Coaching Program is designed for dedicated players who are ready to take their game to the next level. This program is ideal for cricketers competing in school, club, district, state, or national tournaments and looking to refine their technical skills, tactical awareness, and overall performance.
                            </p>
                            <p>
                                Training sessions are conducted by experienced coaches using modern coaching techniques, match simulations, and performance analysis. Players receive specialized coaching in batting, bowling, fielding, wicket-keeping, fitness, and mental conditioning to help them perform consistently under competitive conditions.
                            </p>
                            <p>
                                The program emphasizes discipline, game strategy, decision-making, and high-performance training, preparing players for elite-level cricket and professional opportunities.
                            </p>
                        </div>
                    </div>

                    <div className={styles.block}>
                        <span className={styles.narrativeLabel}>Highlights</span>
                        <div>
                            <ul className={styles.highlightGrid}>
                                <li>Advanced batting, bowling, and fielding techniques</li>
                                <li>Match simulation and game scenario practice</li>
                                <li>Personalized performance analysis and feedback</li>
                                <li>Video analysis for technical improvement</li>
                                <li>Strength, endurance, speed, and agility training</li>
                                <li>Mental conditioning and match temperament development</li>
                                <li>Regular practice matches and competitive tournaments</li>
                                <li>Guidance for district, state, university, and national-level selection</li>
                            </ul>
                        </div>
                    </div>

                    <div className={styles.block}>
                        <span className={styles.narrativeLabel}>Suitable For</span>
                        <ul className={styles.suitableList}>
                            <li>Age Group: 15 Years & Above</li>
                            <li>Intermediate to Advanced Players</li>
                            <li>Club, School, District & State-Level Cricketers</li>
                            <li>Boys and Girls</li>
                        </ul>
                    </div>

                    <div className={styles.block}>
                        <span className={styles.narrativeLabel}>Goal</span>
                        <p className={styles.goal}>
                            Our objective is to transform talented cricketers into confident, match-ready athletes by enhancing their technical excellence, physical fitness, tactical understanding, and competitive mindset. Through professional coaching and structured development programs, we help players maximize their potential and prepare for higher levels of cricket.
                        </p>
                    </div>
                </div>
            </section>
            <CommonCompo />
        </>
    )
}

export default page
