#!/usr/bin/env node

/**
 * CDN Invalidation Script for James & Oliver's Wedding Site
 * Purges HTML and JSON files while preserving hashed assets
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration - Update these with your CDN details
const CONFIG = {
  cloudflare: {
    zoneId: process.env.CLOUDFLARE_ZONE_ID,
    apiToken: process.env.CLOUDFLARE_API_TOKEN,
    domain: process.env.CLOUDFLARE_DOMAIN || 'your-domain.com'
  },
  netlify: {
    siteId: process.env.NETLIFY_SITE_ID,
    accessToken: process.env.NETLIFY_ACCESS_TOKEN
  },
  vercel: {
    projectId: process.env.VERCEL_PROJECT_ID,
    accessToken: process.env.VERCEL_ACCESS_TOKEN
  }
};

// Files to invalidate (HTML and JSON only)
const FILES_TO_INVALIDATE = [
  '/',
  '/index.html',
  '/pages/index.html',
  '/pages/gifts.html',
  '/pages/photos.html',
  '/pages/thankyou.html',
  '/pages/privacy.html',
  '/version.json',
  '/manifest.json',
  '/sw.js'
];

class CDNInvalidator {
  constructor() {
    this.results = [];
  }

  async invalidateCloudflare() {
    if (!CONFIG.cloudflare.zoneId || !CONFIG.cloudflare.apiToken) {
      console.log('⚠️  Cloudflare credentials not configured');
      return;
    }

    console.log('🔄 Invalidating Cloudflare cache...');

    const data = JSON.stringify({
      files: FILES_TO_INVALIDATE.map(file => `https://${CONFIG.cloudflare.domain}${file}`)
    });

    const options = {
      hostname: 'api.cloudflare.com',
      port: 443,
      path: `/client/v4/zones/${CONFIG.cloudflare.zoneId}/purge_cache`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.cloudflare.apiToken}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        res.on('end', () => {
          try {
            const result = JSON.parse(responseData);
            if (result.success) {
              console.log('✅ Cloudflare cache invalidated successfully');
              this.results.push({ provider: 'Cloudflare', success: true });
            } else {
              console.log('❌ Cloudflare invalidation failed:', result.errors);
              this.results.push({ provider: 'Cloudflare', success: false, errors: result.errors });
            }
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        console.log('❌ Cloudflare request failed:', error.message);
        this.results.push({ provider: 'Cloudflare', success: false, error: error.message });
        reject(error);
      });

      req.write(data);
      req.end();
    });
  }

  async invalidateNetlify() {
    if (!CONFIG.netlify.siteId || !CONFIG.netlify.accessToken) {
      console.log('⚠️  Netlify credentials not configured');
      return;
    }

    console.log('🔄 Invalidating Netlify cache...');

    const data = JSON.stringify({
      paths: FILES_TO_INVALIDATE
    });

    const options = {
      hostname: 'api.netlify.com',
      port: 443,
      path: `/api/v1/sites/${CONFIG.netlify.siteId}/purge`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.netlify.accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        res.on('end', () => {
          if (res.statusCode === 200) {
            console.log('✅ Netlify cache invalidated successfully');
            this.results.push({ provider: 'Netlify', success: true });
          } else {
            console.log('❌ Netlify invalidation failed:', responseData);
            this.results.push({ provider: 'Netlify', success: false, error: responseData });
          }
          resolve(responseData);
        });
      });

      req.on('error', (error) => {
        console.log('❌ Netlify request failed:', error.message);
        this.results.push({ provider: 'Netlify', success: false, error: error.message });
        reject(error);
      });

      req.write(data);
      req.end();
    });
  }

  async invalidateVercel() {
    if (!CONFIG.vercel.projectId || !CONFIG.vercel.accessToken) {
      console.log('⚠️  Vercel credentials not configured');
      return;
    }

    console.log('🔄 Invalidating Vercel cache...');

    const data = JSON.stringify({
      paths: FILES_TO_INVALIDATE
    });

    const options = {
      hostname: 'api.vercel.com',
      port: 443,
      path: `/v1/integrations/deploy/${CONFIG.vercel.projectId}/purge`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.vercel.accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        res.on('end', () => {
          if (res.statusCode === 200) {
            console.log('✅ Vercel cache invalidated successfully');
            this.results.push({ provider: 'Vercel', success: true });
          } else {
            console.log('❌ Vercel invalidation failed:', responseData);
            this.results.push({ provider: 'Vercel', success: false, error: responseData });
          }
          resolve(responseData);
        });
      });

      req.on('error', (error) => {
        console.log('❌ Vercel request failed:', error.message);
        this.results.push({ provider: 'Vercel', success: false, error: error.message });
        reject(error);
      });

      req.write(data);
      req.end();
    });
  }

  async invalidateAll() {
    console.log('🚀 Starting CDN invalidation...');
    console.log(`📋 Files to invalidate: ${FILES_TO_INVALIDATE.join(', ')}`);

    const promises = [
      this.invalidateCloudflare(),
      this.invalidateNetlify(),
      this.invalidateVercel()
    ];

    await Promise.allSettled(promises);

    console.log('\n📊 Invalidation Results:');
    this.results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.provider}: ${result.success ? 'Success' : 'Failed'}`);
      if (!result.success && result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });

    const successCount = this.results.filter(r => r.success).length;
    console.log(`\n🎉 Completed: ${successCount}/${this.results.length} providers successful`);
  }
}

// CLI usage
if (require.main === module) {
  const invalidator = new CDNInvalidator();
  invalidator.invalidateAll().catch(console.error);
}

module.exports = CDNInvalidator;
