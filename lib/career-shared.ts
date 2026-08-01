export const careerStatusValues = ["Received", "Under Review", "Interview", "Selected", "Rejected"] as const;
export type CareerStatus = (typeof careerStatusValues)[number];

export type StoredCareerFile = {
  originalName: string;
  storageName: string;
  mimeType: string;
  size: number;
};

export type CareerApplicationRecord = {
  id: string;
  applicationId: string;
  submittedAt: string;
  status: CareerStatus;
  fullName: string;
  parentName: string;
  email: string;
  mobile: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  dateOfBirth: string;
  gender: string;
  qualification: string;
  experience: string;
  position: string;
  expectedSalary?: string;
  message?: string;
  declarationAccepted: boolean;
  resume: StoredCareerFile;
  photo?: StoredCareerFile;
  notes: string[];
};
