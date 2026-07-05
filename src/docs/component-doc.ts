export type ComponentDocCategory =
  | 'Config'
  | 'Data Display'
  | 'Data Entry'
  | 'Feedback'
  | 'General'
  | 'Headless'
  | 'Layout'
  | 'Navigation';

export interface ComponentDocUsage {
  description: string;
  bestPractices?: string[];
  avoid?: string[];
}

export interface ComponentDocProp {
  name: string;
  type: string;
  description: string;
  defaultValue?: string;
  required?: boolean;
}

export interface ComponentDoc {
  name: string;
  displayName: string;
  category: ComponentDocCategory;
  description: string;
  exports: string[];
  source: string;
  story?: string;
  tests: string[];
  semanticParts?: string[];
  keywords?: string[];
  related?: string[];
  usage: ComponentDocUsage;
  props?: ComponentDocProp[];
}
