import React, { useState } from 'react';
import styles from './EmailMarketing.module.css';
import { Card, Button } from '../ui/BasicElements';

// Email channel selection component
const ChannelSelector = ({ selected, onChange }) => {
  const channels = [
    { id: 'klaviyo', name: 'Klaviyo', icon: '✉️' },
    { id: 'sms', name: 'SMS', icon: '📱' },
    { id: 'push', name: 'Push Notification', icon: '🔔' },
    { id: 'whatsapp', name: 'WhatsApp', icon: '💬' }
  ];
  
  return (
    <div className={styles.channelSelector}>
      <h3 className={styles.sectionTitle}>Select Channel</h3>
      <div className={styles.channelsGrid}>
        {channels.map(channel => (
          <button
            key={channel.id}
            className={`${styles.channelButton} ${selected === channel.id ? styles.channelSelected : ''}`}
            onClick={() => onChange(channel.id)}
          >
            <span className={styles.channelIcon}>{channel.icon}</span>
            <span>{channel.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Email template selection component
const TemplateSelector = ({ selected, onChange }) => {
  const templates = [
    { id: 'welcome', name: 'Welcome Series', description: 'First message after signup' },
    { id: 'abandoned-cart', name: 'Abandoned Cart', description: 'Recover lost sales' },
    { id: 'promotion', name: 'Promotion', description: 'Special offers and discounts' },
    { id: 'newsletter', name: 'Newsletter', description: 'Regular updates' },
    { id: 'feedback', name: 'Feedback', description: 'Customer satisfaction' }
  ];
  
  return (
    <div className={styles.templateSelector}>
      <h3 className={styles.sectionTitle}>Select Template</h3>
      <div className={styles.templatesList}>
        {templates.map(template => (
          <div
            key={template.id}
            className={`${styles.templateItem} ${selected === template.id ? styles.templateSelected : ''}`}
            onClick={() => onChange(template.id)}
          >
            <div>
              <h4 className={styles.templateName}>{template.name}</h4>
              <p className={styles.templateDescription}>{template.description}</p>
            </div>
            <div className={styles.templateCheck}>
              {selected === template.id && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Email editor component
const EmailEditor = ({ content, onChange }) => {
  return (
    <div className={styles.emailEditor}>
      <h3 className={styles.sectionTitle}>Compose Message</h3>
      <div className={styles.editorFields}>
        <div className={styles.field}>
          <label>Subject</label>
          <input 
            type="text" 
            className={styles.subjectInput}
            placeholder="Enter subject line" 
            value={content.subject}
            onChange={(e) => onChange({ ...content, subject: e.target.value })}
          />
        </div>
        
        <div className={styles.field}>
          <label>Message</label>
          <textarea 
            className={styles.messageInput}
            placeholder="Enter your message content here..." 
            value={content.message}
            onChange={(e) => onChange({ ...content, message: e.target.value })}
            rows={10}
          ></textarea>
        </div>
      </div>
    </div>
  );
};

// Campaign settings component
const CampaignSettings = ({ settings, onChange }) => {
  return (
    <div className={styles.campaignSettings}>
      <h3 className={styles.sectionTitle}>Campaign Settings</h3>
      <div className={styles.settingsGrid}>
        <div className={styles.settingItem}>
          <label>Schedule</label>
          <select 
            className={styles.settingSelect}
            value={settings.schedule} 
            onChange={(e) => onChange({ ...settings, schedule: e.target.value })}
          >
            <option value="now">Send immediately</option>
            <option value="later">Schedule for later</option>
            <option value="recurring">Set as recurring</option>
          </select>
        </div>
        
        <div className={styles.settingItem}>
          <label>Audience</label>
          <select 
            className={styles.settingSelect}
            value={settings.audience} 
            onChange={(e) => onChange({ ...settings, audience: e.target.value })}
          >
            <option value="all">All customers</option>
            <option value="active">Active customers</option>
            <option value="new">New customers</option>
            <option value="inactive">Inactive customers</option>
          </select>
        </div>
      </div>
      
      {settings.schedule === 'later' && (
        <div className={styles.scheduleFields}>
          <div className={styles.settingItem}>
            <label>Date</label>
            <input 
              type="date" 
              className={styles.dateInput}
              value={settings.date}
              onChange={(e) => onChange({ ...settings, date: e.target.value })}
            />
          </div>
          <div className={styles.settingItem}>
            <label>Time</label>
            <input 
              type="time" 
              className={styles.timeInput}
              value={settings.time}
              onChange={(e) => onChange({ ...settings, time: e.target.value })}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Preview component
const Preview = ({ channel, template, content }) => {
  const getChannelIcon = () => {
    switch(channel) {
      case 'klaviyo': return '✉️';
      case 'sms': return '📱';
      case 'push': return '🔔';
      case 'whatsapp': return '💬';
      default: return '📄';
    }
  };
  
  const getTemplateName = () => {
    switch(template) {
      case 'welcome': return 'Welcome Series';
      case 'abandoned-cart': return 'Abandoned Cart';
      case 'promotion': return 'Promotion';
      case 'newsletter': return 'Newsletter';
      case 'feedback': return 'Feedback Request';
      default: return 'Custom Template';
    }
  };
  
  return (
    <div className={styles.preview}>
      <h3 className={styles.sectionTitle}>Preview</h3>
      <div className={styles.previewContent}>
        <div className={styles.previewMeta}>
          <span className={styles.previewIcon}>{getChannelIcon()}</span>
          <span className={styles.previewTemplate}>{getTemplateName()}</span>
        </div>
        <div className={styles.previewSubject}>{content.subject || 'No subject'}</div>
        <div className={styles.previewMessage}>
          {content.message || 'No message content'}
        </div>
      </div>
    </div>
  );
};

// Main EmailMarketing component
const EmailMarketing = () => {
  const [selectedChannel, setSelectedChannel] = useState('klaviyo');
  const [selectedTemplate, setSelectedTemplate] = useState('promotion');
  const [content, setContent] = useState({
    subject: 'Special Offer: 20% Off Your Next Order',
    message: 'Hello valued customer,\n\nWe hope this message finds you well! We wanted to share an exclusive offer just for you: 20% off your next order.\n\nUse code: SAVE20 at checkout.\n\nThis offer expires in 7 days, so don\'t miss out!\n\nThank you for being a loyal customer.\n\nBest regards,\nThe Team'
  });
  const [settings, setSettings] = useState({
    schedule: 'now',
    audience: 'all',
    date: '',
    time: ''
  });
  
  const handleSendCampaign = () => {
    alert('Campaign prepared! In a production environment, this would be sent to n8n for processing.');
    
    // Example of data that would be sent to n8n
    console.log({
      channel: selectedChannel,
      template: selectedTemplate,
      content,
      settings
    });
  };
  
  return (
    <div className={styles.emailMarketingContainer}>
      {/* Header section */}
      <div className={styles.emailHeader}>
        <h1 className={styles.emailTitle}>Email Marketing</h1>
        <p className={styles.emailSubtitle}>
          Create and send marketing campaigns to your customers
        </p>
        <div className={styles.emailActions}>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => alert('Campaigns feature would be implemented here')}
          >
            Past Campaigns
          </Button>
          <Button 
            size="sm"
            onClick={handleSendCampaign}
          >
            Send Campaign
          </Button>
        </div>
      </div>
      
      {/* Main content */}
      <div className={styles.emailContent}>
        <div className={styles.emailLeftColumn}>
          <Card className={styles.emailCard}>
            <ChannelSelector selected={selectedChannel} onChange={setSelectedChannel} />
          </Card>
          
          <Card className={styles.emailCard}>
            <TemplateSelector selected={selectedTemplate} onChange={setSelectedTemplate} />
          </Card>
        </div>
        
        <div className={styles.emailRightColumn}>
          <Card className={styles.emailCard}>
            <EmailEditor content={content} onChange={setContent} />
          </Card>
          
          <div className={styles.emailBottomRow}>
            <Card className={styles.emailCard}>
              <CampaignSettings settings={settings} onChange={setSettings} />
            </Card>
            
            <Card className={styles.emailCard}>
              <Preview 
                channel={selectedChannel}
                template={selectedTemplate}
                content={content}
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailMarketing;