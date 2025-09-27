import React, { useState, useEffect, useRef } from 'react';
import styles from './Dashboard.module.css';
import { Card, Button, Badge } from '../ui/BasicElements';
import { cx } from '../../utils/helpers';
import ChartVisualizer from './ChartVisualizer';

// Icons for the dashboard
const Icon = ({ name, size = '24' }) => {
  const icons = {
    chart: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18"></path>
        <path d="M18 17V9"></path>
        <path d="M13 17V5"></path>
        <path d="M8 17v-3"></path>
      </svg>
    ),
    users: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    ),
    cart: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </svg>
    ),
    dollar: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"></line>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
      </svg>
    ),
    clock: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
    ),
    zap: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
      </svg>
    ),
    target: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="12" cy="12" r="6"></circle>
        <circle cx="12" cy="12" r="2"></circle>
      </svg>
    ),
    bot: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
    ),
  };
  
  return icons[name] || null;
};

// MetricsCard component
export const MetricsCard = ({ title, value, format = 'number', trend, subtitle, icon, onClick }) => {
  let formattedValue = value;
  
  if (format === 'percentage') {
    formattedValue = `${value}%`;
  } else if (format === 'currency') {
    formattedValue = `$${value.toLocaleString()}`;
  }
  
  return (
    <Card 
      className={cx(styles.metricsCard, onClick && styles.clickable)} 
      onClick={onClick}
    >
      <div className={styles.metricsCardContent}>
        <div className={styles.metricsIconWrapper}>
          {icon}
        </div>
        <div>
          <h3 className={styles.metricsTitle}>{title}</h3>
          <p className={styles.metricsValue}>{formattedValue}</p>
          
          {trend && (
            <div className={cx(
              styles.metricsTrend,
              trend.direction === 'up' ? styles.trendUp : styles.trendDown
            )}>
              {trend.direction === 'up' ? '↑' : '↓'} {trend.percentage}% {trend.period}
            </div>
          )}
          
          {subtitle && (
            <p className={styles.metricsSubtitle}>{subtitle}</p>
          )}
        </div>
      </div>
    </Card>
  );
};

// ChartCard component
export const ChartCard = ({ title, height = 300, children }) => {
  return (
    <Card className={styles.chartCard}>
      <h3 className={styles.chartTitle}>{title}</h3>
      <div className={styles.chartContainer} style={{ height: `${height}px` }}>
        {children || (
          <div className={styles.chartPlaceholder}>
            <p>Chart data visualization will appear here</p>
            <p className={styles.chartPlaceholderText}>Connect to your data source to see real metrics</p>
          </div>
        )}
      </div>
    </Card>
  );
};

