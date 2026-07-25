"use client";
import { useEffect, useState } from "react";
import CommonCompo from '@/components/website/CommonCompo';
import CoachingProgram from "../home/CoachingProgram";
import CoachesList from "../home/CoachesList";
import VisitingCoaches from "../home/VisitingCoaches";
import AssociatedExperts from "../home/AssociatedExperts";
import Branchs from "../home/Branchs";

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
            <CoachingProgram data={data?.coachingProgram} loading={loading} />
            <AssociatedExperts data={data?.experts} loading={loading} />
            <CoachesList data={data?.regularCoaches} loading={loading} />
            <VisitingCoaches data={data?.visitingCoaches} loading={loading} />
            <CommonCompo />
        </>
    )
}

export default page
