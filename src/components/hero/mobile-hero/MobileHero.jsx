import MobileHeroContent from "./MobileHeroContent";
import styles from "./MobileHero.module.css";

export default function MobileHero() {
  return (
    <section className={styles.hero} aria-label="MasterMind exam preparation">
      <div className={styles.orbit} aria-hidden="true" />
      <MobileHeroContent />
    </section>
  );
}
