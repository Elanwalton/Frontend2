"use client";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { buildMediaUrl } from '@/utils/media';
import styles from '@/styles/Banner.module.css';

const Hero = () => {
  const offers = [
    {
      title: "300W Solar Panel",
      oldPrice: 15000,
      newPrice: 11999,
      discount: "20% OFF",
      image: buildMediaUrl("images/solar.png"),
      expiry: Date.now() + 1000 * 60 * 60 * 8,
    },
    {
      title: "Lithium Battery 200Ah",
      oldPrice: 120000,
      newPrice: 95000,
      discount: "21% OFF",
      image: buildMediaUrl("images/lithium-battery.png"),
      expiry: Date.now() + 1000 * 60 * 60 * 12,
    },
    {
      title: "Hybrid Inverter 5kW",
      oldPrice: 85000,
      newPrice: 69999,
      discount: "18% OFF",
      image: buildMediaUrl("images/inverter.png"),
      expiry: Date.now() + 1000 * 60 * 60 * 6,
    },
    {
      title: "Heat Pump Water Heater",
      oldPrice: 180000,
      newPrice: 149999,
      discount: "17% OFF",
      image: buildMediaUrl("images/heat-pump.png"),
      expiry: Date.now() + 1000 * 60 * 60 * 24,
    },
  ];

  const [timeLeft, setTimeLeft] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    const interval = setInterval(() => {
      const updated: { [key: number]: string } = {};

      offers.forEach((offer, idx) => {
        const distance = offer.expiry - Date.now();

        if (distance > 0) {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((distance / (1000 * 60)) % 60);
          const seconds = Math.floor((distance / 1000) % 60);

          const format = (num: number) => String(num).padStart(2, "0");
          updated[idx] = `${format(days)}d ${format(hours)}h ${format(
            minutes
          )}m ${format(seconds)}s`;
        } else {
          updated[idx] = "Expired";
        }
      });

      setTimeLeft(updated);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className={styles.hero}>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation={true} // ✅ arrows
        pagination={{ clickable: true }} // ✅ dots
        autoplay={{ delay: 5000 }}
        loop={true}
        className={styles.swiper}
      >
        {offers.map((offer, idx) => (
          <SwiperSlide key={idx}>
            <div className={styles.slide}>
              {/* Left Side */}
              <div className={styles.text}>
                <h2>⚡ Flash Sales</h2>
                <h3>{offer.title}</h3>
                <p>
                  <span className={styles.newPrice}>KSH {offer.newPrice}</span>{" "}
                  <span className={styles.oldPrice}>KSH {offer.oldPrice}</span>
                </p>
                <span className={styles.discount}>{offer.discount}</span>

                <p className={styles.timer}>
                  Ends in: {timeLeft[idx] || "Loading..."}
                </p>

                <div className={styles.ctaButtons}>
                  <a
                    href="https://wa.me/254740886459"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.whatsappBtn}
                  >
                    Chat on WhatsApp
                  </a>
                  <a href="/shop" className={styles.shopBtn}>
                    Shop Now
                  </a>
                </div>
              </div>

              {/* Right Side */}
              <div className={styles.image}>
                <img src={offer.image} alt={offer.title} />
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default Hero;
