export interface CertificateImage {
  url: string;
  publicId: string;
}

export interface CertificateDetails {
  id?: number;
  title: string;
  issuer: string;
  issueDate: string;
  order: number;
  isActive: boolean;
  image: string;
}