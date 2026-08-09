"use client";

import { Download, Printer } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function AgreementSuccessActions() {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      const element = document.querySelector(
        ".success-panel"
      ) as HTMLElement | null;

      if (!element) {
        alert("Unable to generate PDF.");
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imageData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const margin = 10;

      const imageWidth = pageWidth - margin * 2;
      const imageHeight =
        (canvas.height * imageWidth) / canvas.width;

      let heightLeft = imageHeight;
      let position = margin;

      pdf.addImage(
        imageData,
        "PNG",
        margin,
        position,
        imageWidth,
        imageHeight
      );

      heightLeft -= pageHeight - margin * 2;

      while (heightLeft > 0) {
        position = heightLeft - imageHeight + margin;

        pdf.addPage();

        pdf.addImage(
          imageData,
          "PNG",
          margin,
          position,
          imageWidth,
          imageHeight
        );

        heightLeft -= pageHeight - margin * 2;
      }

      const agreementNumber =
        document.querySelector(".success-panel h1")?.textContent?.trim() ||
        "agreement";

      const safeFileName = agreementNumber.replace(
        /[^a-zA-Z0-9-_]/g,
        "_"
      );

      pdf.save(`${safeFileName}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Unable to download PDF. Please try again.");
    }
  };

  return (
    <>
      <button
        type="button"
        className="button button-quiet"
        onClick={handleDownloadPDF}
      >
        <Download size={18} />
        Download PDF
      </button>

      <button
        type="button"
        className="button button-quiet"
        onClick={handlePrint}
      >
        <Printer size={18} />
        Print
      </button>
    </>
  );
}