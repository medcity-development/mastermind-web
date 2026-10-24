import EnquiriesAdmin from "./components/EnquiriesAdmin";

export const metadata = {
  title: "Enquiry Inbox | MasterMind Academy",
  robots: {
    index: false,
    follow: false,
  },
};

export default function EnquiriesAdminPage() {
  return <EnquiriesAdmin />;
}