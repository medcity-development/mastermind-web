import BlogHero from "./BlogHero";
import FeaturedArticle from "./FeaturedArticle";
import LatestArticles from "./LatestArticles";
import BlogSidebar from "./BlogSidebar";
import BlogsFAQ from "./BlogsFAQ";

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-[#f8fbff]">
      <section
        className="
          mx-auto
          w-full
          max-w-[1500px]
          px-4
          py-6
          sm:px-6
          sm:py-8
          lg:px-8
          xl:px-10
        "
      >
        <BlogHero />

        {/* ARTICLES + SIDEBAR */}
        <div
          className="
            mt-8
            grid
            gap-6
            xl:grid-cols-[minmax(0,1fr)_320px]
            2xl:grid-cols-[minmax(0,1fr)_350px]
          "
        >
          <div className="min-w-0">
            <FeaturedArticle />
            <LatestArticles />
          </div>

          <BlogSidebar />
        </div>
      </section>

      {/* FAQ FULL WIDTH / CENTERED */}
      <BlogsFAQ />
    </main>
  );
}