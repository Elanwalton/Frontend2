// components/CompanyProfile.tsx
"use client";

import { useState, useEffect } from "react";
import styles from "../styles/CompanyProfile.module.css";
import Lottie from "lottie-react";

const CompanyProfile = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [animationData, setAnimationData] = useState<any>(null);

  const toggleReadMore = () => {
    setIsExpanded(!isExpanded);
  };

  // Load JSON from /public
  useEffect(() => {
    fetch("/Animations/Windmills.json")
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch((err) => console.error("Failed to load animation", err));
  }, []);

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileCard}>
        <div className={styles.mediaContainer}>
          {animationData && (
            <Lottie
              animationData={animationData}
              loop={true}
              className={styles.animation}
            />
          )}
        </div>

        <div className={styles.content}>
          <h2 className={styles.title}>Who We Are</h2>

          <div className={styles.textContainer}>
            <p className={styles.shortText}>
              We are a team of sustainability experts dedicated to creating a
              greener future through innovative solar solutions. Our mission is
              to make renewable energy accessible to everyone.
            </p>

            <div
              className={`${styles.expandedContent} ${
                isExpanded ? styles.expanded : ""
              }`}
            >
              <p>
                Founded in 2016, we've installed over 15,000 solar systems across
                the country, helping households and businesses reduce their
                carbon footprint while saving on energy costs. Our certified
                technicians use only the highest quality materials to ensure
                maximum efficiency and durability.
              </p>
              <p>
                We believe in a sustainable future powered by clean energy, and
                we're committed to making that vision a reality one installation
                at a time.
              </p>
            </div>

            <button
              className={styles.readMoreBtn}
              onClick={toggleReadMore}
              aria-expanded={isExpanded}
            >
              {isExpanded ? "Read Less" : "Read More"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
