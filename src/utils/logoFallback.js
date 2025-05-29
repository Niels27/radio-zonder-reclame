// utils/logoFallback.js
// filepath: c:\Users\niels\Documents\Visual Studio Code\no ads radio project\src\utils\logoFallback.js
export class LogoFallback {
  static async findWorkingLogo(radioStation) {
    const { name, url } = radioStation;
    const domain = this.extractDomain(url);
    
    // Priority order for logo sources
    const logoSources = [
      // Original logo if provided
      radioStation.logo,
      radioStation.favicon,
      
      // Favicon from the radio's domain
      domain ? `https://${domain}/favicon.ico` : null,
      domain ? `http://${domain}/favicon.ico` : null,
      
      // Common logo paths
      domain ? `https://${domain}/logo.png` : null,
      domain ? `https://${domain}/images/logo.png` : null,
      domain ? `https://${domain}/assets/logo.png` : null,
      
      // Google Favicon service
      domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : null,
      
      // DuckDuckGo icon service  
      domain ? `https://icons.duckduckgo.com/ip3/${domain}.ico` : null,
    ];

    for (const logoUrl of logoSources) {
      if (!logoUrl) continue;
      
      try {
        const isValid = await this.validateImageUrl(logoUrl);
        if (isValid) {
          return logoUrl;
        }
      } catch (error) {
        console.log(`Logo source failed: ${logoUrl}`, error);
        continue;
      }
    }

    // Final fallback - generate a text-based logo
    return this.generateTextLogo(name);
  }

  static extractDomain(url) {
    if (!url) return null;
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      // If URL parsing fails, try to extract domain manually
      const match = url.match(/(?:https?:\/\/)?([\w.-]+)/);
      return match ? match[1] : null;
    }
  }

  static async validateImageUrl(url) {
    return new Promise((resolve) => {
      const img = new Image();
      const timeout = setTimeout(() => {
        resolve(false);
      }, 3000); // Reduced timeout

      img.onload = () => {
        clearTimeout(timeout);
        // Check if image is actually valid (not a broken image placeholder)
        resolve(img.width > 8 && img.height > 8);
      };

      img.onerror = () => {
        clearTimeout(timeout);
        resolve(false);
      };

      img.src = url;
    });
  }

  static generateTextLogo(name) {
    if (typeof document === 'undefined') {
      // Server-side fallback
      return `data:image/svg+xml;base64,${btoa(`
        <svg width="128" height="128" xmlns="http://www.w3.org/2000/svg">
          <rect width="128" height="128" fill="#3b82f6"/>
          <text x="64" y="64" text-anchor="middle" dy="0.35em" fill="white" font-size="32" font-family="Arial">
            ${this.getLogoText(name)}
          </text>
        </svg>
      `)}`;
    }

    // Client-side canvas generation
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 128;
    canvas.height = 128;
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 128, 128);
    gradient.addColorStop(0, '#3b82f6');
    gradient.addColorStop(1, '#1e40af');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    
    // Text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 32px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Get initials or first few characters
    const text = this.getLogoText(name);
    ctx.fillText(text, 64, 64);
    
    return canvas.toDataURL();
  }

  static getLogoText(name) {
    if (!name) return '?';
    
    const words = name.split(' ').filter(word => word.length > 0);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    } else if (name.length >= 2) {
      return name.substring(0, 2).toUpperCase();
    } else {
      return name[0].toUpperCase();
    }
  }
}