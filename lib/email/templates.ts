import { EmailTemplate, EmailTemplateData } from '@/types/email';

// Professional email templates according to Centrika standards
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

// Professional email content templates according to Centrika standards
export const emailContentTemplates = {
  // Meeting Request Template
  MEETING: (data: {
    meetingPurpose: string;
    proposedDate: string;
    duration: string;
    location: string;
    attendees: string[];
    agenda: string[];
    deadline: string;
  }) => `
Dear Team,

I would like to schedule a meeting to discuss ${data.meetingPurpose}.

Meeting Details:
• Date: ${data.proposedDate}
• Duration: ${data.duration}
• Location: ${data.location}
• Attendees: ${data.attendees.join(', ')}

Agenda:
${data.agenda.map(item => `• ${item}`).join('\n')}

Please confirm your availability by ${data.deadline}.

Best regards,
Centrika Team
  `,

  // Action Request Template
  ACTION: (data: {
    specificRequest: string;
    requiredActions: string[];
    timeline: string;
    deadline: string;
    updatesRequired: string;
    confirmationDeadline: string;
  }) => `
Dear Team,

I need your assistance with ${data.specificRequest}.

Required Actions:
${data.requiredActions.map(action => `• ${action}`).join('\n')}

Timeline:
• Deadline: ${data.deadline}
• Updates required: ${data.updatesRequired}

Please confirm receipt and expected completion by ${data.confirmationDeadline}.

Best regards,
Centrika Team
  `,

  // Information Sharing Template
  INFO: (data: {
    informationTopic: string;
    keyPoints: string[];
    impact: string;
    changesNeeded: string;
  }) => `
Dear Team,

I'm sharing the following information for your awareness.

Key Information:
${data.keyPoints.map(point => `• ${point}`).join('\n')}

Impact on your work:
• ${data.impact}
${data.changesNeeded ? `• ${data.changesNeeded}` : ''}

No action required unless you have questions.

Best regards,
Centrika Team
  `,

  // Approval Request Template
  APPROVAL: (data: {
    itemRequiringApproval: string;
    what: string;
    why: string;
    when: string;
    cost: string;
    risk: string;
    supportingDocuments: string[];
    deadline: string;
  }) => `
Dear ${data.itemRequiringApproval},

I am requesting your approval for ${data.itemRequiringApproval}.

Request Details:
• What: ${data.what}
• Why: ${data.why}
• When: ${data.when}
${data.cost ? `• Cost: ${data.cost}` : ''}
• Risk: ${data.risk}

Supporting Documents:
${data.supportingDocuments.map(doc => `• ${doc}`).join('\n')}

Please approve or provide feedback by ${data.deadline}.

Best regards,
Centrika Team
  `,

  // Decision Request Template
  DECISION: (data: {
    decisionNeeded: string;
    options: string[];
    context: string;
    deadline: string;
  }) => `
Dear Team,

A decision is needed regarding ${data.decisionNeeded}.

Context:
${data.context}

Available Options:
${data.options.map(option => `• ${option}`).join('\n')}

Please provide your decision by ${data.deadline}.

Best regards,
Centrika Team
  `,

  // Review Request Template
  REVIEW: (data: {
    itemToReview: string;
    reviewScope: string;
    feedbackAreas: string[];
    deadline: string;
  }) => `
Dear Team,

I need your review and feedback on ${data.itemToReview}.

Review Scope:
${data.reviewScope}

Areas for Feedback:
${data.feedbackAreas.map(area => `• ${area}`).join('\n')}

Please provide your feedback by ${data.deadline}.

Best regards,
Centrika Team
  `,

  // External Customer Communication Template
  EXTERNAL_CUSTOMER: (data: {
    customerName: string;
    purpose: string;
    actionRequired: string;
    timeline: string;
    contactInfo: string;
  }) => `
Dear ${data.customerName},

${data.purpose}

Action Required:
${data.actionRequired}

Timeline:
${data.timeline}

If you need any clarification or have questions, please don't hesitate to contact me directly.

Best regards,
Centrika Team
Centrika Ltd.
${data.contactInfo}
  `,

  // External Partner Communication Template
  EXTERNAL_PARTNER: (data: {
    partnerName: string;
    purpose: string;
    nextSteps: string[];
    timeline: string;
    contactInfo: string;
  }) => `
Dear ${data.partnerName},

${data.purpose}

Next Steps:
${data.nextSteps.map(step => `• ${step}`).join('\n')}

Timeline:
${data.timeline}

We look forward to our continued partnership.

Best regards,
Centrika Team
Centrika Ltd.
${data.contactInfo}
  `,

  // Regulatory Communication Template
  REGULATORY: (data: {
    regulatoryBody: string;
    submissionType: string;
    content: string;
    deadline: string;
    contactInfo: string;
  }) => `
Dear ${data.regulatoryBody} Team,

Re: ${data.submissionType}

${data.content}

This submission is in compliance with all applicable regulations and requirements.

Deadline: ${data.deadline}

Please acknowledge receipt of this communication.

Best regards,
Centrika Compliance Team
Centrika Ltd.
${data.contactInfo}
  `,
};

// Template helper functions
export const getTemplateByActionType = (actionType: string) => {
  const templateMap: Record<string, keyof typeof emailContentTemplates> = {
    'MEETING': 'MEETING',
    'ACTION': 'ACTION',
    'INFO': 'INFO',
    'APPROVAL': 'APPROVAL',
    'DECISION': 'DECISION',
    'REVIEW': 'REVIEW'
  };
  
  return templateMap[actionType] || 'INFO';
};

export const getExternalTemplateByType = (emailType: 'customer' | 'partner' | 'regulatory') => {
  const templateMap: Record<string, keyof typeof emailContentTemplates> = {
    'customer': 'EXTERNAL_CUSTOMER',
    'partner': 'EXTERNAL_PARTNER',
    'regulatory': 'REGULATORY'
  };
  
  return templateMap[emailType] || 'EXTERNAL_CUSTOMER';
};

// Helper function to get template by type
export const getEmailTemplate = (type: 'INTERNAL' | 'EXTERNAL' = 'INTERNAL') => {
  return emailTemplates[type];
};

// Template validation
export const validateTemplateData = (templateType: string, data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  switch (templateType) {
    case 'MEETING':
      if (!data.meetingPurpose) errors.push('Meeting purpose is required');
      if (!data.proposedDate) errors.push('Proposed date is required');
      if (!data.attendees || data.attendees.length === 0) errors.push('At least one attendee is required');
      break;
      
    case 'ACTION':
      if (!data.specificRequest) errors.push('Specific request is required');
      if (!data.requiredActions || data.requiredActions.length === 0) errors.push('At least one required action is needed');
      if (!data.deadline) errors.push('Deadline is required');
      break;
      
    case 'APPROVAL':
      if (!data.itemRequiringApproval) errors.push('Item requiring approval is required');
      if (!data.what) errors.push('What field is required');
      if (!data.why) errors.push('Why field is required');
      if (!data.deadline) errors.push('Deadline is required');
      break;
      
    case 'DECISION':
      if (!data.decisionNeeded) errors.push('Decision needed is required');
      if (!data.options || data.options.length === 0) errors.push('At least one option is required');
      if (!data.deadline) errors.push('Deadline is required');
      break;
      
    case 'REVIEW':
      if (!data.itemToReview) errors.push('Item to review is required');
      if (!data.feedbackAreas || data.feedbackAreas.length === 0) errors.push('At least one feedback area is required');
      if (!data.deadline) errors.push('Deadline is required');
      break;
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
