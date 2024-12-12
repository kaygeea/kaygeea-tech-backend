import { DemoType } from "./enums/demo-type.enum.js";

interface Media {
  alt: string;
  name: string;
  url: string;
  type: DemoType;
}

interface Link {
  [key: string]: string;
}

interface ContentPart {
  main: string;
  list_items?: Array<{ list_content: string }>;
}

interface WhySection {
  gains?: string[];
  links?: Link;
  media?: Media[];
  title: string;
  why_position: number;
  content_parts: ContentPart[];
}

interface HowSection {
  title: string;
  how_position: number;
  content_parts: ContentPart[];
}

export interface IProjectDetail {
  _id: string;
  project_id: string;
  name: string;
  why: WhySection[];
  how: HowSection[];
}
