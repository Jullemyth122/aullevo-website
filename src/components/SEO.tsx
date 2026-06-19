import React from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalPath?: string;
  ogType?: string;
  ogImage?: string;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  canonicalPath,
  ogType = 'website',
  ogImage = 'https://aullevo-web.vercel.app/og-image.png',
}) => {
  const { pathname } = useLocation();
  const currentPath = canonicalPath !== undefined ? canonicalPath : pathname;
  // Ensure correct slash formatting
  const cleanPath = currentPath.startsWith('/') ? currentPath : `/${currentPath}`;
  const canonicalUrl = `https://aullevo-web.vercel.app${cleanPath === '/' ? '' : cleanPath}`;

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonicalUrl} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </>
  );
};

export default SEO;
