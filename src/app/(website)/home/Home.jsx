"use client";
import dynamic from 'next/dynamic';
import { useEffect, useState } from "react";
import HeroSlider from './HeroSlider';
import CoFounder from './CoFounder';
import CoachingProgram from './CoachingProgram';
import CoachesList from './CoachesList';
import VisitingCoaches from './VisitingCoaches';
import AssociatedExperts from './AssociatedExperts';
import Branchs from './Branchs';
import Testimonials from './Testimonials';
import CommonCompo from '@/components/website/CommonCompo';
// const HeroSlider = dynamic(() => import('./HeroSlider'), {


//   loading: () => <p>Loading Hero Slider...</p>,
// });
// const CoFounder = dynamic(() => import('./CoFounder'), {
//   loading: () => <p>Loading Co-Founder...</p>,
// });
// const CoachingProgram = dynamic(() => import('./CoachingProgram'), {
//   loading: () => <p>Loading Coaching Program...</p>,
// });
// const CoachesList = dynamic(() => import('./CoachesList'), {
//   loading: () => <p>Loading Coaches Listing...</p>,
// })
// const VisitingCoaches = dynamic(() => import('./VisitingCoaches'), {
//   loading: () => <p>Loading Visiting Coaches...</p>,
// })
// const AssociatedExperts = dynamic(() => import('./AssociatedExperts'), {
//   loading: () => <p>Loading Visiting Coaches...</p>,
// })
// const Branchs = dynamic(() => import('./Branchs'), {
//   loading: () => <p>Loading Branch...</p>,
// })
const Homes = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadHome() {
      try {
        const res = await fetch("/api/getAllHome");
        const json = await res.json();

        if (json.success) {
          setData(json.data);
        }
      } catch (error) {
        setError(err.message);
      } finally {
        setLoading(false);
      }

    }

    loadHome();
  }, []);

  if (!data) return
  <div className="state-screen">
    <div className="spinner" />
    <p>Loading All Home Data…</p>
    <style jsx>{`
                    .state-screen { min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; font-family: 'Inter', sans-serif; color: #22231f; }
                    .spinner { width: 34px; height: 34px; border: 3px solid #e4ddc9; border-top-color: #a6332b; border-radius: 50%; animation: spin 0.8s linear infinite; }
                    @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>
  </div>
    ;
  return (
    <>
    <div className='container-fluid'>
      {error && <div className="alert alert-danger">{error}</div>}
      {loading && (
        <div className="state-screen">
          <div className="spinner" />
          <p>Loading All Home Data…</p>
          <style jsx>{`
                    .state-screen { min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; font-family: 'Inter', sans-serif; color: #22231f; }
                    .spinner { width: 34px; height: 34px; border: 3px solid #e4ddc9; border-top-color: #a6332b; border-radius: 50%; animation: spin 0.8s linear infinite; }
                    @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>
        </div>
      )}
      <HeroSlider />
      <CoFounder data={data.coFounder} loading={loading} />
      <CoachingProgram data={data.coachingProgram} loading={loading} />
      <CoachesList data={data.regularCoaches} loading={loading} />
      <VisitingCoaches data={data.visitingCoaches} loading={loading} />
      <AssociatedExperts data={data.experts} loading={loading} />
      <Branchs data={data.branches} loading={loading} />
      <Testimonials data={data.testimonials} loading={loading} />
      
    </div>
    <CommonCompo />
    </>
  )
}

export default Homes
