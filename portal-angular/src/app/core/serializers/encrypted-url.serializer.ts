import { DefaultUrlSerializer, UrlTree } from '@angular/router';

export class EncryptedUrlSerializer extends DefaultUrlSerializer {
  private static readonly PREFIX = '/enc/';

  // Simple Base64 + custom XOR obfuscation to prevent easy base64 decoding
  private encrypt(value: string): string {
    if (!value) return '';
    
    // XOR obfuscation key
    const key = 42; 
    let obfuscated = '';
    for (let i = 0; i < value.length; i++) {
      obfuscated += String.fromCharCode(value.charCodeAt(i) ^ key);
    }
    
    // Convert to URL-safe Base64
    try {
      return btoa(unescape(encodeURIComponent(obfuscated)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    } catch (e) {
      return '';
    }
  }

  private decrypt(value: string): string {
    if (!value) return '';
    
    // Restore base64 padding and URL characters
    let base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    
    try {
      const decoded = decodeURIComponent(escape(atob(base64)));
      const key = 42;
      let original = '';
      for (let i = 0; i < decoded.length; i++) {
        original += String.fromCharCode(decoded.charCodeAt(i) ^ key);
      }
      return original;
    } catch (e) {
      return '/login'; // Fallback in case of invalid or tampered hash
    }
  }

  override parse(url: string): UrlTree {
    const isEncrypted = url.startsWith(EncryptedUrlSerializer.PREFIX) || url.startsWith('enc/');
    
    if (isEncrypted) {
      const hash = url.startsWith('/') 
        ? url.substring(EncryptedUrlSerializer.PREFIX.length) 
        : url.substring('enc/'.length);
      
      const decryptedUrl = this.decrypt(hash);
      return super.parse(decryptedUrl);
    }
    
    return super.parse(url);
  }

  override serialize(tree: UrlTree): string {
    const normalUrl = super.serialize(tree);
    
    // Don't encrypt root, login, or callback paths
    if (
      normalUrl === '/' || 
      normalUrl === '/login' || 
      normalUrl.startsWith('/login') || 
      normalUrl.startsWith('/auth/callback') || 
      normalUrl === ''
    ) {
      return normalUrl;
    }

    const encryptedPath = this.encrypt(normalUrl);
    return `${EncryptedUrlSerializer.PREFIX}${encryptedPath}`;
  }
}
