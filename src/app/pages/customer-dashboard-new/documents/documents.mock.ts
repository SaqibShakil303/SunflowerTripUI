import { DashboardDocument } from "./documents.types";

function formatYMD(d: Date) {
  const yyyy = d.getFullYear();
  const mm = `${d.getMonth() + 1}`.padStart(2, "0");
  const dd = `${d.getDate()}`.padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
function subDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

export const MOCK_DOCUMENTS: DashboardDocument[] = [
  {
    id: "doc-1",
    type: "passport",
    title: "Passport Information",
    status: "not_uploaded",
    // uploadedAt: formatYMD(subDays(10)),
    locked: false,
    // fileUrl: "/mock/passport.pdf",
    // fileName: "saqib_passport.pdf",
  },
  {
    id: "doc-2",
    type: "visa",
    title: "Visa Document",
    status: "not_uploaded",
    // uploadedAt: formatYMD(new Date()),
    locked: false,
    // fileUrl: "/mock/visa_app.png",
    // fileName: "visa_application_scan.png",
  },
    {
    id: "doc-3",
    type: "idProof",
    title: "National ID / PAN",
    status: "not_uploaded",
    // rejectionReason: "Image blurry, please re-upload clear copy.",
    locked: false,
    // uploadedAt: formatYMD(subDays(2)),
  },
  {
    id: "doc-4",
    type: "flightTicket",
    title: "Others (Flight Ticket, etc.)",
    status: "not_uploaded",
    locked: false,
  },
 
];