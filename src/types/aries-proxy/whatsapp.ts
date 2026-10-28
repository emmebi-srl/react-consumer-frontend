// ==============================
// WhatsApp templates (template_whatsapp)
// ==============================
export interface WhatsappTemplate {
  id: number;
  name: string;
  language: string;
  description?: string | null;
  category?: string | null;
  status?: string | null;
  isActive: boolean;
  /** Active in Aries and approved by Meta: it can be chosen for a campaign. */
  isUsable: boolean;
  synchronizationDate?: number | null;
}

export interface WhatsappTemplateList {
  whatsappTemplates: WhatsappTemplate[];
}

export interface WhatsappTemplateSyncResult {
  added: number;
  updated: number;
  whatsappTemplates: WhatsappTemplate[];
}

/** Template already created in WhatsApp Manager, added to Aries without waiting for a sync. */
export interface WhatsappTemplateCreate {
  name: string;
  language: string;
  description?: string | null;
}
