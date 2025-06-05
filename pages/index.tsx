import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import styles from "../styles/Landing.module.css";

export default function Home() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/login");
  };

  return (
    <div className={styles.container || "landingContainer"}>
      <nav className={styles.nav || "nav"}>
        <div className={styles.logo || "logo"}>
          <h1>BlocklyCollab</h1>
        </div>
        <div className={styles.navLinks || "navLinks"}>
          <Link href="/login" className={styles.navLink || "navLink"}>
            Login
          </Link>
          <Link href="/signup" className={styles.navButton || "navButton"}>
            Sign Up
          </Link>
        </div>
      </nav>

      <main className={styles.main || "main"}>
        <div className={styles.heroSection || "heroSection"}>
          <div className={styles.heroContent || "heroContent"}>
            <h1 className={styles.heroTitle || "heroTitle"}>
              Learn to Code with Collaborative Blocks
            </h1>
            <p className={styles.heroSubtitle || "heroSubtitle"}>
              BlocklyCollab is a visual programming platform designed to help
              people learn to code through collaborative block-based
              programming.
            </p>
            <button
              className={styles.ctaButton || "ctaButton"}
              onClick={handleGetStarted}
            >
              Get Started
            </button>
          </div>
          <div className={styles.heroImage || "heroImage"}>
            <div className={styles.videoContainer || "videoContainer"}>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  backgroundColor: "#000",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <video
                  className={styles.blocklyVideo || "blocklyVideo"}
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transform: "scale(1.05)",
                    objectPosition: "center",
                  }}
                >
                  <source
                    src="/Collab%20Blockly%20Preview.mp4"
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </div>

        <section className={styles.featuresSection || "featuresSection"}>
          <h2 className={styles.sectionTitle || "sectionTitle"}>
            Key Features
          </h2>
          <div className={styles.features || "features"}>
            <div className={styles.featureCard || "featureCard"}>
              <div className={styles.featureIcon || "featureIcon"}>🧩</div>
              <h3>Visual Programming</h3>
              <p>
                Build programs by connecting blocks together, no typing
                required.
              </p>
            </div>
            <div className={styles.featureCard || "featureCard"}>
              <div className={styles.featureIcon || "featureIcon"}>👥</div>
              <h3>Real-time Collaboration</h3>
              <p>
                Work together with friends or classmates on the same project in
                real-time.
              </p>
            </div>
            <div className={styles.featureCard || "featureCard"}>
              <div className={styles.featureIcon || "featureIcon"}>💾</div>
              <h3>Save & Share Projects</h3>
              <p>
                Save your work and share it with others to continue building
                together.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer || "footer"}>
        <p> 2025 BlocklyCollab. All rights reserved.</p>
      </footer>
    </div>
  );
}
