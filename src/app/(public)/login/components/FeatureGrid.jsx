import {
  GraduationCap,
  TrainFront,
  Users,
} from "lucide-react";

import FeatureCard from "./FeatureCard";

export default function FeatureGrid() {
  return (
    <div
      className="
        grid
        h-full
        min-h-0
        grid-cols-3
        gap-3
      "
    >
      <FeatureCard
        type="psc"
        icon={GraduationCap}
        title="Kerala PSC"
        description="Expert preparation for Kerala government careers."
        linkLabel="Explore Courses"
      />

      <FeatureCard
        type="rrb"
        icon={TrainFront}
        title="SSC & RRB"
        description="Focused preparation for central and railway examinations."
        linkLabel="Explore Courses"
      />

      <FeatureCard
        type="faculty"
        icon={Users}
        title="Expert Guidance"
        description="Learn with experienced faculty and structured support."
        linkLabel="Know More"
      />
    </div>
  );
}