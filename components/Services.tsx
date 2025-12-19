"use client";
import styles from "../styles/Services.module.css";
import { useState } from "react";
import { Ruler, Wrench, Settings, BarChart3 } from "lucide-react";

interface Service {
  id: number;
  title: string;
  shortDesc: string;
  details?: string[];
  Icon: React.ElementType;
}

const services: Service[] = [
  {
    id: 1,
    title: "Site Survey & Sizing",
    shortDesc: "Evaluation of sites to size solar systems for optimal performance.",
    details: ["On-site inspections", "Load analysis", "System sizing reports"],
    Icon: Ruler,
  },
  {
    id: 2,
    title: "Installation Services",
    shortDesc: "Professional installation of solar systems on rooftops or ground mounts.",
    details: ["Residential & commercial installs", "Quality assurance checks"],
    Icon: Wrench,
  },
  {
    id: 3,
    title: "Servicing Existing Systems",
    shortDesc: "Maintenance, repair, troubleshooting, and upgrades for installed systems.",
    details: [
      "Routine maintenance",
      "System troubleshooting",
      "Repairs",
      "System upgrades",
    ],
    Icon: Settings,
  },
  {
    id: 4,
    title: "Consultation Services",
    shortDesc:
      "Expert guidance including energy audits, cost analysis, ROI, and compliance.",
    details: [
      "Energy audits",
      "Cost analysis & ROI calculations",
      "Regulatory compliance",
    ],
    Icon: BarChart3,
  },
];

export default function ServicesSection() {
  const [openService, setOpenService] = useState<number | null>(null);

  const toggleService = (id: number) => {
    setOpenService(openService === id ? null : id);
  };

  return (
    <section className={styles.services}>
      <h2 className={styles.heading}>Our Services</h2>
      <div className={styles.grid}>
        {services.map((service) => {
          const isOpen = openService === service.id;
          return (
            <div key={service.id} className={styles.card}>
              <div className={styles.icon}>
                <service.Icon size={40} strokeWidth={1.6} />
              </div>
              <h3 className={styles.title}>{service.title}</h3>
              <p className={styles.shortDesc}>{service.shortDesc}</p>

              {service.details && (
                <button
                  className={styles.toggleBtn}
                  onClick={() => toggleService(service.id)}
                >
                  {isOpen ? "Hide details ▲" : "View details ▼"}
                </button>
              )}

              <div
                className={`${styles.accordion} ${
                  isOpen ? styles.open : ""
                }`}
              >
                <ul className={styles.details}>
                  {service.details?.map((detail, idx) => (
                    <li key={idx}>{detail}</li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
