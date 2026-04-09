export interface MetaTemplateSubmission {
  name: string;
  language: string;
  category: 'MARKETING' | 'UTILITY';
  components: MetaTemplateComponent[];
}

export interface MetaTemplateComponent {
  type: 'BODY';
  text: string;
  example?: {
    body_text: string[][];
  };
}

export interface MetaTemplateStatusWebhook {
  event: 'APPROVED' | 'REJECTED' | 'PENDING' | 'DISABLED';
  message_template_id: string;
  message_template_name: string;
  reason?: string;
}

export interface MetaSendMessageRequest {
  messaging_product: 'whatsapp';
  to: string;
  type: 'template';
  template: {
    name: string;
    language: { code: string };
    components: MetaMessageComponent[];
  };
}

export interface MetaMessageComponent {
  type: 'body';
  parameters: MetaMessageParameter[];
}

export interface MetaMessageParameter {
  type: 'text';
  text: string;
}

export interface MetaMessageStatusWebhook {
  id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  errors?: { code: number; title: string; message: string }[];
}

export type MessageStatus = 'queued' | 'sent' | 'delivered' | 'read' | 'failed';
