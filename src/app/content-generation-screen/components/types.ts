export type ContentType = 'story' | 'worksheet' | 'problem' | 'video';

export interface ContentConfig {
  type: ContentType;
  grade: string;
  stream: string;
  subject: string;
  topic: string;
  language: string;
}

export interface ContentSection {
  heading: string;
  body: string;
}

export interface VideoScene {
  id: string;
  title: string;
  description: string;
  narration: string;
  imagePrompt: string;
}

export interface GeneratedContent {
  id?: string;
  type: ContentType;
  topic: string;
  grade: string;
  subject: string;
  language: string;
  generatedAt: string;
  saved?: boolean;
  title: string;
  summary: string;
  sections: ContentSection[];
  scenes?: VideoScene[];
  questions?: WorksheetQuestion[];
}

export interface WorksheetQuestion {
  id: string;
  number: number;
  question: string;
  type: 'mcq' | 'short' | 'long';
  options?: string[];
  answer?: string;
  hint?: string;
}