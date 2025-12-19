import styles from '@/styles/ServicesHighlights.module.css';

interface Service {
  img: string;
  title: string;
  desc: string;
}

const services: Service[] = [
  {
    img: "/free-delivery.png", // replace with your link
    title: "Free Shipping",
    desc: "Free shipping for order above KES15000",
  },
  {
    img: "/payment-method.png", // replace with your link
    title: "Flexible Payment",
    desc: "Multiple secure payment options",
  },
  {
    img: "/24-hours-support.png", // replace with your link
    title: "24x7 Support",
    desc: "We support online all days",
  },
];

export default function ServiceHighlights() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {services.map((service, idx) => (
          <div key={idx} className={styles.card}>
            <img src={service.img} alt={service.title} className={styles.icon} />
            <h3 className={styles.title}>{service.title}</h3>
            <p className={styles.desc}>{service.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
