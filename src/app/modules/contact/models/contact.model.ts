export interface SocialLink {
  platform: string;
  url: string;
}

export interface ContactPage {
  id?: number;
  address: string;
  phone: string;
  mobile: string;
  email: string;
  workHours: string;
  mapLat: number;
  mapLng: number;
  socialLinks: SocialLink[];
  updatedAt?: Date;
}