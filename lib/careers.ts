import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CareerApplicationRecord, StoredCareerFile } from "@/lib/career-shared";
import { decryptJson, encryptJson, isEncryptedPayload } from "@/lib/secure-json-store";

const careersPath = path.join(process.cwd(), "data", "career-applications.json");
export const careerUploadRoot = path.join(process.cwd(), "data", "private-uploads", "careers");

export function createApplicationId() {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `NPN-JOB-${stamp}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

export function getCareerFilePath(file: StoredCareerFile) {
  return path.join(careerUploadRoot, file.storageName);
}

export async function getCareerApplications(): Promise<CareerApplicationRecord[]> {
  try {
    const raw = await readFile(careersPath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return isEncryptedPayload(parsed) ? decryptJson<CareerApplicationRecord[]>(parsed) : (parsed as CareerApplicationRecord[]);
  } catch {
    await saveCareerApplications([]);
    return [];
  }
}

async function saveCareerApplications(applications: CareerApplicationRecord[]) {
  await mkdir(path.dirname(careersPath), { recursive: true });
  await writeFile(careersPath, `${JSON.stringify(encryptJson(applications), null, 2)}\n`, "utf8");
}

export async function addCareerApplication(
  application: Omit<CareerApplicationRecord, "id" | "applicationId" | "submittedAt" | "status" | "notes">
) {
  const applications = await getCareerApplications();
  const nextApplication: CareerApplicationRecord = {
    id: crypto.randomUUID(),
    applicationId: createApplicationId(),
    submittedAt: new Date().toISOString(),
    status: "Received",
    notes: ["Application received from careers page."],
    ...application
  };

  await saveCareerApplications([nextApplication, ...applications]);
  return nextApplication;
}

export async function updateCareerApplication(
  id: string,
  update: Partial<Pick<CareerApplicationRecord, "status">> & { note?: string }
) {
  const applications = await getCareerApplications();
  const index = applications.findIndex((application) => application.id === id || application.applicationId === id);
  if (index === -1) return null;

  const note = update.note?.trim();
  const updated: CareerApplicationRecord = {
    ...applications[index],
    status: update.status ?? applications[index].status,
    notes: note ? [`${new Date().toISOString()} - ${note}`, ...applications[index].notes] : applications[index].notes
  };

  applications[index] = updated;
  await saveCareerApplications(applications);
  return updated;
}

export async function deleteCareerApplication(id: string) {
  const applications = await getCareerApplications();
  const application = applications.find((item) => item.id === id || item.applicationId === id);
  if (!application) return null;

  await Promise.allSettled([
    unlink(getCareerFilePath(application.resume)),
    application.photo ? unlink(getCareerFilePath(application.photo)) : Promise.resolve()
  ]);

  await saveCareerApplications(applications.filter((item) => item.id !== application.id));
  return application;
}
