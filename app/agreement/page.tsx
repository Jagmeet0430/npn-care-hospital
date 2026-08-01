import type { Metadata } from "next";
import { AgreementWizard } from "@/components/AgreementWizard";
import { getCmsContent } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Digital Patient Agreement",
  description: "Secure digital patient agreement and consent workflow for N.P.N. Care Hospital."
};

export const dynamic = "force-dynamic";

export default async function AgreementPage() {
  const { departments, doctors, hospital } = await getCmsContent();

  return (
    <>
      <section className="page-hero">
        <div className="page-hero-content">
          <span className="eyebrow">डिजिटल एग्रीमेंट</span>
          <h1>मरीज सहमति, दस्तावेज और हस्ताक्षर एक सुरक्षित प्रक्रिया में।</h1>
          <p className="lead">एडमिन और डॉक्टर समीक्षा से पहले अपना इलाज एग्रीमेंट ऑनलाइन पूरा करें।</p>
        </div>
      </section>
      <AgreementWizard departments={departments} doctors={doctors} hospital={hospital} />
    </>
  );
}
