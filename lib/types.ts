export type Gender = "male" | "female";

export type Participant = {
  id: string;
  fullName: string;
  age: number;
  gender: Gender;
  region: string;
  district: string;
  organization: string;
};

export const organizationTypes = ["university", "college", "school", "oblast", "district", "youth", "other"] as const;

export type OrganizationType = (typeof organizationTypes)[number];

export type Delegation = {
  code: string;
  fullName: string;
  position: string;
  phone: string;
  email: string;
  organizationType: OrganizationType;
  regionId: string;
  district: string;
  organizationName: string;
  participantCount: number;
  participants: Participant[];
  consent: true;
  willCoordinate: boolean;
  createdAt: string;
  updatedAt: string;
};

export const localityIds = ["city", "village"] as const;
export const ageIds = ["18-21", "22-25", "26-30", "31-35"] as const;
export const genderIds = ["female", "male", "undisclosed"] as const;
export const employmentIds = ["university", "college", "employed", "business", "unemployed", "other"] as const;
export const topicIds = ["work", "education", "housing", "regions", "health", "growth", "civic", "other"] as const;
export const barrierIds = ["income", "skills", "business", "regions", "housing", "inequality", "confidence", "other"] as const;
export const priorityIds = ["jobs", "education", "housing", "business", "regions", "health", "voice", "other"] as const;

export type LocalityId = (typeof localityIds)[number];
export type AgeId = (typeof ageIds)[number];
export type SurveyGenderId = (typeof genderIds)[number];
export type EmploymentId = (typeof employmentIds)[number];
export type TopicId = (typeof topicIds)[number];
export type BarrierId = (typeof barrierIds)[number];
export type PriorityId = (typeof priorityIds)[number];

export type SurveyEntry = {
  id: string;
  regionId: string;
  locality: LocalityId;
  age: AgeId;
  gender: SurveyGenderId;
  employment: EmploymentId;
  topics: TopicId[];
  topicsOther: string;
  barriers: BarrierId[];
  barriersOther: string;
  priorities: PriorityId[];
  prioritiesOther: string;
  change: string;
  createdAt: string;
};

export type Localized = { ru: string; ky: string };

export type ArchiveKind = "program" | "photo" | "video" | "results";

export type Cms = {
  concept: Localized;
  goals: { id: string; title: Localized; text: Localized }[];
  program: { id: string; day: Localized; title: Localized; text: Localized }[];
  organizers: { id: string; name: Localized; role: Localized }[];
  partners: { id: string; name: Localized; url: string }[];
  news: { id: string; date: string; title: Localized; text: Localized }[];
  archive: { id: string; year: string; kind: ArchiveKind; title: Localized; text: Localized; url: string }[];
};
