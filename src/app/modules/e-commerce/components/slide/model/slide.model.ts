export interface SlideDetails {
  id?: number;
  image: string;
  title: string;
  description?: string;
  link?: string;
  linkText?: string;
  order: number;
  isActive: boolean;
}