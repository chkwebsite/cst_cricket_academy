"use client";

import Slider from "react-slick";

export default function HeroSlider() {

    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
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

    const items = [
        { "id": "1", "title": "Banner_1", "banner_img": "./images/uploads/top_banner/bann-1.jpg" },
        { "id": "1", "title": "Banner_1", "banner_img": "./images/uploads/top_banner/bann-2.jpg" },
        { "id": "1", "title": "Banner_1", "banner_img": "./images/uploads/top_banner/bann-3.jpg" },
        { "id": "1", "title": "Banner_1", "banner_img": "./images/uploads/top_banner/bann-4.jpg" },
        { "id": "1", "title": "Banner_1", "banner_img": "./images/uploads/top_banner/bann-5.jpg" }
    ];

    return (
        <div className="row">
            <div className="col-xl-11 col-lg-11 col md-11 col-sm-10 m-auto">

                <Slider {...settings}>
                    {items.map((item, index) => (
                        <div key={index} className="p-2">
                            <div style={{ borderBottom: '0px solid #182e26' }}>
                                <img src={item.banner_img} alt="bann" className="w-100" />
                            </div>
                        </div>
                    ))}
                </Slider>

            </div>
        </div>
    );
}