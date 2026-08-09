export type PatientInput = {
  fullName: string;
  fatherHusbandName?: string;
  gender: string;
  dateOfBirth?: string;
  age: number;
  mobile: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
};

export async function createPatient(
  patient: PatientInput
) {
  const response = await fetch("/api/patients", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(patient),
  });

  return response.json();
}