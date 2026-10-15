import Link from "next/link";

export default function TopicWisePagination({
  currentPage = 1,
  totalPages = 1,
  basePath,
  governmentExamsSlug,
  uid = 0,
}) {
  if (totalPages <= 1) return null;

  const root =
    basePath ||
    `${Number(uid) > 0 ? "/dashboard" : "/government-exams-coaching"}` +
    `/${governmentExamsSlug}/topic-wise-exams`;

  const first = Math.max(
    1,
    Math.min(currentPage - 2, totalPages - 4)
  );

  const pages = Array.from(
    { length: Math.min(5, totalPages) },
    (_, index) => first + index
  );

  return (
    <nav
      aria-label="Topic pages"
      className="mt-7 flex flex-wrap justify-center gap-2"
    >
      {currentPage > 1 && (
        <Link
          href={`${root}?page=${currentPage - 1}`}
          className="rounded-xl border bg-white px-4 py-2"
        >
          Previous
        </Link>
      )}

      {pages.map((page) => (
        <Link
          key={page}
          href={`${root}?page=${page}`}
          aria-current={
            page === currentPage ? "page" : undefined
          }
          className={`rounded-xl border px-4 py-2 font-bold ${page === currentPage
              ? "bg-blue-700 text-white"
              : "bg-white text-blue-700"
            }`}
        >
          {page}
        </Link>
      ))}

      {currentPage < totalPages && (
        <Link
          href={`${root}?page=${currentPage + 1}`}
          className="rounded-xl border bg-white px-4 py-2"
        >
          Next
        </Link>
      )}
    </nav>
  );
}