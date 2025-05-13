"use client";

// Define webhook types for different operations
export type WebhookType = 
  | 'findBestClips' 
  | 'saveAllClips' 
  | 'saveClip';

// Default webhook URLs
const DEFAULT_WEBHOOK_URLS: Record<WebhookType, string> = {
  findBestClips: 'http://127.0.0.1:5678/webhook-test/aff93e6a-399a-4719-bf6e-a7247db71f75',
  saveAllClips: 'http://127.0.0.1:5678/save-all-clips',
  saveClip: 'http://127.0.0.1:5678/save-clip'
};

// Local storage key
const WEBHOOK_URLS_STORAGE_KEY = 'vito-yt-webhook-urls';

// Get webhook URL for a specific type
export function getWebhookUrl(type: WebhookType): string {
  // Only run this on the client side
  if (typeof window === 'undefined') {
    return DEFAULT_WEBHOOK_URLS[type];
  }
  
  try {
    const storedUrls = localStorage.getItem(WEBHOOK_URLS_STORAGE_KEY);
    if (storedUrls) {
      const urls = JSON.parse(storedUrls) as Record<WebhookType, string>;
      return urls[type] || DEFAULT_WEBHOOK_URLS[type];
    }
  } catch (error) {
    console.error('Error retrieving webhook URL:', error);
  }
  
  return DEFAULT_WEBHOOK_URLS[type];
}

// Save webhook URL for a specific type
export function saveWebhookUrl(type: WebhookType, url: string): void {
  // Only run this on the client side
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    const storedUrls = localStorage.getItem(WEBHOOK_URLS_STORAGE_KEY);
    let urls: Record<WebhookType, string> = {...DEFAULT_WEBHOOK_URLS};
    
    if (storedUrls) {
      urls = {...urls, ...JSON.parse(storedUrls)};
    }
    
    urls[type] = url;
    localStorage.setItem(WEBHOOK_URLS_STORAGE_KEY, JSON.stringify(urls));
  } catch (error) {
    console.error('Error saving webhook URL:', error);
  }
}

// Reset webhook URLs to defaults
export function resetWebhookUrls(): void {
  // Only run this on the client side
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.removeItem(WEBHOOK_URLS_STORAGE_KEY);
  } catch (error) {
    console.error('Error resetting webhook URLs:', error);
  }
} 