export interface Organization {
  id: string;
  name: string;
  slug: string;
  domain?: string | null;
  logoUrl?: string | null;
  plan: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  industry?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
