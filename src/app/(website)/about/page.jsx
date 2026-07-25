"use client";
import { useEffect, useState } from "react";
import CoFounder from '../home/CoFounder'
import CommonCompo from '@/components/website/CommonCompo';
import CoachingProgram from "../home/CoachingProgram";
import styles from "./About.module.css";

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
            <section className={styles.aboutSection}>
                <div className={styles.inner}>
                    <span className={styles.eyebrow}>Est. 2000 &mdash; New Delhi</span>
                    <h1 className={styles.headline}>About CST Cricket Academy</h1>

                    <div className={styles.scoreboard}>
                        <div className={styles.stat}>
                            <span className={styles.statNumber}>12+</span>
                            <span className={styles.statLabel}>International Players</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statNumber}>100+</span>
                            <span className={styles.statLabel}>National Players</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statNumber}>6</span>
                            <span className={styles.statLabel}>Decades Coaching</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statNumber}>2</span>
                            <span className={styles.statLabel}>National Honours</span>
                        </div>
                    </div>

                    <div className={styles.narrative}>
                        <span className={styles.narrativeLabel}>The Legacy</span>
                        <div className={styles.copy}>
                            <p>
                                Established in the year 2000 by Chandan Keshri, recipient of CST and Padma Shri Awards, by the Government of India, CST Cricket Academy has grown as a premier institute dedicated to nurturing cricketing talent with passion and zeal in accordance with the nation&apos;s love affair with the sport.
                            </p>
                            <p>
                                Following a distinguished stint as the Chief Cricket Coach at the Sports Authority of India, Chandan Keshri after his retirement, decided to pass on his mantle by setting up an academy that offers world-class coaching, best-in-class facilities, and expert mentorship to young cricketers. His zeal has moulded the sporting lives of more than 12 international and over 100 national players, and is the most iconic coach in Indian cricketing history.
                            </p>
                            <hr className={styles.rule} />
                            <p>
                                With over six decades of professional career, Chandan Keshri continues to be an active participant in coaching, leading a team of extremely experienced and highly regarded trainers. CST Cricket Academy, under his guidance, is now the premier institution for excellence, discipline, and professional cricket training, as young cricketers from India and abroad throng it.
                            </p>
                            <p>
                                The academy, which was initiated with the sole intention of offering quality coaching facilities to hopeful players from Delhi and NCR region, eliminating the need to travel long distances to other cricket centres, has received widespread recognition as a dependable centre for excellence in cricket and draws serious players from across the nation and abroad who seek to reach the pinnacle of the game.
                            </p>
                            <p className={styles.closing}>
                                At CST Cricket Academy, the path from dreams to success is steered by passion, experience, and an unyielding pursuit of excellence.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <CoFounder
                data={data?.coFounder ?? []}
                loading={loading}
            />
            <CoachingProgram data={data?.coachingProgram} loading={loading} />
            <CommonCompo />
        </>
    )
}

export default page