// ActivityItem component
const ActivityItem = ({ activity }) => {
  const getIcon = () => {
    switch (activity.type) {
      case 'cart_recovered': return <Icon name="cart" size="16" />;
      case 'email_sent': return <Icon name="users" size="16" />;
      case 'campaign_launched': return <Icon name="zap" size="16" />;
      case 'inventory_reorder': return <Icon name="chart" size="16" />;
      default: return <Icon name="clock" size="16" />;
    }
  };
  
  const getTime = () => {
    const now = new Date();
    const timestamp = new Date(activity.timestamp);
    const diffMinutes = Math.floor((now - timestamp) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else {
      const diffHours = Math.floor(diffMinutes / 60);
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }
  };
  
  return (
    <div className={styles.activityItem}>
      <div className={styles.activityIconWrapper}>
        {getIcon()}
      </div>
      <div className={styles.activityContent}>
        <p className={styles.activityDescription}>{activity.description}</p>
        <p className={styles.activityTime}>{getTime()}</p>
      </div>
      {activity.value && (
        <div className={styles.activityValue}>
          ${activity.value.toFixed(2)}
        </div>
      )}
    </div>
  );
};

// RecentActivity component
export const RecentActivity = ({ activities = [] }) => {
  return (
    <Card className={styles.recentActivityCard}>
      <h3 className={styles.recentActivityTitle}>Recent Activity</h3>
      <div className={styles.activityList}>
        {activities.length > 0 ? (
          activities.map(activity => (
            <ActivityItem key={activity.id} activity={activity} />
          ))
        ) : (
          <p className={styles.noActivity}>No recent activity to display</p>
        )}
      </div>
    </Card>
  );
};

// QuickActions component
export const QuickActions = ({ onNavigate }) => {
  const actions = [
    { 
      title: 'Manage Flows', 
      description: 'Set up and configure automated workflows',
      icon: <Icon name="zap" size="20" />,
      action: () => onNavigate('flows')
    },
    { 
      title: 'API Settings', 
      description: 'Configure API endpoints and webhooks',
      icon: <Icon name="bot" size="20" />,
      action: () => onNavigate('settings')
    },
    { 
      title: 'View Analytics', 
      description: 'Get insights on your workflow performance',
      icon: <Icon name="chart" size="20" />,
      action: () => onNavigate('analytics')
    },
  ];
  
  return (
    <Card className={styles.quickActions}>
      <h3 className={styles.quickActionsTitle}>Quick Actions</h3>
      <div className={styles.quickActionsList}>
        {actions.map((action, index) => (
          <div key={index} className={styles.quickActionItem} onClick={action.action}>
            <div className={styles.quickActionIcon}>
              {action.icon}
            </div>
            <div className={styles.quickActionContent}>
              <h4 className={styles.quickActionTitle}>{action.title}</h4>
              <p className={styles.quickActionDescription}>{action.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

// Main Dashboard component
export const Dashboard = () => {
  // Reference to the dashboard container for scrolling
  const dashboardRef = useRef(null);
  
  const [metrics, setMetrics] = useState({
    cartRecoveryRate: 27.3,
    revenueUplift: 18.2,
    timeSavings: 8.5,
    abandonedCartsBaseline: 68.5,
    ctr: 22.4,
    cvr: 12.8,
  });

  const [dashboardMetrics, setDashboardMetrics] = useState({
    totalRevenue: 23100,
    totalOrders: 72,
    activeAgents: 4,
    automationRate: 82.3,
  });

  const [mockRecentActivity, setMockRecentActivity] = useState([
    {
      id: '1',
      type: 'cart_recovered',
      description: 'Cart recovery email converted - Handmade Soap Bundle',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      agentId: 'cart-recovery',
      value: 89.99,
    },
    {
      id: '2',
      type: 'email_sent',
      description: 'Abandoned cart email sent to 15 customers',
      timestamp: new Date(Date.now() - 12 * 60 * 1000), // 12 minutes ago
      agentId: 'cart-recovery',
    },
    {
      id: '3',
      type: 'campaign_launched',
      description: 'Holiday promotion campaign launched on Facebook',
      timestamp: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
      agentId: 'marketing',
    },
    {
      id: '4',
      type: 'inventory_reorder',
      description: 'Auto-reorder triggered for Organic Face Cream (50 units)',
      timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      agentId: 'inventory',
    },
    {
      id: '5',
      type: 'cart_recovered',
      description: 'SMS recovery converted - Essential Oil Set',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      agentId: 'cart-recovery',
      value: 124.99,
    },
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update metrics with small random changes
      setMetrics(prev => ({
        ...prev,
        cartRecoveryRate: +(prev.cartRecoveryRate + (Math.random() - 0.5) * 0.5).toFixed(1),
        revenueUplift: +(prev.revenueUplift + (Math.random() - 0.5) * 0.3).toFixed(1),
        cvr: +(prev.cvr + (Math.random() - 0.5) * 0.2).toFixed(1),
      }));

      // Update dashboard metrics
      setDashboardMetrics(prev => ({
        ...prev,
        totalRevenue: Math.floor(prev.totalRevenue * (1 + (Math.random() - 0.3) / 100)),
        totalOrders: prev.totalOrders + (Math.random() > 0.7 ? 1 : 0),
      }));
      
      // Occasionally add a new activity (about 10% of the time)
      if (Math.random() > 0.9) {
        const activityTypes = ['cart_recovered', 'email_sent', 'campaign_launched', 'inventory_reorder'];
        const newActivity = {
          id: `activity-${Date.now()}`,
          type: activityTypes[Math.floor(Math.random() * activityTypes.length)],
          description: `New ${activityTypes[Math.floor(Math.random() * activityTypes.length)].replace('_', ' ')} event`,
          timestamp: new Date(),
          agentId: ['cart-recovery', 'marketing', 'inventory'][Math.floor(Math.random() * 3)],
          value: Math.random() > 0.5 ? +(Math.random() * 100 + 50).toFixed(2) : null,
        };
        
        setMockRecentActivity(prev => [newActivity, ...prev.slice(0, 4)]);
      }

    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleNavigate = (page) => {
    console.log(`Navigate to: ${page}`);
    // In a real application, this would use navigation from a router
  };

  return (
    <div className={styles.dashboardContainer} ref={dashboardRef}>
      {/* Header */}
      <div className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}>Dashboard</h1>
        <p className={styles.dashboardSubtitle}>
          Overview of your n8n system performance
        </p>
        <div className={styles.dashboardActions}>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => alert('Data export functionality would be implemented here')}
          >
            Export Data
          </Button>
          <Button 
            size="sm"
            onClick={() => {
              // Manual refresh of metrics
              setMetrics(prev => ({
                ...prev,
                cartRecoveryRate: +(prev.cartRecoveryRate + (Math.random() - 0.3) * 1.2).toFixed(1),
                revenueUplift: +(prev.revenueUplift + (Math.random() - 0.3) * 0.8).toFixed(1),
                timeSavings: +(prev.timeSavings + (Math.random() - 0.3) * 0.5).toFixed(1),
                cvr: +(prev.cvr + (Math.random() - 0.3) * 0.7).toFixed(1),
              }));
              
              setDashboardMetrics(prev => ({
                ...prev,
                totalRevenue: Math.floor(prev.totalRevenue * (1 + (Math.random() * 0.02))),
                totalOrders: prev.totalOrders + Math.floor(Math.random() * 3),
                automationRate: +(Math.min(99.9, prev.automationRate + (Math.random() - 0.3) * 0.5)).toFixed(1),
              }));
              
              // Add a notification that metrics were refreshed
              const newActivity = {
                id: `refresh-${Date.now()}`,
                type: 'email_sent',
                description: 'Metrics refreshed manually',
                timestamp: new Date(),
                agentId: 'system'
              };
              
              setMockRecentActivity(prev => [newActivity, ...prev.slice(0, 4)]);
            }}
          >
            Refresh Metrics
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className={styles.metricsGrid}>
        <MetricsCard
          title="Flow Success Rate"
          value={metrics.cartRecoveryRate}
          format="percentage"
          trend={{
            direction: 'up',
            percentage: 2.3,
            period: 'last week',
          }}
          icon={<Icon name="chart" />}
          onClick={() => handleNavigate('flows')}
        />

        <MetricsCard
          title="Efficiency Uplift"
          value={metrics.revenueUplift}
          format="percentage"
          trend={{
            direction: 'up',
            percentage: 1.5,
            period: 'last week',
          }}
          icon={<Icon name="zap" />}
        />

        <MetricsCard
          title="Time Saved"
          value={`${metrics.timeSavings}h`}
          format="number"
          subtitle="This week"
          icon={<Icon name="clock" />}
        />

        <MetricsCard
          title="Active Workflows"
          value={dashboardMetrics.activeAgents}
          format="number"
          subtitle="All systems operational"
          icon={<Icon name="bot" />}
          onClick={() => handleNavigate('settings')}
        />
      </div>

      {/* Secondary Metrics */}
      <div className={styles.metricsGrid}>
        <MetricsCard
          title="API Calls"
          value={dashboardMetrics.totalRevenue}
          format="number"
          trend={{
            direction: 'up',
            percentage: 12.5,
            period: 'last month',
          }}
          icon={<Icon name="chart" />}
        />

        <MetricsCard
          title="Executions"
          value={dashboardMetrics.totalOrders}
          format="number"
          trend={{
            direction: 'up',
            percentage: 8.3,
            period: 'last month',
          }}
          icon={<Icon name="target" />}
        />

        <MetricsCard
          title="Success Rate"
          value={metrics.cvr}
          format="percentage"
          trend={{
            direction: 'up',
            percentage: 3.2,
            period: 'last week',
          }}
          icon={<Icon name="target" />}
        />

        <MetricsCard
          title="Automation Rate"
          value={dashboardMetrics.automationRate}
          format="percentage"
          subtitle="Tasks automated"
          icon={<Icon name="zap" />}
        />
      </div>

      {/* Charts */}
      <div className={styles.chartsGrid}>
        {/* We use ChartVisualizer with title and proper styling */}
        <Card className={styles.chartCard}>
          <h3 className={styles.chartTitle}>API Calls Trend (7 days)</h3>
          <ChartVisualizer />
        </Card>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className={styles.actionsGrid}>
        <QuickActions onNavigate={handleNavigate} />
        <RecentActivity activities={mockRecentActivity} />
      </div>
    </div>
  );
};

export default Dashboard;