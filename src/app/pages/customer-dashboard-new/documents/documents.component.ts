import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DashboardDocument } from "./documents.types";
import { MOCK_DOCUMENTS } from "./documents.mock";
import { ModalComponent } from "./ui/modal.component";

@Component({
  selector: "app-documents",
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: "./documents.component.html",
})
export class DocumentsComponent {
  documents: DashboardDocument[] = structuredClone(MOCK_DOCUMENTS);

  previewDoc: DashboardDocument | null = null;
  uploadingId: string | null = null;
  isUploading = false;

onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.item(0) ?? null;

  this.onFileSelected(file);

  // optional: reset so selecting same file again triggers change
  input.value = "";
}


  // --- helpers ---
  getDescription(doc: DashboardDocument) {
    if (doc.status === "not_uploaded") return "Please upload requested document.";
    if (doc.status === "verified") return "Document verified successfully.";
    return "Waiting for admin approval.";
  }

  badgeClasses(status: DashboardDocument["status"]) {
    const s = status.toLowerCase();
    if (["upcoming", "advance", "pending"].includes(s)) return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    if (["completed", "full", "verified", "paid"].includes(s)) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    if (["cancelled", "rejected"].includes(s)) return "bg-red-500/10 text-red-400 border-red-500/20";
    if (["partial"].includes(s)) return "bg-orange-500/10 text-orange-400 border-orange-500/20";
    return "bg-gray-500/10 text-gray-400 border-gray-500/20";
  }

  dotClass(status: DashboardDocument["status"]) {
    const s = status.toLowerCase();
    if (["upcoming", "advance", "pending"].includes(s)) return "bg-blue-400";
    if (["completed", "full", "verified", "paid"].includes(s)) return "bg-emerald-400";
    if (["cancelled", "rejected"].includes(s)) return "bg-red-400";
    if (["partial"].includes(s)) return "bg-orange-400";
    return "bg-gray-400";
  }

  iconColor(doc: DashboardDocument) {
    if (doc.type === "passport") return "text-blue-400";
    if (doc.type === "visa") return "text-purple-400";
    if (doc.type === "flightTicket") return "text-sky-400";
    return "text-indigo-400";
  }

  openUpload(id: string) {
    this.uploadingId = id;
  }

  openPreview(doc: DashboardDocument) {
    this.previewDoc = doc;
  }

  closeUpload() {
    if (!this.isUploading) this.uploadingId = null;
  }

  closePreview() {
    this.previewDoc = null;
  }

  // yyyy-MM-dd
  private formatYMD(d: Date) {
    const yyyy = d.getFullYear();
    const mm = `${d.getMonth() + 1}`.padStart(2, "0");
    const dd = `${d.getDate()}`.padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  editUntil(uploadedAt: string) {
    const d = new Date(uploadedAt);
    d.setDate(d.getDate() + 7);
    const dd = `${d.getDate()}`.padStart(2, "0");
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${dd} ${months[d.getMonth()]}`;
  }

  isPdf(doc: DashboardDocument) {
    return (doc.fileName || "").toLowerCase().endsWith(".pdf");
  }

  // --- upload handler (mock like Next) ---
  onFileSelected(file: File | null) {
    if (!file || !this.uploadingId) return;

    // basic max 5MB guard (matches UI note)
    const max = 5 * 1024 * 1024;
    if (file.size > max) {
      alert("Max file size is 5MB.");
      return;
    }

    this.isUploading = true;

    setTimeout(() => {
      const objectUrl = URL.createObjectURL(file);

      this.documents = this.documents.map((d) => {
        if (d.id !== this.uploadingId) return d;
        return {
          ...d,
          status: "pending",
          uploadedAt: this.formatYMD(new Date()),
          fileUrl: objectUrl,
          fileName: file.name,
          rejectionReason: undefined,
          locked: false,
        };
      });

      this.isUploading = false;
      this.uploadingId = null;
    }, 1500);
  }
}