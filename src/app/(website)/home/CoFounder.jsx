"use client";
import React, { useEffect, useRef, useState } from 'react'
import Slider from "react-slick";
import "../left_right.css"

const CoFounder = ({ data, loading }) => {
  // const [coFounders, setCoFounders] = useState([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);

  // useEffect(() => {
  //   async function loadCoFounders() {
  //     try {
  //       const res = await fetch("/api/co-founders");
  //       const json = await res.json();
  //       if (!res.ok) throw new Error(json.message || "Unable to load co-founders.");
  //       setCoFounders(json.data || []);
  //     } catch (err) {
  //       setError(err.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }

  //   loadCoFounders();
  // }, []);
  //console.log("coFounders", coFounders);

  //Slider Setting
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: true,
    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={`row bg-primary-subtle py-5 founders-section ${inView ? "in-view" : ""}`}>
      <span className="founders-blob founders-blob--1" aria-hidden="true"></span>
      <span className="founders-blob founders-blob--2" aria-hidden="true"></span>

      <div className="col-xl-11 col-lg-11 col-md-11 col-sm-12 m-auto">
        <div className="text-center mb-5 founders-header">
          <div className="d-inline-flex align-items-center gap-2 mb-2">
            <span className="section-rule"></span>
            <span className="theme_color fw-semibold text-uppercase small">Leadership</span>
            <span className="section-rule"></span>
          </div>
          <h1 className="fw-bolder mb-2">Meet Our Founders</h1>
          <p className="text-secondary mb-0 mx-auto" style={{ maxWidth: 520 }}>
            Decades of coaching experience behind every branch, program, and player we develop.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-5 text-muted">Loading co-founders...</div>
        ) : data.length === 0 ? (
          <div className="text-center py-5 text-muted">No co-founders found yet.</div>
        ) : (
          <Slider {...settings}>
            {data.map((item, index) => (
              <div className='' key={index}>
                <div className="row">
                  <div className="col">
                    <div className="card border-0 bg-transparent">

                      <aside className="panel">
                        <div className="portrait-wrap">
                          <span className="portrait-ring"></span>
                          <div className="portrait">
                            <img src={item.profile_image} alt="bann" className="co_founder_img" />
                          </div>
                        </div>

                        <div className="divider-line"></div>

                        <div className="panel-stats">
                          <div className="panel-stat">
                            <span className="num">50+</span>
                            <span className="lbl">Years Coaching Career</span>
                          </div>
                          <div className="panel-stat">
                            <span className="num">12</span>
                            <span className="lbl">International Cricketers Trained</span>
                          </div>
                          <div className="panel-stat">
                            <span className="num">100+</span>
                            <span className="lbl">National Cricketers Trained</span>
                          </div>
                        </div>
                      </aside>

                      <main className="content">
                        <div className="eyebrow reveal r1">{item.title}</div>
                        <h1 className='reveal r2'>{item.name}</h1>
                        <div className="designation reveal r3">{item.designation}</div>
                        <span className="sub-designation reveal r3">{item.sub_designation}</span>

                        <div className="meta-row reveal r4">
                          <div className="meta-item">
                            <div className="k">Experience</div>
                            <div className="v">{item.experience}</div>
                          </div>
                          <div className="meta-item">
                            <div className="k">Qualification</div>
                            <div className="v">{item.qualification}</div>
                          </div>
                        </div>

                        <div className="bio reveal r5" dangerouslySetInnerHTML={{ __html: item.description }}>

                        </div>
                      </main>

                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        )}
      </div>

      <style>{`
        .founders-section {
          position: relative;
          overflow: hidden;
        }

        .founders-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          pointer-events: none;
          z-index: 0;
        }

        .founders-blob--1 {
          width: 340px;
          height: 340px;
          top: -80px;
          left: -60px;
          background: rgba(0, 150, 136, 0.16);
          animation: founders-drift-1 26s ease-in-out infinite alternate;
        }

        .founders-blob--2 {
          width: 300px;
          height: 300px;
          bottom: -100px;
          right: -60px;
          background: rgba(201, 162, 75, 0.14);
          animation: founders-drift-2 32s ease-in-out infinite alternate;
        }

        @keyframes founders-drift-1 {
          from { transform: translate(0, 0); }
          to { transform: translate(40px, 30px); }
        }

        @keyframes founders-drift-2 {
          from { transform: translate(0, 0); }
          to { transform: translate(-35px, -25px); }
        }

        .founders-section > .col-xl-11 {
          position: relative;
          z-index: 1;
        }

        .founders-header {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }

        .founders-section.in-view .founders-header {
          opacity: 1;
          transform: translateY(0);
        }

        .section-rule {
          display: inline-block;
          width: 24px;
          height: 2px;
          background: #009688;
          opacity: 0.5;
        }

        @media (prefers-reduced-motion: reduce) {
          .founders-blob { animation: none; }
          .founders-header {
            opacity: 1;
            transform: none;
            transition: none;
          }
        }
      `}</style>
    </section>
  )
}

export default CoFounder
