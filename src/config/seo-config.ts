// SEO Configuration for all pages
// Update these to match your actual domain and content

export const SEO_CONFIG = {
  site: {
    name: 'AstroLord',
    domain: 'https://astrolord.com',
    logo: 'https://astrolord.com/logo.png',
    description: 'AI-powered Vedic astrology platform. Generate birth charts, get personalized readings, explore planetary transits, and discover your cosmic destiny.',
  },
  
  pages: {
    home: {
      title: 'AstroLord - Vedic Astrology AI Platform',
      description: 'Unlock the mysteries of the cosmos with precision Vedic astrology. Generate birth charts, chat with our AI astrologer, and discover your celestial blueprint.',
      keywords: ['vedic astrology', 'birth chart', 'astrology readings', 'horoscope', 'planetary positions', 'AI astrologer', 'jyotish'],
      image: 'https://astrolord.com/og-home.png',
    },
    
    learn: {
      title: 'Learn Vedic Astrology - AstroLord',
      description: 'Comprehensive guide to Vedic astrology. Learn about birth charts, planetary positions, Dashas, houses, yogas, and doshas with our interactive educational content.',
      keywords: ['vedic astrology guide', 'astrology tutorial', 'birth chart basics', 'planetary guide', 'astrological education'],
      image: 'https://astrolord.com/og-learn.png',
    },
    
    pricing: {
      title: 'Pricing Plans - AstroLord',
      description: 'Simple, transparent pricing for Vedic astrology readings. Choose between Free, Weekly, or Monthly plans. Start your cosmic journey today.',
      keywords: ['astrology pricing', 'subscription plans', 'vedic astrology cost', 'premium readings'],
      image: 'https://astrolord.com/og-pricing.png',
    },
    
    faq: {
      title: 'FAQ - Frequently Asked Questions - AstroLord',
      description: 'Find answers to common questions about Vedic astrology, birth charts, subscriptions, security, and more. Get support for AstroLord.',
      keywords: ['astrology FAQ', 'frequently asked questions', 'birth chart FAQ', 'astrology help'],
      image: 'https://astrolord.com/og-faq.png',
    },
    
    about: {
      title: 'About AstroLord - Our Mission & Vision',
      description: 'Learn about AstroLord\'s mission to democratize Vedic astrology through AI technology. Authentic, accurate, and accessible cosmic guidance.',
      keywords: ['about astrolord', 'vedic astrology company', 'astrology platform', 'our mission'],
      image: 'https://astrolord.com/og-about.png',
    },
    
    blog: {
      title: 'AstroLord Blog - Vedic Astrology Articles & Guides',
      description: 'Read our blog for in-depth articles about Vedic astrology, planetary transits, yogas, career guidance, relationship compatibility, and more.',
      keywords: ['astrology blog', 'vedic astrology articles', 'astrology guides', 'horoscope predictions'],
      image: 'https://astrolord.com/og-blog.png',
    },
    
    privacy: {
      title: 'Privacy Policy - AstroLord',
      description: 'Read AstroLord\'s privacy policy. We protect your data with AES-256 encryption and never share your personal information with third parties.',
      keywords: ['privacy policy', 'data protection', 'gdpr compliance'],
      image: null,
    },
    
    terms: {
      title: 'Terms of Service - AstroLord',
      description: 'AstroLord Terms of Service. Understand the rules and conditions for using our Vedic astrology platform.',
      keywords: ['terms of service', 'user agreement', 'terms and conditions'],
      image: null,
    },
    
    refund: {
      title: 'Refund Policy - AstroLord',
      description: '7-day money-back guarantee on your first AstroLord subscription. Simple refund process with no questions asked.',
      keywords: ['refund policy', 'money-back guarantee', 'return policy'],
      image: null,
    },
    
    contact: {
      title: 'Contact Us - AstroLord Support',
      description: 'Get in touch with AstroLord support. We\'re here to help with questions, feedback, or technical issues.',
      keywords: ['contact support', 'customer service', 'astrology help'],
      image: 'https://astrolord.com/og-contact.png',
    },
    
    login: {
      title: 'Sign In - AstroLord',
      description: 'Sign in to your AstroLord account to access your birth charts, chat with our AI astrologer, and explore your cosmic destiny.',
      keywords: ['login', 'sign in', 'astrology account'],
      image: null,
    },
    
    register: {
      title: 'Create Account - AstroLord',
      description: 'Create your free AstroLord account to generate birth charts and get personalized Vedic astrology readings.',
      keywords: ['sign up', 'create account', 'free trial'],
      image: null,
    },
    
    dashboard: {
      title: 'Dashboard - AstroLord',
      description: 'Your personal AstroLord dashboard. Manage your birth charts, chat with AI, view predictions, and access your astrological journey.',
      keywords: ['astrology dashboard', 'birth charts', 'readings'],
      image: null,
    },
  },
};

// Generate full URLs for pages
export const getPageUrl = (pagePath: string): string => {
  return `${SEO_CONFIG.site.domain}${pagePath}`;
};

// Google Analytics 4 Configuration
// Measurement ID for GA4 tracking
// Get your ID from: https://analytics.google.com → Admin → Property → Data Streams
// Using Vite's import.meta.env for environment variables
export const GOOGLE_ANALYTICS_ID = import.meta.env.VITE_GA4_ID || '';

// If GA4 ID is not configured, analytics will gracefully degrade (no warning)
// To enable GA4:
// 1. Create a GA4 property at analytics.google.com
// 2. Get your Measurement ID (format: G-XXXXXXXXXX)
// 3. Add to .env.local: VITE_GA4_ID=G-YOUR_ID
// 4. Or replace empty string above with your ID
