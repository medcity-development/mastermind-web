
import TopicWiseTab from "./TopicWiseTab";

export default function VideoClassesTab({
  cid = 1,
  uid = 0,
  examId,
  subId,
  isAuthenticated = false,
  hasPremiumAccess = false,
  onLoginRequired,
  onStartMockTest,
}) {
  if (!examId) return null;

  return (
    <TopicWiseTab
      cid={cid}
      uid={uid}
      examId={examId}
      isAuthenticated={isAuthenticated}
      hasPremiumAccess={hasPremiumAccess}
      onLoginRequired={onLoginRequired}
      onStartMockTest={onStartMockTest}
    />
  );
}
