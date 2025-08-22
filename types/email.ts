export interface EmailTemplateData {
  department: string;
  product: string;
  actionType: 'ACTION' | 'DECISION' | 'REVIEW' | 'APPROVAL' | 'MEETING' | 'INFO';
  description: string;
  priority?: 'URGENT' | 'HIGH' | 'LOW' | 'NORMAL';
  message?: string;
  recipientName?: string;
  senderName?: string;
  [key: string]: any; // For additional dynamic data
}

export interface EmailTemplate {
  subject: (data: EmailTemplateData) => string;
  body: (data: EmailTemplateData) => string;
}

export interface EmailData extends EmailTemplateData {
  to: string[];
  cc?: string[];
  bcc?: string[];
  attachments?: Array<{
    filename: string;
    content: string;
    contentType: string;
  }>;
  templateType?: 'INTERNAL' | 'EXTERNAL';
}

export interface EmailResponse {
  success: boolean;
  message: string;
  emailId?: string;
}
