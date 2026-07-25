import React from 'react'
import CommonCompo from '@/components/website/CommonCompo';
import styles from "./JuniorCricket.module.css";

const page = () => {
    return (
        <>
            <section className={styles.programSection}>
                <div className={styles.inner}>
                    <span className={styles.eyebrow}>Junior Program</span>
                    <h1 className={styles.headline}>Junior Cricket</h1>
                    <p className={styles.tagline}>
                        A structured foundation for young cricketers, built on fundamentals, discipline, and a genuine love for the game.
                    </p>

                    <div className={styles.quickFacts}>
                        <span className={styles.chip}>Age Group <strong>6–14 Yrs</strong></span>
                        <span className={styles.chip}>Level <strong>Beginner–Intermediate</strong></span>
                        <span className={styles.chip}>Open To <strong>Boys & Girls</strong></span>
                        <span className={styles.chip}>Format <strong>Age-Specific Batches</strong></span>
                    </div>

                    <div className={styles.narrative}>
                        <span className={styles.narrativeLabel}>Description</span>
                        <div className={styles.copy}>
                            <p>
                                Our Junior Cricket Program is specially designed for children aged 6 to 14 years, providing the perfect foundation for young cricketers to learn, grow, and excel. Through structured coaching sessions, our experienced coaches focus on developing cricket fundamentals while ensuring every child enjoys the learning process.
                            </p>
                            <p>
                                The program emphasizes batting, bowling, fielding, wicket-keeping, fitness, teamwork, discipline, and sportsmanship. Training is conducted in a safe, encouraging, and positive environment where every player receives individual attention according to their skill level.
                            </p>
                            <p>
                                Whether your child is taking the first step into cricket or aiming to compete at district and state levels, our Junior Cricket Program helps build confidence, improve technical skills, and develop a lifelong passion for the game.
                            </p>
                        </div>
                    </div>

                    <div className={styles.block}>
                        <span className={styles.narrativeLabel}>Highlights</span>
                        <div>
                            <ul className={styles.highlightGrid}>
                                <li>Professional coaching by certified and experienced coaches</li>
                                <li>Age-specific training batches</li>
                                <li>Focus on batting, bowling, fielding, and wicket-keeping</li>
                                <li>Physical fitness and agility development</li>
                                <li>Match practice and regular tournaments</li>
                                <li>Individual performance assessment</li>
                                <li>Safe and player-friendly training environment</li>
                                <li>Pathway to district, state, and national-level cricket</li>
                            </ul>
                        </div>
                    </div>

                    <div className={styles.block}>
                        <span className={styles.narrativeLabel}>Suitable For</span>
                        <ul className={styles.suitableList}>
                            <li>Age Group: <b>6–14 Years</b></li>
                            <li>Beginner to Intermediate Players</li>
                            <li>Boys and Girls</li>
                        </ul>
                    </div>

                    <div className={styles.block}>
                        <span className={styles.narrativeLabel}>Goal</span>
                        <p className={styles.goal}>
                            Our goal is to nurture young talent by providing quality cricket coaching, building confidence, developing discipline, and preparing aspiring players for higher levels of competitive cricket.
                        </p>
                    </div>
                </div>
            </section>
            <CommonCompo />
        </>
    )
}

export default page
