export interface SocialLink {
  platform: string;
  url: string;
}

export interface ContactPage {
  address?: string;
  phone?: string[];
  mobile?: string[];
  email?: string;
  workHours?: string;
  mapLat?: number;
  mapLng?: number;
  socialLinks?: { platform: string; url: string }[];
}