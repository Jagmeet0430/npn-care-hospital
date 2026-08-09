export async function uploadDocument(
  patientId: string,
  documentType: string,
  file: File
) {
  const formData = new FormData();

  formData.append("patientId", patientId);

  formData.append("documentType", documentType);

  formData.append("file", file);

  const response = await fetch("/api/upload-document", {
    method: "POST",
    body: formData,
  });

  return response.json();
}