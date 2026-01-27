// SEO Meta Tags Helper
// This file contains reusable SEO meta tags and structured data for all pages

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
}

// Set page meta tags dynamically
export const setSEOMeta = (config: SEOConfig) => {
  // Page Title
  document.title = `${config.title} | AstroLord`;

  // Meta Description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', config.description);
  } else {
    const meta = document.createElement('meta');
    meta.name = 'description';
    meta.content = config.description;
    document.head.appendChild(meta);
  }

  // Keywords
  if (config.keywords && config.keywords.length > 0) {
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', config.keywords.join(', '));
    } else {
      const meta = document.createElement('meta');
      meta.name = 'keywords';
      meta.content = config.keywords.join(', ');
      document.head.appendChild(meta);
    }
  }

  // Open Graph Tags (Social Media Sharing)
  setOGTag('og:title', config.title);
  setOGTag('og:description', config.description);
  setOGTag('og:type', config.type || 'website');
  if (config.image) {
    setOGTag('og:image', config.image);
    setOGTag('og:image:width', '1200');
    setOGTag('og:image:height', '630');
  }
  if (config.url) {
    setOGTag('og:url', config.url);
  }

  // Twitter Card Tags
  setOGTag('twitter:card', 'summary_large_image');
  setOGTag('twitter:title', config.title);
  setOGTag('twitter:description', config.description);
  if (config.image) {
    setOGTag('twitter:image', config.image);
  }
};

// Helper function to set OG tags
const setOGTag = (property: string, content: string) => {
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

// Structured Data (Schema.org JSON-LD)
export const setStructuredData = (data: any) => {
  let script = document.querySelector('script[type="application/ld+json"]');
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
};

// Generate Schema.org Organization data
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  'name': 'AstroLord',
  'url': 'https://astrolord.com',
  'logo': 'https://astrolord.com/logo.png',
  'description': 'AI-powered Vedic astrology platform for birth charts, predictions, and cosmic guidance',
  'sameAs': [
    'https://twitter.com/astrolord',
    'https://facebook.com/astrolord',
    'https://instagram.com/astrolord',
    'https://linkedin.com/company/astrolord'
  ],
  'contactPoint': {
    '@type': 'ContactPoint',
    'telephone': '+91-XXX-XXX-XXXX',
    'contactType': 'Customer Support',
    'email': 'support@astro-lord.com'
  }
};

// Generate Schema.org Service data
export const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  'name': 'Vedic Astrology Readings',
  'description': 'Personalized Vedic astrology readings with AI-powered birth chart analysis',
  'provider': {
    '@type': 'Organization',
    'name': 'AstroLord'
  },
  'areaServed': 'Worldwide',
  'priceRange': '$$'
};

// Generate Schema.org Product (for pricing)
export const pricingSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  'name': 'AstroLord Premium Subscription',
  'description': 'Unlock unlimited birth charts, AI consultations, and advanced astrological features',
  'brand': {
    '@type': 'Brand',
    'name': 'AstroLord'
  },
  'offers': [
    {
      '@type': 'Offer',
      'priceCurrency': 'USD',
      'price': '9.99',
      'priceValidUntil': '2025-12-31',
      'availability': 'https://schema.org/InStock'
    }
  ],
  'aggregateRating': {
    '@type': 'AggregateRating',
    'ratingValue': '4.8',
    'ratingCount': '245'
  }
};

// Generate Schema.org FAQPage
export const faqSchema = (faqs: Array<{question: string; answer: string}>) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  'mainEntity': faqs.map(faq => ({
    '@type': 'Question',
    'name': faq.question,
    'acceptedAnswer': {
      '@type': 'Answer',
      'text': faq.answer
    }
  }))
});

// Generate Schema.org Article
export const articleSchema = (title: string, description: string, image: string, datePublished: string) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  'headline': title,
  'description': description,
  'image': image,
  'datePublished': datePublished,
  'author': {
    '@type': 'Organization',
    'name': 'AstroLord'
  }
});

// Canonical URL helper
export const setCanonical = (url: string) => {
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', url);
};

// Breadcrumb Schema
export const breadcrumbSchema = (items: Array<{name: string; url: string}>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  'itemListElement': items.map((item, index) => ({
    '@type': 'ListItem',
    'position': index + 1,
    'name': item.name,
    'item': item.url
  }))
});
