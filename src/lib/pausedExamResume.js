import "server-only";
import { getTopicWiseExams, getAllTopicWiseTests } from "@/lib/topicWiseExamHelper";
import { getStatementTypeTopics, getStatementTypeExamsByTopic } from "@/lib/statementTypeExamHelper";
import { getScertFolders, getScertTestsByClassId } from "@/lib/scertHelper";
import { createSlug } from "@/lib/pscSlug";

// Resolve catalog context only when Resume is clicked, not for every table row.
export async function resolvePausedExamHref({ uid, cid, governmentExamsSlug, examId, examType, pauseId }) {
  const root = `/dashboard/${encodeURIComponent(governmentExamsSlug)}`;
  const query = new URLSearchParams({ mode: "resume", pauseId: String(pauseId) });
  if (examType === "mock") return `${root}/mock-tests/${examId}/start?${query}`;
  if (examType === "pqp") return `${root}/previous-questions/${examId}/start?${query}`;
  if (examType === "studyplan") return `${root}/studyplan-tests/${examId}/start?${query}`;

  if (examType === "scert") {
    let offset = 0;
    const visited = new Set();
    while (!visited.has(offset)) {
      visited.add(offset);
      const folders = await getScertFolders({ uid, cid, offset });
      if (folders?.status === false) throw new Error("Unable to load SCERT classes. Please try again.");
      for (const folder of folders?.data || []) {
        const tests = await getScertTestsByClassId({ uid, classId: folder.id, filter: 0 });
        if (tests?.status === false) throw new Error("Unable to load SCERT exams. Please try again.");
        if (tests?.data?.some((test) => Number(test.id) === examId)) {
          query.set("examId", String(examId));
          query.set("classId", String(folder.id));
          return `${root}/scert-tests/start?${query}`;
        }
      }
      const next = folders?.nextOffset;
      if (next == null || next === "" || !folders?.data?.length) break;
      offset = Number(next);
      if (!Number.isFinite(offset)) break;
    }
    return null;
  }

  if (examType === "topicwise" || examType === "tst") {
    const statement = examType === "tst";
    const topics = statement
      ? await getStatementTypeTopics({ uid, cid, type: "tst" })
      : await getTopicWiseExams({ uid, cid, type: "twe" });
    if (topics?.status === false) throw new Error("Unable to load exam topics. Please try again.");
    for (const topic of topics?.data || []) {
      const tests = statement
        ? await getStatementTypeExamsByTopic({ uid, cid, topicId: topic.id, type: "tst" })
        : await getAllTopicWiseTests({ uid, topicId: topic.id });
      if (tests?.status === false) throw new Error("Unable to load topic exams. Please try again.");
      const exam = tests?.data?.find((item) => Number(item.id) === examId);
      if (!exam) continue;
      const topicSlug = createSlug(topic.subject);
      if (!topicSlug) return null;
      if (statement) {
        const examSlug = createSlug(exam.exam_name);
        return examSlug ? `${root}/statement-type-exams/${topicSlug}/${examSlug}/start?${query}` : null;
      }
      return `${root}/topic-wise-exams/test/${topicSlug}/${examId}/start?${query}`;
    }
  }
  return null;
}
