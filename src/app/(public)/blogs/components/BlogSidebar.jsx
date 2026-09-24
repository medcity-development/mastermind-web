
import MotivationCard from "./MotivationCard";
import RecentPosts from "./RecentPosts";
import CommunityStats from "./CommunityStats";
import BlogExploreCard from "./BlogExploreCard";

export default function BlogSidebar() {
  return (
    <aside
      className="
        grid
        gap-4
        sm:grid-cols-2
        xl:grid-cols-1
        xl:self-start
      " data-aos="fade-left"
    >
      <BlogExploreCard />
      <MotivationCard />
      <RecentPosts />
      <CommunityStats />
    </aside>
  );
}