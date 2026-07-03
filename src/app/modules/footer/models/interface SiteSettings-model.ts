export interface SiteSettings {
    id?: number;
    siteName: string;
    siteDescription: string;
    email: string;
    phone: string;
    address: string;
    instagram: string;
    telegram: string;
    whatsapp: string;
    linkedin: string;
    enamad: string;
    samandehi: string;
    paymentGateways: string[];
    newsletterEnabled: boolean;
    newsletterText: string;
    footerLinks: FooterColumn[];
}




export interface FooterLink {
    label: string;
    url: string;
}

export interface FooterColumn {
    title: string;
    links: FooterLink[];
}
