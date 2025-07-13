import fetch from 'node-fetch';

interface KakaoTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

interface KakaoMessageTemplate {
  object_type: string;
  text: string;
  link?: {
    web_url?: string;
    mobile_web_url?: string;
  };
  button_title?: string;
}

export class KakaoService {
  private clientId: string;
  private redirectUri: string;
  private accessToken?: string;
  private tokenStore: Map<string, { token: string, expires: number }> = new Map();

  constructor() {
    // Load from .env file directly
    this.clientId = process.env.KAKAO_CLIENT_ID || '251bca02a42e85a70d75ef4102482f5e';
    this.redirectUri = process.env.KAKAO_REDIRECT_URI || 'https://be1928a4-a753-4b03-b2cb-f9fb2c1d23ae-00-1r9mpk7wocbmv.worf.replit.dev/callback';
    
    console.log('Kakao Client ID configured:', this.clientId ? 'YES' : 'NO');
    console.log('Kakao Redirect URI configured:', this.redirectUri ? 'YES' : 'NO');
  }

  // Get authorization URL for user to login
  getAuthUrl(): string {
    if (!this.clientId) {
      throw new Error('KAKAO_CLIENT_ID is not configured');
    }
    if (!this.redirectUri) {
      throw new Error('KAKAO_REDIRECT_URI is not configured');
    }
    
    const authUrl = new URL('https://kauth.kakao.com/oauth/authorize');
    authUrl.searchParams.set('client_id', this.clientId);
    authUrl.searchParams.set('redirect_uri', this.redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    
    return authUrl.toString();
  }

  // Store token with expiration in database
  async storeToken(token: string, expiresIn: number = 21600): Promise<void> {
    const expires = Date.now() + (expiresIn * 1000); // 6 hours default
    this.tokenStore.set('main', { token, expires });
    this.accessToken = token;
    
    // Also store in database via settings
    try {
      const { storage } = await import('./storage');
      await storage.setSetting({
        key: 'kakao_token',
        value: JSON.stringify({ token, expires })
      });
      console.log('✅ Kakao token stored successfully');
    } catch (error) {
      console.error('Failed to store token in database:', error);
    }
  }

  // Get valid token from memory or database
  async getValidToken(): Promise<string | null> {
    // Check memory first
    const stored = this.tokenStore.get('main');
    if (stored && stored.expires > Date.now()) {
      return stored.token;
    }
    
    // Check database
    try {
      const { storage } = await import('./storage');
      const setting = await storage.getSetting('kakao_token');
      if (setting) {
        const tokenData = JSON.parse(setting.value);
        if (tokenData.expires > Date.now()) {
          // Restore to memory
          this.tokenStore.set('main', tokenData);
          this.accessToken = tokenData.token;
          return tokenData.token;
        }
      }
    } catch (error) {
      console.error('Failed to retrieve token from database:', error);
    }
    
    console.log('❌ No valid Kakao token available');
    return null;
  }

  // Exchange authorization code for access token
  async getAccessToken(code: string): Promise<string | null> {
    try {
      const response = await fetch('https://kauth.kakao.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: this.clientId,
          redirect_uri: this.redirectUri,
          code: code,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to get access token:', errorText);
        return null;
      }

      const data = await response.json() as KakaoTokenResponse;
      await this.storeToken(data.access_token, data.expires_in);
      return data.access_token;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  // Send message to user
  async sendMessage(message: string, accessToken?: string): Promise<boolean> {
    const token = accessToken || await this.getValidToken();
    if (!token) {
      console.error('No access token available for Kakao message');
      return false;
    }

    try {
      const template: KakaoMessageTemplate = {
        object_type: 'text',
        text: `🚨 ${message}`,
        link: {
          web_url: process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : 'https://exchange-monitor.replit.app',
          mobile_web_url: process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : 'https://exchange-monitor.replit.app',
        },
        button_title: '환율 확인하기'
      };

      const response = await fetch('https://kapi.kakao.com/v2/api/talk/memo/default/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          template_object: JSON.stringify(template),
        }),
      });

      if (!response.ok) {
        console.error('Failed to send Kakao message:', await response.text());
        return false;
      }

      console.log('Kakao message sent successfully');
      return true;
    } catch (error) {
      console.error('Error sending Kakao message:', error);
      return false;
    }
  }

  // Send alert notification
  async sendAlertNotification(currencyPair: string, targetRate: number, currentRate: number, alertType: string, timestamp?: string): Promise<boolean> {
    const direction = alertType === 'above' ? '상승' : '하락';
    const timeInfo = timestamp ? `\n⏰ ${timestamp}` : '';
    const message = `🚨 환율 알림\n\n${currencyPair} 환율이 목표값에 도달했습니다!\n\n목표: ${targetRate}\n현재: ${currentRate}\n상태: ${direction}${timeInfo}`;
    
    return await this.sendMessage(message);
  }
}

export const kakaoService = new KakaoService();