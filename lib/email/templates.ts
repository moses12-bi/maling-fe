import { EmailTemplate, EmailTemplateData } from '@/types/email';

// Standard email templates
export const emailTemplates: Record<string, EmailTemplate> = {
  INTERNAL: {
    subject: (data: EmailTemplateData) => {
      const { department, product, actionType, description, priority } = data;
      let subject = `CTK-${department}-${product} - ${description} - ${actionType}`;
      if (priority && priority !== 'NORMAL') {
        subject += ` - ${priority}`;
      }
      return subject;
    },
    body: (data: EmailTemplateData) => {
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 1px solid #e9ecef;">
            <img src="https://centrika.rw/logo.png" alt="Centrika Logo" style="max-height: 50px;">
          </div>
          <div style="padding: 20px;">
            <h2 style="color: #2c3e50;">${data.description}</h2>
            <div style="margin: 20px 0; line-height: 1.6;">
              ${data.message || ''}
            </div>
          </div>
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; border-top: 1px solid #e9ecef;">
            <p>This is an automated message from Centrika Ltd. Please do not reply to this email.</p>
            <p>© ${new Date().getFullYear()} Centrika Ltd. All rights reserved.</p>
          </div>
        </div>
      `;
    },
  },
  EXTERNAL: {
    subject: (data: EmailTemplateData) => {
      const { department, product, actionType, description, priority } = data;
      return `CTK-EXT-${department}-${product} - ${description} - ${actionType}${priority ? ` - ${priority}` : ''}`;
    },
    body: (data: EmailTemplateData) => {
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 1px solid #e9ecef;">
            <img src="https://centrika.rw/logo.png" alt="Centrika Logo" style="max-height: 50px;">
          </div>
          <div style="padding: 20px;">
            <p>Dear ${data.recipientName || 'Valued Partner'},</p>
            <div style="margin: 20px 0; line-height: 1.6;">
              ${data.message || ''}
            </div>
            <p>Best regards,<br>${data.senderName || 'Centrika Team'}</p>
          </div>
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; border-top: 1px solid #e9ecef;">
            <p>Centrika Ltd.<br>
            KG 7 Ave, Kigali, Rwanda<br>
            Tel: +250 788 123 456 | Email: info@centrika.rw<br>
            Website: www.centrika.rw</p>
            <p style="margin-top: 10px; font-size: 10px; color: #adb5bd;">
              CONFIDENTIALITY NOTICE: This email and any attachments are confidential and may be protected by legal privilege.
              If you are not the intended recipient, be aware that any disclosure, copying, distribution, or use of this email
              or any attachment is prohibited. If you have received this email in error, please notify us immediately by
              returning it to the sender and deleting this copy from your system. Thank you.
            </p>
          </div>
        </div>
      `;
    },
  },
};

// Helper function to get template by type
export const getEmailTemplate = (type: 'INTERNAL' | 'EXTERNAL' = 'INTERNAL'): EmailTemplate => {
  return emailTemplates[type] || emailTemplates.INTERNAL;
};

// Generate email with template
export const generateEmail = (type: 'INTERNAL' | 'EXTERNAL', data: EmailTemplateData) => {
  const template = getEmailTemplate(type);
  return {
    subject: template.subject(data),
    body: template.body(data),
  };
};
