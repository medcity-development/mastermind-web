"use client";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import TopicChapterCard from "./TopicChapterCard";
import TopicVideoPlayer from "./TopicVideoPlayer";

export default function TopicChapterList({ topic, chapters = [], loading = false, error = "", onBack, mockTestId, cid, governmentExamsSlug, onStartMockTest }) {
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const sortedChapters = useMemo(() => Array.isArray(chapters) ? [...chapters].sort((a,b) => Number(a?.order ?? a?.orders ?? 0) - Number(b?.order ?? b?.orders ?? 0)) : [], [chapters]);
  useEffect(() => {
    if (loading) return;
    const first = sortedChapters[0] ?? null;
    setSelectedChapter(first);
    setShowPlayer(Boolean(first));
  }, [topic?.id, loading, sortedChapters]);
  if (showPlayer && selectedChapter) return <TopicVideoPlayer topic={topic} chapter={selectedChapter} chapters={sortedChapters} error={error} onBack={() => setShowPlayer(false)} mockTestId={mockTestId} cid={cid} governmentExamsSlug={governmentExamsSlug} onStartMockTest={onStartMockTest} />;
  return <section className="mt-5 rounded-3xl border border-blue-100 bg-white p-5 sm:p-6">
    <button type="button" onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-blue-700"><ArrowLeft size={16}/>All Topics</button>
    <h2 className="mt-5 text-xl font-black text-[#071f55]">{topic?.name || topic?.title || "Topic"}</h2>
    {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
    {loading ? <div className="flex min-h-40 items-center justify-center"><LoaderCircle className="animate-spin text-blue-600"/></div> : sortedChapters.length ? <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{sortedChapters.map((item,i) => <TopicChapterCard key={item?.id ?? i} chapter={item} onClick={() => {setSelectedChapter(item);setShowPlayer(true);}} />)}</div> : <p className="mt-5 text-sm text-slate-500">No video classes available.</p>}
  </section>;
}
