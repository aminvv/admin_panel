export interface AboutStat {
  label: string;
  value: string;
}

export interface AboutPage {
  id?: number;
  title: string;
  description: string;
  imageUrl: string;
  stats: AboutStat[];
  updatedAt?: Date;
}