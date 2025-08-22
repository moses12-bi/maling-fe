export interface EmailTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  subject: string;
  body: string;
  variables: TemplateVariable[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  version: number;
  tags?: string[];
  thumbnail?: string;
}

export interface TemplateVariable {
  name: string;
  description: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  required: boolean;
  defaultValue?: any;
  options?: { label: string; value: string }[];
}

export interface TemplateCategory {
  id: string;
  name: string;
  description?: string;
  templateCount: number;
}

export interface TemplateUsageStats {
  templateId: string;
  templateName: string;
  usageCount: number;
  lastUsedAt?: string;
  successRate: number;
  openRate: number;
  clickRate: number;
}

export interface TemplateFilterOptions {
  categories?: string[];
  tags?: string[];
  isActive?: boolean;
  searchQuery?: string;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'usageCount';
  sortOrder?: 'asc' | 'desc';
}
