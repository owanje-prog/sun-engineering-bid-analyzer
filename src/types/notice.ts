export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface ProjectRecord {
  id: string;
  serviceName: string;
  client: string;
  contractAmount: string;
  period: string;
  description: string;
}

export interface EngineerCareer {
  id: string;
  name: string;
  position: string;
  license: string;
  deployPeriod: string;
  role: string;
}

export interface NoticeData {
  id: string;
  fileName: string;
  uploadedAt: string;
  title: string | null;
  organization: string | null;
  estimatedAmount: string | null;
  servicePeriod: string | null;
  deadline: string | null;
  qualifications: string | null;
  rawText: string;
  checklist: ChecklistItem[];
  projectRecords: ProjectRecord[];
  engineerCareers: EngineerCareer[];
}

export interface NoticeStore {
  notices: NoticeData[];
}
