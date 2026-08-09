export type MedicalInformationInput = {
  patientId: string;

  diseaseProblem?: string;

  duration?: string;

  symptoms?: string;

  previousTreatment?: string;

  currentMedicines?: string;

  medicalHistory?: string;

  allergies?: string;

  doctorPreference?: string;
};

export async function createMedicalInformation(medical: MedicalInformationInput) {
  const response = await fetch("/api/medical-information", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(medical),
  });

  const data = await response.json();

  console.log("Medical API Response:", data);

  return data;
}