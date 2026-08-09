export type TreatmentDetailsInput = {
  patientId: string;

  courseDuration?: string;

  recommendedTherapy?: string;

  assignedDoctor?: string;

  hospitalBranch?: string;
};

export async function createTreatmentDetails(
  treatment: TreatmentDetailsInput
) {
  const response = await fetch("/api/treatment-details", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(treatment),
  });

  const data = await response.json();

  console.log("Treatment API Response:", data);

  return data;
}