// Simple station override system that directly modifies allDutchStations.js
// This replaces the complex localStorage-based override system

import fs from 'fs';
import path from 'path';

class StationOverrides {
  constructor() {
    this.stationsFilePath = path.join(process.cwd(), 'src', 'utils', 'allDutchStations.js');
  }

  // Read the current allDutchStations.js file
  async readStationsFile() {
    try {
      const content = await fs.promises.readFile(this.stationsFilePath, 'utf-8');
      return content;
    } catch (error) {
      throw new Error(`Failed to read stations file: ${error.message}`);
    }
  }

  // Write the updated content back to allDutchStations.js
  async writeStationsFile(content) {
    try {
      await fs.promises.writeFile(this.stationsFilePath, content, 'utf-8');
      console.log('✅ Successfully updated allDutchStations.js');
    } catch (error) {
      throw new Error(`Failed to write stations file: ${error.message}`);
    }
  }

  // Update a station's URL directly in the file
  async updateStationUrl(stationName, newUrl, newLogo = null) {
    try {
      const content = await this.readStationsFile();
      
      // Find the station in the file and update its URL
      const lines = content.split('\n');
      let stationFound = false;
      let inStationObject = false;
      let braceCount = 0;
      let updatedLines = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Check if this line contains the station name
        if (line.includes(`name: '${stationName}'`) || line.includes(`name: "${stationName}"`)) {
          stationFound = true;
          inStationObject = true;
          braceCount = (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
          updatedLines.push(line);
          continue;
        }

        if (inStationObject) {
          // Count braces to know when we're out of the station object
          braceCount += (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
          
          // Update URL line
          if (line.includes('url:') && !line.includes('//')) {
            const indentation = line.match(/^\s*/)[0];
            updatedLines.push(`${indentation}url: '${newUrl}',`);
            continue;
          }
          
          // Update logo line if provided
          if (newLogo && line.includes('logo:')) {
            const indentation = line.match(/^\s*/)[0];
            updatedLines.push(`${indentation}logo: '${newLogo}',`);
            continue;
          }
          
          // Check if we're done with this station object
          if (braceCount <= 0 && line.includes('}')) {
            inStationObject = false;
          }
        }
        
        updatedLines.push(line);
      }

      if (!stationFound) {
        throw new Error(`Station "${stationName}" not found in allDutchStations.js`);
      }

      // Write the updated content
      await this.writeStationsFile(updatedLines.join('\n'));
      
      return {
        success: true,
        message: `Successfully updated ${stationName}`,
        stationName,
        newUrl,
        newLogo
      };
      
    } catch (error) {
      console.error('❌ Failed to update station:', error);
      throw error;
    }
  }

  // Get a list of all stations that could be updated
  async getAvailableStations() {
    try {
      const content = await this.readStationsFile();
      const stations = [];
      
      // Extract station names from the file
      const nameMatches = content.match(/name: ['"`]([^'"`]+)['"`]/g);
      if (nameMatches) {
        nameMatches.forEach(match => {
          const name = match.match(/name: ['"`]([^'"`]+)['"`]/)[1];
          stations.push(name);
        });
      }
      
      return [...new Set(stations)]; // Remove duplicates
    } catch (error) {
      console.error('❌ Failed to get available stations:', error);
      return [];
    }
  }

  // Create a backup of the current allDutchStations.js
  async createBackup() {
    try {
      const content = await this.readStationsFile();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(
        path.dirname(this.stationsFilePath), 
        `allDutchStations.backup.${timestamp}.js`
      );
      
      await fs.promises.writeFile(backupPath, content, 'utf-8');
      console.log(`📁 Backup created: ${backupPath}`);
      return backupPath;
    } catch (error) {
      console.error('❌ Failed to create backup:', error);
      throw error;
    }
  }
}

// For browser environment, create a simplified version that works with the existing data
export class BrowserStationOverrides {
  constructor() {
    this.storageKey = 'station_url_overrides';
    this.pendingChanges = this.loadPendingChanges();
  }

  loadPendingChanges() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to load pending changes:', error);
      return {};
    }
  }

  savePendingChanges() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.pendingChanges));
    } catch (error) {
      console.error('Failed to save pending changes:', error);
    }
  }

  // Queue a station URL change (to be applied to the file later)
  queueUrlChange(stationName, newUrl, newLogo = null) {
    this.pendingChanges[stationName] = {
      url: newUrl,
      logo: newLogo,
      timestamp: new Date().toISOString(),
      applied: false
    };
    
    this.savePendingChanges();
    
    console.log(`📝 Queued URL change for ${stationName}: ${newUrl}`);
    return {
      success: true,
      message: `URL change queued for ${stationName}. Changes will be applied to allDutchStations.js when you export/apply them.`,
      stationName,
      newUrl,
      newLogo
    };
  }

  // Get all pending changes
  getPendingChanges() {
    return this.pendingChanges;
  }

  // Apply pending changes to a station object (for immediate use)
  applyToStation(station) {
    const override = this.pendingChanges[station.name];
    if (override) {
      return {
        ...station,
        url: override.url,
        logo: override.logo || station.logo,
        isOverridden: true,
        originalUrl: station.url
      };
    }
    return station;
  }

  // Clear a pending change
  clearPendingChange(stationName) {
    delete this.pendingChanges[stationName];
    this.savePendingChanges();
  }

  // Export pending changes as instructions for manual application
  exportChanges() {
    const changes = Object.entries(this.pendingChanges).map(([stationName, change]) => ({
      stationName,
      newUrl: change.url,
      newLogo: change.logo,
      timestamp: change.timestamp
    }));

    const blob = new Blob([JSON.stringify(changes, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `station-url-changes-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    return changes;
  }

  // Clear all pending changes
  clearAllChanges() {
    this.pendingChanges = {};
    this.savePendingChanges();
  }
}

// Export the browser version for use in the app
export const browserStationOverrides = new BrowserStationOverrides();

// Export Node.js version for server-side use
export { StationOverrides };
