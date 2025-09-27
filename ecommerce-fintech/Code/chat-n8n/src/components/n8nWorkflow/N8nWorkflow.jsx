import React from 'react';
import styles from './N8nWorkflow.module.css';
import { Card, Button } from '../ui/BasicElements';

const N8nWorkflow = () => {
  // Sample workflow data
  const workflows = [
    {
      id: 'flow-1',
      name: 'Cart Abandonment Recovery',
      status: 'active',
      lastExecuted: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      executions: 532,
      successRate: 98.2
    },
    {
      id: 'flow-2',
      name: 'Customer Welcome Sequence',
      status: 'active',
      lastExecuted: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      executions: 867,
      successRate: 99.5
    },
    {
      id: 'flow-3',
      name: 'Product Review Request',
      status: 'inactive',
      lastEdited: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      executions: 215,
      successRate: 95.8
    }
  ];
  
  const openN8n = () => {
    window.open('https://n8n.meointechland.com', '_blank');
  };
  
  return (
    <div className={styles.n8nWorkflowContainer}>
      <div className={styles.n8nWorkflowHeader}>
        <h1 className={styles.n8nWorkflowTitle}>n8n Workflows</h1>
        <p className={styles.n8nWorkflowSubtitle}>Manage your automated workflows</p>
        
        <Button 
          className={styles.openN8nButton}
          onClick={openN8n}
        >
          Open n8n Dashboard
        </Button>
      </div>
      
      <div className={styles.workflowsGrid}>
        {workflows.map(workflow => (
          <Card key={workflow.id} className={styles.workflowCard}>
            <div className={styles.workflowHeader}>
              <h3 className={styles.workflowName}>{workflow.name}</h3>
              <div className={`${styles.workflowStatus} ${styles[workflow.status]}`}>
                {workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
              </div>
            </div>
            
            <div className={styles.workflowStats}>
              <div className={styles.workflowStat}>
                <span className={styles.statLabel}>Executions</span>
                <span className={styles.statValue}>{workflow.executions}</span>
              </div>
              <div className={styles.workflowStat}>
                <span className={styles.statLabel}>Success Rate</span>
                <span className={styles.statValue}>{workflow.successRate}%</span>
              </div>
              <div className={styles.workflowStat}>
                <span className={styles.statLabel}>Last Run</span>
                <span className={styles.statValue}>
                  {workflow.lastExecuted ? workflow.lastExecuted.toLocaleTimeString() : 'Never'}
                </span>
              </div>
            </div>
            
            <div className={styles.workflowActions}>
              <Button variant="outline" onClick={openN8n}>View in n8n</Button>
              <Button onClick={openN8n}>Edit Workflow</Button>
            </div>
          </Card>
        ))}
      </div>
      
      <div className={styles.n8nInfo}>
        <h2>About n8n</h2>
        <p>n8n is a workflow automation tool that allows you to connect different services and automate tasks. Our implementation connects with your shop to automate customer interactions, inventory management, and marketing campaigns.</p>
        <Button onClick={openN8n}>Learn More About n8n</Button>
      </div>
    </div>
  );
};

export default N8nWorkflow;