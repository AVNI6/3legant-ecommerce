"use client";
import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";
import { slides } from "@/constants/Data";
import dynamic from "next/dynamic";

const Slider = dynamic(() => import("react-slick"), { ssr: false });

const ArrowNext = (props: any) => {
  const { onClick } = props;
  return (
    <button type="button"
      className="hidden md:flex w-12 h-12 lg:w-14 lg:h-14 justify-center items-center rounded-full absolute z-10 top-1/2 -translate-y-1/2 bg-white right-4 lg:right-10"
      onClick={onClick} >
      <IoIosArrowForward />
    </button>
  );
};

const ArrowPrev = (props: any) => {
  const { onClick } = props;
  return (
    <button
      type="button"
      className="hidden md:flex w-12 h-12 lg:w-14 lg:h-14 justify-center items-center rounded-full absolute z-10 top-1/2 -translate-y-1/2 bg-white left-4 lg:left-10"
      onClick={onClick}>
      <IoIosArrowBack />
    </button>
  );
};

const ImageSlider = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1000,
    pauseOnHover: true,
    arrows: true,
    nextArrow: <ArrowNext />,
    prevArrow: <ArrowPrev />,

    responsive: [
      {
        breakpoint: 1024,
        settings: {
          arrows: true,
          dots: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          arrows: true,
          dots: true,
        },
      },
    ],
  };

  return (
    <section className="px-4 sm:px-10 lg:px-30">
      <Slider {...settings}>
        {slides.map((slide) => (
          <div key={slide.id}>
            <img
              src={slide.image}
              className="w-full h-[250px] sm:h-[350px] md:h-[450px] lg:h-[600px] object-cover"
              alt="slider image"
            />
          </div>
        ))}
      </Slider>
    </section>
  );
};

export default ImageSlider;