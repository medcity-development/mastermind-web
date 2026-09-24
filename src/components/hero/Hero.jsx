import DesktopHero from "./desktop-hero/DesktopHero";
import MobileHero from "./mobile-hero/MobileHero";

export default function Hero() {
  return (
    <>
      {/* Mobile / tablet / smaller laptops */}
      <div className="xl:hidden">
        <MobileHero />
      </div>

      {/* Desktop 3-column hero */}
      <div className="hidden xl:block" id="hero">
        <DesktopHero />
      </div>
    </>
  );
}