
/**
 * Enhanced Health Check Script
 * For monitoring application status and system integration
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const endpoints = [
  { url: 'https://example.com/api/health', name: 'API Health', critical: true },
  { url: 'https://example.com', name: 'Frontend', critical: true },
  { url: 'https://example.com/api/auth/status', name: 'Auth Service', critical: true },
  { url: 'https://example.com/api/calendar/status', name: 'Calendar Integration', critical: false },
  { url: 'https://example.com/api/video/status', name: 'Video Services', critical: false },
];

// Optional log directory
const LOG_DIR = process.env.HEALTH_LOG_DIR || path.join(__dirname, '../logs/health');

// Create log directory if needed
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Check each endpoint
async function checkEndpoints() {
  const results = [];
  let criticalFailure = false;
  
  for (const endpoint of endpoints) {
    try {
      const result = await checkEndpoint(endpoint.url);
      console.log(`✅ ${endpoint.name}: OK (${result.statusCode}) - ${result.responseTime}ms`);
      results.push({ 
        endpoint: endpoint.name, 
        url: endpoint.url, 
        status: 'ok',
        statusCode: result.statusCode,
        responseTime: result.responseTime,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`❌ ${endpoint.name}: FAILED - ${error.message}`);
      results.push({ 
        endpoint: endpoint.name, 
        url: endpoint.url, 
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      if (endpoint.critical) {
        criticalFailure = true;
      }
    }
  }
  
  // Run integration checks if no critical failures
  if (!criticalFailure) {
    try {
      await checkIntegration();
      console.log('✅ Integration Check: OK');
    } catch (error) {
      console.error(`❌ Integration Check: FAILED - ${error.message}`);
      criticalFailure = true;
    }
  }
  
  // Write results to log file
  const logFile = path.join(LOG_DIR, `health-${new Date().toISOString().slice(0,10)}.json`);
  try {
    // Append to the log file if it exists
    let existingData = [];
    if (fs.existsSync(logFile)) {
      const fileContent = fs.readFileSync(logFile, 'utf8');
      existingData = JSON.parse(fileContent);
    }
    
    existingData.push({
      timestamp: new Date().toISOString(),
      results,
      overallStatus: criticalFailure ? 'failure' : 'ok'
    });
    
    fs.writeFileSync(logFile, JSON.stringify(existingData, null, 2));
  } catch (logError) {
    console.error('Failed to write to log file:', logError);
  }
  
  return { results, criticalFailure };
}

// Check individual endpoint
function checkEndpoint(url) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    https.get(url, (res) => {
      const responseTime = Date.now() - startTime;
      
      if (res.statusCode >= 200 && res.statusCode < 300) {
        resolve({ statusCode: res.statusCode, responseTime });
      } else {
        reject(new Error(`HTTP status ${res.statusCode}`));
      }
      
      // Consume response data to free up memory
      res.resume();
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Check system integration by verifying end-to-end flow
async function checkIntegration() {
  return new Promise((resolve, reject) => {
    // Simulate an integration check - in a real app this would test an actual workflow
    // For example, create a test appointment and verify it shows in calendar
    setTimeout(() => {
      if (Math.random() > 0.1) { // 90% success rate for demo
        resolve();
      } else {
        reject(new Error('Integration test workflow failed'));
      }
    }, 500);
  });
}

// Add a cleanup function for resources
function cleanup() {
  console.log('Cleaning up resources...');
  // Close any open connections, etc.
}

// Run the checks
async function main() {
  try {
    const { results, criticalFailure } = await checkEndpoints();
    
    if (criticalFailure) {
      console.error('❌ Health check detected critical failures!');
      process.exit(1);
    } else {
      console.log('✅ All critical services are operational');
      
      // Calculate status summary
      const totalChecks = results.length;
      const failedChecks = results.filter(r => r.status === 'failed').length;
      const successRate = ((totalChecks - failedChecks) / totalChecks * 100).toFixed(1);
      
      console.log(`Health Check Summary: ${successRate}% operational (${totalChecks - failedChecks}/${totalChecks})`);
    }
  } catch (error) {
    console.error('Health check failed with exception:', error);
    process.exit(1);
  } finally {
    cleanup();
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM signal, cleaning up...');
  cleanup();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT signal, cleaning up...');
  cleanup();
  process.exit(0);
});

// Run when executed directly
if (require.main === module) {
  main().catch(err => {
    console.error('Unhandled error in health check:', err);
    process.exit(1);
  });
}

// Export for use in other scripts
module.exports = {
  checkEndpoints,
  checkEndpoint,
  checkIntegration
};
