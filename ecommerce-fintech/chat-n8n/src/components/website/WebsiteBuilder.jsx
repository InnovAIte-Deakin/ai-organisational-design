import React, { useState } from 'react';
import styles from './WebsiteBuilder.module.css';
import { Card, Button } from '../ui/BasicElements';

const WebsiteBuilder = () => {
  // State for website demo creation
  const [templateType, setTemplateType] = useState('ecommerce');
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [demoCreated, setDemoCreated] = useState(false);
  const [websiteName, setWebsiteName] = useState('');
  
  // Template types available
  const templates = [
    {
      id: 'ecommerce',
      title: 'E-commerce Store',
      description: 'Complete online shop with product catalog and checkout',
      icon: '🛒',
      features: ['Product catalog', 'Shopping cart', 'Customer accounts', 'Payment processing']
    },
    {
      id: 'portfolio',
      title: 'Personal Portfolio',
      description: 'Showcase your work, skills and experience',
      icon: '📁',
      features: ['Project gallery', 'About me section', 'Skills display', 'Contact form']
    },
    {
      id: 'blog',
      title: 'Blog / News',
      description: 'Share articles, news and keep readers updated',
      icon: '📝',
      features: ['Article publishing', 'Categories', 'Comments', 'Author profiles']
    },
    {
      id: 'business',
      title: 'Business Website',
      description: 'Professional presence for your company or service',
      icon: '💼',
      features: ['Service descriptions', 'Team members', 'Testimonials', 'Contact information']
    }
  ];
  
  // Features available for website building
  const buildFeatures = [
    {
      title: 'Drag-and-Drop Builder',
      description: 'Create pages visually without coding',
      icon: '🧩'
    },
    {
      title: 'Mobile Responsive',
      description: 'Sites look great on all devices',
      icon: '📱'
    },
    {
      title: 'SEO Tools',
      description: 'Built-in optimization for search engines',
      icon: '🔍'
    },
    {
      title: 'Analytics Integration',
      description: 'Connect with Google Analytics for insights',
      icon: '📊'
    }
  ];

  // Handle template selection
  const handleTemplateSelect = (templateId) => {
    setTemplateType(templateId);
  };
  
  // Handle create website button
  const handleCreateWebsite = () => {
    setShowDemoModal(true);
  };
  
  // Handle demo creation
  const handleCreateDemo = () => {
    if (!websiteName.trim()) return;
    
    setLoadingDemo(true);
    
    // Simulate API call/processing
    setTimeout(() => {
      setLoadingDemo(false);
      setDemoCreated(true);
    }, 2000);
  };
  
  // Handle demo modal close
  const handleCloseModal = () => {
    setShowDemoModal(false);
    setDemoCreated(false);
    setWebsiteName('');
  };
  
  // Demo modal component
  const DemoModal = () => (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <button className={styles.modalClose} onClick={handleCloseModal}>×</button>
        
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {demoCreated ? 'Website Created!' : 'Create Website Demo'}
          </h2>
        </div>
        
        <div className={styles.modalContent}>
          {demoCreated ? (
            <div className={styles.demoSuccess}>
              <div className={styles.demoSuccessIcon}>✅</div>
              <h3 className={styles.demoSuccessTitle}>
                {websiteName} has been created!
              </h3>
              <p className={styles.demoSuccessText}>
                Your {templates.find(t => t.id === templateType)?.title} demo site is now ready.
              </p>
              <div className={styles.demoSuccessActions}>
                <Button onClick={() => window.open('https://n8n.meointechland.com', '_blank')}>
                  Visit Website
                </Button>
                <Button variant="outline" onClick={handleCloseModal}>
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.formField}>
                <label htmlFor="websiteName">Website Name</label>
                <input
                  id="websiteName"
                  type="text"
                  value={websiteName}
                  onChange={(e) => setWebsiteName(e.target.value)}
                  placeholder="Enter your website name"
                  className={styles.textInput}
                />
              </div>
              
              <div className={styles.formField}>
                <label>Template Type</label>
                <div className={styles.templatePreview}>
                  <span className={styles.templatePreviewIcon}>
                    {templates.find(t => t.id === templateType)?.icon}
                  </span>
                  <span className={styles.templatePreviewName}>
                    {templates.find(t => t.id === templateType)?.title}
                  </span>
                </div>
              </div>
              
              <div className={styles.modalActions}>
                <Button 
                  onClick={handleCreateDemo}
                  disabled={!websiteName.trim() || loadingDemo}
                >
                  {loadingDemo ? 'Creating...' : 'Create Demo'}
                </Button>
                <Button variant="outline" onClick={handleCloseModal}>
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.websiteBuilderContainer}>
      {/* Header section */}
      <div className={styles.websiteHeader}>
        <h1 className={styles.websiteTitle}>Website Builder</h1>
        <p className={styles.websiteSubtitle}>
          Create and launch your professional website in minutes
        </p>
        <div className={styles.websiteActions}>
          <Button
            size="sm"
            onClick={handleCreateWebsite}
          >
            Create Website
          </Button>
        </div>
      </div>
      
      {/* Main content */}
      <div className={styles.templateSection}>
        <h2 className={styles.sectionTitle}>Choose a Template</h2>
        <div className={styles.templatesGrid}>
          {templates.map(template => (
            <Card 
              key={template.id}
              className={`${styles.templateCard} ${templateType === template.id ? styles.templateCardSelected : ''}`}
              onClick={() => handleTemplateSelect(template.id)}
            >
              <div className={styles.templateIcon}>{template.icon}</div>
              <h3 className={styles.templateTitle}>{template.title}</h3>
              <p className={styles.templateDescription}>{template.description}</p>
              <ul className={styles.templateFeatures}>
                {template.features.map((feature, idx) => (
                  <li key={idx} className={styles.templateFeature}>
                    <span className={styles.templateFeatureIcon}>•</span>
                    {feature}
                  </li>
                ))}
              </ul>
              {templateType === template.id && (
                <div className={styles.templateSelectedBadge}>Selected</div>
              )}
            </Card>
          ))}
        </div>
      </div>
      
      <div className={styles.featuresSection}>
        <h2 className={styles.sectionTitle}>Website Builder Features</h2>
        <div className={styles.featuresGrid}>
          {buildFeatures.map((feature, idx) => (
            <Card key={idx} className={styles.featureCard}>
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
      
      <div className={styles.ctaSection}>
        <Card className={styles.ctaCard}>
          <h2 className={styles.ctaTitle}>Ready to launch your website?</h2>
          <p className={styles.ctaDescription}>
            Get started with our easy-to-use website builder and have your site up and running quickly.
          </p>
          <Button onClick={handleCreateWebsite}>Create Your Website Now</Button>
        </Card>
      </div>
      
      {/* Demo creation modal */}
      {showDemoModal && <DemoModal />}
    </div>
  );
};

export default WebsiteBuilder;