export enum PromptType {
  GLOBAL = "GLOBAL",
  WORKSPACE = "WORKSPACE",
}

export interface Prompt {
  id: string;
  title: string;
  content: string;
  path?: string;
}

export interface PromptDomain {
  id: string;
  title: string;
  path: string;
  children: Prompt[];
}
