import { Helmet } from 'react-helmet-async';
import { SEO_CONFIG, getPageUrl } from '@/config/seo-config';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string | null;
  url?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
  // For articles/blog posts
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}

/**
 * SEO Component for managing document head
 * 
 * Usage:
 * <SEO 
 *   title="Page Title" 
 *   description="Page description for search engines"
 *   keywords={['keyword1', 'keyword2']}
 * />
 */
export const SEO = ({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  noIndex = false,
  publishedTime,
  modifiedTime,
  author,
}: SEOProps) => {
  const siteConfig = SEO_CONFIG.site;
  
  // Build full title with site name
  const fullTitle = title 
    ? `${title} | ${siteConfig.name}`
    : `${siteConfig.name} - Vedic Astrology AI Platform`;
  
  const metaDescription = description || siteConfig.description;
  const metaImage = image || siteConfig.logo;
  const canonicalUrl = url || (typeof window !== 'undefined' ? window.location.href : siteConfig.domain);
  
  // Combine keywords
  const allKeywords = [
    ...keywords,
    'vedic astrology',
    'astrolord',
    'birth chart',
    'jyotish',
  ].filter((v, i, a) => a.indexOf(v) === i); // Remove duplicates

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={metaDescription} />
      {allKeywords.length > 0 && (
        <meta name="keywords" content={allKeywords.join(', ')} />
      )}
      
      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      {metaImage && <meta property="og:image" content={metaImage} />}
      <meta property="og:site_name" content={siteConfig.name} />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={metaDescription} />
      {metaImage && <meta property="twitter:image" content={metaImage} />}
      
      {/* Article-specific meta (for blog posts) */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      
      {/* Additional SEO */}
      <meta name="author" content={siteConfig.name} />
      <meta name="application-name" content={siteConfig.name} />
      
      {/* Theme and mobile */}
      <meta name="theme-color" content="#6366f1" />
      <meta name="msapplication-TileColor" content="#6366f1" />
    </Helmet>
  );
};

/**
 * Pre-configured SEO for common pages
 * Usage: <PageSEO page="home" />
 */
export const PageSEO = ({ page }: { page: keyof typeof SEO_CONFIG.pages }) => {
  const pageConfig = SEO_CONFIG.pages[page];
  
  if (!pageConfig) {
    return <SEO />;
  }
  
  return (
    <SEO
      title={pageConfig.title}
      description={pageConfig.description}
      keywords={pageConfig.keywords}
      image={pageConfig.image}
      url={getPageUrl(`/${page === 'home' ? '' : page}`)}
    />
  );
};

export default SEO;
