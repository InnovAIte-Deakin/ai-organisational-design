import React, { useState, useEffect } from 'react';
import styles from './ChartVisualizer.module.css';

/**
 * Simple chart visualization for the dashboard
 */
export const BarChart = ({ data = [], color = '#00ffff', height = 200, showLines = true }) => {
  // Find the max value to scale the bars
  const maxValue = Math.max(...data.map(item => item.value)) * 1.2;
  
  return (
    <div className={styles.chartContainer} style={{ height: `${height}px` }}>
      {/* Y-axis labels */}
      {showLines && (
        <div className={styles.yAxis}>
          {[...Array(5)].map((_, i) => {
            const value = Math.round((maxValue / 4) * (4 - i));
            return (
              <div key={i} className={styles.yAxisLabel}>
                {value}
              </div>
            );
          })}
        </div>
      )}
      
      {/* Chart bars */}
      <div className={styles.chartBars}>
        {data.map((item, index) => (
          <div key={index} className={styles.barContainer}>
            <div 
              className={styles.bar} 
              style={{
                height: `${(item.value / maxValue) * 100}%`,
                backgroundColor: color
              }}
            >
              <div className={styles.barTooltip}>
                {item.value}
                {item.label && <div>{item.label}</div>}
              </div>
            </div>
            <div className={styles.xLabel}>{item.label}</div>
          </div>
        ))}
      </div>
      
      {/* Grid lines */}
      {showLines && (
        <div className={styles.gridLines}>
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className={styles.gridLine} 
              style={{ bottom: `${(i * 25)}%` }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Line chart component for the dashboard
 */
export const LineChart = ({ data = [], color = '#00ffff', height = 200, showLines = true }) => {
  // Find the max value to scale the chart
  const maxValue = Math.max(...data.map(item => item.value)) * 1.2;
  
  // Create SVG path for the line chart
  const createLinePath = () => {
    if (data.length < 2) return '';
    
    const points = data.map((item, index) => {
      const x = `${(index / (data.length - 1)) * 100}%`;
      const y = `${100 - (item.value / maxValue) * 100}%`;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
    
    return points;
  };
  
  return (
    <div className={styles.chartContainer} style={{ height: `${height}px` }}>
      {/* Y-axis labels */}
      {showLines && (
        <div className={styles.yAxis}>
          {[...Array(5)].map((_, i) => {
            const value = Math.round((maxValue / 4) * (4 - i));
            return (
              <div key={i} className={styles.yAxisLabel}>
                {value}
              </div>
            );
          })}
        </div>
      )}
      
      {/* SVG for line chart */}
      <svg className={styles.lineChart}>
        <path
          d={createLinePath()}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Data points */}
        {data.map((item, index) => (
          <circle
            key={index}
            cx={`${(index / (data.length - 1)) * 100}%`}
            cy={`${100 - (item.value / maxValue) * 100}%`}
            r="4"
            fill={color}
            className={styles.dataPoint}
          />
        ))}
      </svg>
      
      {/* X-axis labels */}
      <div className={styles.xAxis}>
        {data.map((item, index) => (
          <div 
            key={index} 
            className={styles.xAxisLabel} 
            style={{ left: `${(index / (data.length - 1)) * 100}%` }}
          >
            {item.label}
          </div>
        ))}
      </div>
      
      {/* Grid lines */}
      {showLines && (
        <div className={styles.gridLines}>
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className={styles.gridLine} 
              style={{ bottom: `${(i * 25)}%` }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * ChartVisualizer component that updates charts periodically
 */
export function ChartVisualizer() {
  const [apiData, setApiData] = useState([
    { date: '2025-09-22', value: 1250, label: '22' },
    { date: '2025-09-23', value: 1520, label: '23' },
    { date: '2025-09-24', value: 1890, label: '24' },
    { date: '2025-09-25', value: 1680, label: '25' },
    { date: '2025-09-26', value: 2130, label: '26' },
    { date: '2025-09-27', value: 1950, label: '27' },
    { date: '2025-09-28', value: 2310, label: '28' },
  ]);
  
  const [executionData, setExecutionData] = useState([
    { date: '2025-09-22', value: 78, label: '22' },
    { date: '2025-09-23', value: 92, label: '23' },
    { date: '2025-09-24', value: 85, label: '24' },
    { date: '2025-09-25', value: 97, label: '25' },
    { date: '2025-09-26', value: 102, label: '26' },
    { date: '2025-09-27', value: 89, label: '27' },
    { date: '2025-09-28', value: 110, label: '28' },
  ]);
  
  // Simulate data updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update API data with random fluctuations
      setApiData(prev => prev.map(item => ({
        ...item,
        value: Math.max(500, item.value + (Math.random() - 0.5) * 300)
      })));
      
      // Update execution data with random fluctuations
      setExecutionData(prev => prev.map(item => ({
        ...item,
        value: Math.max(50, item.value + (Math.random() - 0.5) * 15)
      })));
    }, 5000); // Update every 5 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className={styles.chartsContainer}>
      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>API Calls Trend (7 days)</h3>
        <LineChart data={apiData} height={250} color="#00ffff" />
      </div>
      
      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>Execution Performance</h3>
        <BarChart data={executionData} height={250} color="#00ddaa" />
      </div>
    </div>
  );
}

export default ChartVisualizer;