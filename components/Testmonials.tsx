// components/Testimonials.tsx
"use client";
import { buildMediaUrl } from '@/utils/media';
import Image from "next/image";
import styles from '@/styles/Testimonials.module.css';
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

const testimonials = [
  {
    name: "Esther Howard",
    role: "Graphic Designer",
    rating: 4.5,
    image: buildMediaUrl("images/esther.jpg"),
    text: "Morbi ac orci hac. Donec pretium. Aliquam porta nisi vitae, malesuada elementum.",
  },
  {
    name: "Kristin Watson",
    role: "Architecture",
    rating: 4.2,
    image: buildMediaUrl("images/kristin.jpg"),
    text: "Morbi ac orci hac. Donec pretium. Aliquam porta nisi vitae, malesuada elementum.",
  },
  {
    name: "Courtney Henry",
    role: "Web Developer",
    rating: 4.9,
    image: buildMediaUrl("images/courtney.jpg"),
    text: "Morbi ac orci hac. Donec pretium. Aliquam porta nisi vitae, malesuada elementum.",
  },
];

const Testimonials = () => {
  return (
    <section className={styles.testimonialSection}>
      <h4 className={styles.subtitle}>Testimonial</h4>
      <h2 className={styles.title}>
        What Our <span>Clients Say</span>
      </h2>

      <Swiper
        modules={[Pagination]}
        spaceBetween={20}
        slidesPerView={1}
        pagination={{ clickable: true }}
        breakpoints={{
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        className={styles.swiper}
      >
        {testimonials.map((item, index) => (
          <SwiperSlide key={index}>
            <div className={styles.card}>
              <div className={styles.profile}>
                <Image
                  src={item.image}
                  alt={item.name}
                  width={60}
                  height={60}
                  className={styles.avatar}
                />
                <div>
                  <h3 className={styles.name}>{item.name}</h3>
                  <p className={styles.role}>{item.role}</p>
                </div>
              </div>

              <div className={styles.rating}>
                {"⭐".repeat(Math.floor(item.rating))}
                <span className={styles.score}>{item.rating}</span>
              </div>

              <p className={styles.text}>{item.text}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default Testimonials;
