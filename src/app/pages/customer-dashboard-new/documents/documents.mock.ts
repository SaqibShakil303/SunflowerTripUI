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
    status: "verified",
    uploadedAt: formatYMD(subDays(10)),
    locked: true,
    fileUrl: "/mock/passport.pdf",
    fileName: "saqib_passport.pdf",
  },
  {
    id: "doc-2",
    type: "visa",
    title: "Visa Document",
    status: "pending",
    uploadedAt: formatYMD(new Date()),
    locked: false,
    fileUrl: "/mock/visa_app.png",
    fileName: "visa_application_scan.png",
  },
  {
    id: "doc-3",
    type: "flightTicket",
    title: "Flight Tickets",
    status: "not_uploaded",
    locked: false,
  },
  {
    id: "doc-4",
    type: "idProof",
    title: "National ID / PAN",
    status: "rejected",
    rejectionReason: "Image blurry, please re-upload clear copy.",
    locked: false,
    uploadedAt: formatYMD(subDays(2)),
  },
];