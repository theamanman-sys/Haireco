export enum JobType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  FREELANCE = 'FREELANCE',
  INTERNSHIP = 'INTERNSHIP',
}

export enum JobStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  FILLED = 'FILLED',
}

export interface JobPost {
  id: string;
  salonId: string;
  ownerId: string;
  title: string;
  description: string;
  requirements: string[];
  jobType: JobType;
  salaryRange?: string;
  location: string;
  isRemote: boolean;
  status: JobStatus;
  applicationDeadline?: string;
  createdAt: string;
  updatedAt: string;
}

export enum ApplicationStatus {
  PENDING = 'PENDING',
  REVIEWED = 'REVIEWED',
  SHORTLISTED = 'SHORTLISTED',
  INTERVIEWED = 'INTERVIEWED',
  OFFERED = 'OFFERED',
  HIRED = 'HIRED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

export interface JobApplication {
  id: string;
  jobId: string;
  applicantId: string;
  coverLetter?: string;
  resumeUrl?: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}
