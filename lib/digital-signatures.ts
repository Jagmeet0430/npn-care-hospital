export type DigitalSignatureInput = {

  patientId: string;

  signature: string;

};

export async function createDigitalSignature(
  signature: DigitalSignatureInput
) {

  const response = await fetch(
    "/api/digital-signatures",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(signature),
    }
  );

  return response.json();
}