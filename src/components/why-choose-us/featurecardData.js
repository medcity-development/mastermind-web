// components/featurecardData.jsx

import { FaChalkboardTeacher } from "react-icons/fa";
import { MdVideoCameraFront } from "react-icons/md";
import { GrDocumentPerformance } from "react-icons/gr";
import { IoNewspaperOutline } from "react-icons/io5";
import { LuBookOpenText } from "react-icons/lu";
import { TfiWrite } from "react-icons/tfi";

const cardsData = [
  {
    title: "Interactive Live Classes",
    text: "Attend engaging live sessions, ask questions instantly, and learn directly from expert educators.",
    icon: MdVideoCameraFront,
    iconColor: "blue",
  },
  {
    title: "Expert Faculty Guidance",
    text: "Learn from experienced faculty with concept-focused teaching, exam strategies, and expert mentoring.",
    icon: FaChalkboardTeacher,
    iconColor: "violet",
  },
  {
    title: "Complete Study Materials",
    text: "Access high-quality notes, PDFs, practice resources, and exam-focused materials in one place.",
    icon: LuBookOpenText,
    iconColor: "indigo",
  },
  {
    title: "Regular Mock Tests",
    text: "Practice exam-level mock tests to improve accuracy, speed, time management, and confidence.",
    icon: TfiWrite,
    iconColor: "orange",
  },
  {
    title: "Daily Current Affairs",
    text: "Stay updated with important local, national, and international current affairs for competitive exams.",
    icon: IoNewspaperOutline,
    iconColor: "green",
  },
  {
    title: "Performance Analysis",
    text: "Track your progress, identify weak areas, and improve your preparation with detailed performance insights.",
    icon: GrDocumentPerformance,
    iconColor: "red",
  },
];

export default cardsData;