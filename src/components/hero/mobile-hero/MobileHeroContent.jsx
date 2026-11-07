import Link from "next/link";
import { ArrowUpRight, ArrowRight, BookOpen, GraduationCap, ClipboardCheck, Sparkles } from "lucide-react";
import styles from "./MobileHero.module.css";

const features = [
  { icon: GraduationCap, title: "Expert-led", detail: "Learn with mentors" },
  { icon: ClipboardCheck, title: "Exam-ready", detail: "Practise mock tests" },
  { icon: BookOpen, title: "Stay ahead", detail: "Updated materials" },
];

export default function MobileHeroContent() {
  return (
    <div className={styles.content}>
      <div className={styles.copy}>
        <div className={styles.eyebrow}><span /> YOUR NEXT CHAPTER STARTS HERE</div>
        <div className={styles.exams} aria-label="Exams we prepare you for">
          <span>Kerala PSC</span><span>SSC</span><span>RRB</span>
        </div>
        <h1 className={styles.title}>Big ambitions.<br />Better <span>preparation.</span></h1>
        <p className={styles.description}>Build the confidence to ace your next exam. Expert classes, focused practice and the right resources, all in one place.</p>
        <div className={styles.actions}>
          <Link href="/login" className={styles.primary}>Start learning <ArrowUpRight size={19} aria-hidden="true" /></Link>
          <Link href="/contact" className={styles.secondary}>Talk to us <ArrowRight size={17} aria-hidden="true" /></Link>
        </div>
        <p className={styles.note}>Your goals. Your pace. Your MasterMind.</p>
      </div>
      <div className={styles.learningCard}>
        <div className={styles.cardTop}>
          <span className={styles.spark}><Sparkles size={19} aria-hidden="true" /></span>
          <div><p className={styles.cardLabel}>THE MASTERMIND METHOD</p><h2>A little progress. Every day.</h2></div>
        </div>
        <div className={styles.path} aria-label="Learn, practise, progress">
          <span>01 <strong>Learn</strong></span><ArrowRight size={14} aria-hidden="true" />
          <span>02 <strong>Practise</strong></span><ArrowRight size={14} aria-hidden="true" />
          <span>03 <strong>Progress</strong></span>
        </div>
        <div className={styles.features}>
          {features.map(({icon: Icon, title, detail}) => (
            <div className={styles.feature} key={title}>
              <Icon size={19} aria-hidden="true" />
              <div><h3>{title}</h3><p>{detail}</p></div>
            </div>
          ))}
        </div>
        <div className={styles.cardFooter}><span /> Made for your next big step</div>
      </div>
    </div>
  );
}
