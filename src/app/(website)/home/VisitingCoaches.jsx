"use client";
import Link from 'next/link';
import React, { useState, useEffect } from 'react'
import Image from 'next/image';

const VisitingCoaches = ({ data, loading }) => {
    // const [coachList, setCoachList] = useState([]);
    // const [loading, setLoading] = useState(true);
    // const [error, setError] = useState(null);

    // useEffect(() => {
    //     async function loadCoachesList() {
    //         try {
    //             const res = await fetch("/api/profile?profile_type=1");
    //             const json = await res.json();
    //             if (!res.ok) throw new Error(json.message || "Unable to load coaching Program.");
    //             setCoachList(json.data || []);
    //         } catch (err) {
    //             setError(err.message);
    //         } finally {
    //             setLoading(false);
    //         }
    //     }

    //     loadCoachesList();
    // }, []);
    // console.log("coachList", coachList);
    return (
        <div className="row bg-info-subtle">
            <div className="col-xl-11 col-lg-11 col-md-11 col-sm-12 m-auto py-5">
                <h1 className='mb-5 text-center'>Our Elite Visiting Coaches</h1>
                {loading ? (
                    <div className="text-center py-5 text-muted">Loading Our Elite Visiting Coaches...</div>
                ) : data.length === 0 ? (
                    <div className="text-center py-5 text-muted">No Our Elite Visiting Coaches found yet.</div>
                ) : (
                    <div className="row g-3">
                        {data.map((item, index) => (
                            <div className="col-xl-3 cpl-lg-3 col-md-4 col-sm-6" key={index}>
                                <div className="card border-0 bg-transparent shadow-none extra">
                                    <Link href={`/home/${item.id}/CoachDetail`} className='stretched-link'>
                                        {/* <img className='card-img-top' src={item.program_image} alt={index} /> */}
                                        <div style={{ position: 'relative', width: '100%', height: '250px' }}>
                                            <Image src={item.profile_image} alt={item.title} fill className='profile_img' />
                                        </div>
                                        <div className="card-body">
                                            <h4 className='fw-bold text-center'>{item.first_name} {item.last_name} </h4>
                                            <p className='text-center text-muted'>{item.designation}</p>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default VisitingCoaches
