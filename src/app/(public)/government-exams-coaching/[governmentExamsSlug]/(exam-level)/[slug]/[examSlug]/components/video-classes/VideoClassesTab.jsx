import TopicWiseTab from "./TopicWiseTab";

export default function VideoClassesTab({
  cid = 1,
  uid = 0,
  examId,
  subId,
}) {
  if (!examId) {
    return null;
  }

  return (
    <TopicWiseTab
      cid={cid}
      uid={uid}
      examId={examId}
      subId={subId}
    />
  );
}