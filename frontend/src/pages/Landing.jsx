import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, TrendingUp, Users, Lock, BarChart3, Zap, Shield } from 'lucide-react';
import LandingNavigation from '../components/landing/LandingNavigation';
import LandingHero from '../components/landing/LandingHero';
import FeaturesSection from '../components/landing/FeaturesSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import FAQSection from '../components/landing/FAQSection';
import CTASection from '../components/landing/CTASection';
import LandingFooter from '../components/landing/LandingFooter';
import '../styles/landing.css';

const Landing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Set page title and meta tags for SEO
    document.title = 'Chitfunds - Enterprise Chit Group Management Platform';
    
    // Create meta tags
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Manage chit groups efficiently with Chitfunds - the secure, enterprise-grade platform for group savings and wealth management.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Manage chit groups efficiently with Chitfunds - the secure, enterprise-grade platform for group savings and wealth management.';
      document.head.appendChild(meta);
    }

    // Add canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.href;

    // Add Open Graph meta tags
    const ogTags = [
      { property: 'og:title', content: 'Chitfunds - Enterprise Chit Group Management Platform' },
      { property: 'og:description', content: 'Secure and efficient chit group management for enterprises' },
      { property: 'og:type', content: 'website' },
      { property: 'og:image', content: window.location.origin + '/og-image.png' }
    ];

    ogTags.forEach(tagData => {
      let tag = document.querySelector(`meta[property="${tagData.property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', tagData.property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', tagData.content);
    });

    // Add schema markup for Organization
    const schemaScript = document.querySelector('script[type="application/ld+json"]');
    if (!schemaScript) {
      const schema = document.createElement('script');
      schema.type = 'application/ld+json';
      schema.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Chitfunds',
        description: 'Enterprise Chit Group Management Platform',
        url: window.location.origin,
        logo: window.location.origin + '/logo.png',
        sameAs: [
          'https://twitter.com/chitfunds',
          'https://www.linkedin.com/company/chitfunds'
        ]
      });
      document.head.appendChild(schema);
    }
  }, []);

  return (
    <div className="landing-page bg-gradient-to-b from-white via-slate-50 to-white">
      <LandingNavigation />
      <LandingHero />
      <FeaturesSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <LandingFooter />
    </div>
  );
};

export default Landing;
