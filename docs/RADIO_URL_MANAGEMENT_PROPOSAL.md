# Smart Radio URL Management System - Proposal

## Current Situation Analysis

### What We Have
- **850+ radio stations** in `allRadioStations.js`
- **Test results CSV** showing working/broken stations
- **Fallback stations** system (`fallbackStations.js`)
- **Failed stations** list (`failedStations.js`)
- **Manual URL testing** button in Developer Dashboard

### Problems Identified
1. **Hardcoded URLs** - Stations change URLs without notice
2. **No auto-recovery** - When a URL breaks, it stays broken
3. **Manual maintenance** - Someone has to manually update URLs
4. **No URL validation** - Can't predict when a station will break
5. **Duplicate work** - Same station with multiple URLs scattered
6. **No fallback priority** - If primary URL fails, no automatic secondary attempt

---

## Smart URL Management System Design

### Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│          Radio Station Database                     │
│  (stations with multiple URL candidates)            │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│         Station URL Health Monitor                  │
│  - Periodic health checks (every 24h)               │
│  - User-triggered testing                           │
│  - Real-time failure detection                      │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│        Smart URL Selection Algorithm                │
│  - Chooses best working URL                         │
│  - Auto-fallback on failure                         │
│  - Learns from user reports                         │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│         Auto-Update System (Optional)               │
│  - Searches for new URLs when station breaks        │
│  - Suggests URL updates to admin                    │
└─────────────────────────────────────────────────────┘
```

### Core Components

#### 1. Enhanced Station Data Model

**Current:**
```javascript
{
  name: "Radio 538",
  url: "https://...single-url...",
  category: "commercial"
}
```

**Proposed:**
```javascript
{
  name: "Radio 538",
  urls: [
    {
      url: "https://playerservices.streamtheworld.com/...",
      priority: 1,
      lastTested: "2025-12-30T10:00:00Z",
      status: "working",  // 'working' | 'broken' | 'unknown'
      responseTime: 936,
      successRate: 0.98,  // 98% success over last 100 attempts
      addedDate: "2025-01-01",
      source: "official"  // 'official' | 'discovered' | 'user-submitted'
    },
    {
      url: "https://backup-url.com/...",
      priority: 2,
      lastTested: "2025-12-30T10:00:00Z",
      status: "working",
      responseTime: 1200,
      successRate: 0.95,
      addedDate: "2025-06-01",
      source: "discovered"
    }
  ],
  category: "commercial",
  officialWebsite: "https://radio538.nl",  // For auto-discovery
  streamFormat: "mp3",  // 'mp3' | 'aac' | 'hls'
  tags: ["pop", "hits", "commercial"]
}
```

#### 2. URL Health Monitor

**File:** `src/services/RadioHealthMonitor.js`

**Responsibilities:**
- Test all station URLs periodically
- Update status/response times
- Generate health reports
- Alert on critical failures

**Features:**
- **Background testing** - Doesn't block UI
- **Smart scheduling** - Tests failed stations more frequently
- **Batch testing** - Tests multiple URLs in parallel
- **Results caching** - Stores test results in localStorage
- **Export functionality** - Can export CSV like you have now

**Code Structure:**
```javascript
class RadioHealthMonitor {
  async testStation(station) {
    const results = [];
    for (const urlData of station.urls) {
      const result = await this.testUrl(urlData.url);
      results.push({ ...urlData, ...result });
    }
    return this.selectBestUrl(results);
  }

  async testUrl(url) {
    const startTime = Date.now();
    try {
      const audio = new Audio(url);
      await this.waitForLoad(audio, 5000);  // 5s timeout
      return {
        status: 'working',
        responseTime: Date.now() - startTime,
        error: null
      };
    } catch (error) {
      return {
        status: 'broken',
        responseTime: null,
        error: error.message
      };
    }
  }

  selectBestUrl(results) {
    // Priority: status (working) > response time > success rate
    const working = results.filter(r => r.status === 'working');
    if (working.length === 0) return null;

    return working.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return a.responseTime - b.responseTime;
    })[0];
  }
}
```

#### 3. Smart URL Selector

**File:** `src/services/SmartURLSelector.js`

**Features:**
- Always returns best working URL
- Auto-fallback when primary fails
- Learns from real-time failures
- Updates health data on every playback attempt

**Code:**
```javascript
class SmartURLSelector {
  getUrl(station) {
    // Get cached health data
    const healthData = this.getHealthData(station.name);

    // Filter to working URLs only
    const workingUrls = station.urls
      .filter(u => {
        const health = healthData[u.url];
        return !health || health.status !== 'broken';
      })
      .sort((a, b) => {
        // Sort by priority first, then success rate
        if (a.priority !== b.priority) return a.priority - b.priority;

        const healthA = healthData[a.url] || {};
        const healthB = healthData[b.url] || {};
        return (healthB.successRate || 0) - (healthA.successRate || 0);
      });

    return workingUrls[0]?.url || station.urls[0]?.url;  // Fallback to first URL
  }

  reportFailure(station, url) {
    // Mark URL as failed
    // Update health data
    // Trigger re-test
  }

  reportSuccess(station, url) {
    // Update success metrics
  }
}
```

#### 4. Auto-Discovery System (Advanced, Optional)

**Concept:** Automatically find new URLs when stations break

**Methods:**
1. **Radio-Browser API** - Query online radio directory
2. **Official website scraping** - Find stream URLs from station's website (complex, legal concerns)
3. **Community submissions** - Users can submit new URLs
4. **URL pattern matching** - Try common patterns (stream01.example.com, stream02.example.com)

**Implementation (Simple Version):**
```javascript
class URLDiscovery {
  async findAlternativeUrls(station) {
    const candidates = [];

    // Method 1: Query Radio-Browser API
    const radioBrowserResults = await fetch(
      `https://de1.api.radio-browser.info/json/stations/byname/${encodeURIComponent(station.name)}`
    ).then(r => r.json());

    radioBrowserResults.forEach(result => {
      if (result.url_resolved) {
        candidates.push({
          url: result.url_resolved,
          source: 'radio-browser',
          confidence: this.calculateConfidence(station, result)
        });
      }
    });

    // Method 2: Try URL variations
    const existingUrl = station.urls[0]?.url;
    if (existingUrl) {
      const variations = this.generateUrlVariations(existingUrl);
      variations.forEach(url => {
        candidates.push({
          url,
          source: 'variation',
          confidence: 0.3
        });
      });
    }

    // Test all candidates
    const tested = await Promise.all(
      candidates.map(async c => ({
        ...c,
        working: await this.testUrl(c.url)
      }))
    );

    return tested
      .filter(c => c.working)
      .sort((a, b) => b.confidence - a.confidence);
  }

  generateUrlVariations(url) {
    // Examples:
    // http://stream.example.com/radio -> https://stream.example.com/radio
    // http://stream1.example.com -> http://stream2.example.com
    // /radio.mp3 -> /radio.aac, /radio_high.mp3, etc.
  }
}
```

---

## Implementation Strategy

### Phase 1: Data Migration (1-2 hours)
1. Update `allRadioStations.js` structure to support multiple URLs
2. Migrate existing fallback data into new format
3. Add CSV test results as historical health data

### Phase 2: Health Monitor (2-3 hours)
1. Create `RadioHealthMonitor.js`
2. Add "Test All Stations" button to Developer Dashboard
3. Store test results in localStorage
4. Export functionality to CSV

### Phase 3: Smart Selection (1 hour)
1. Create `SmartURLSelector.js`
2. Integrate with `RadioService.js`
3. Add automatic fallback on playback failure
4. Track success/failure metrics

### Phase 4: Auto-Discovery (Optional, 3-4 hours)
1. Implement Radio-Browser API integration
2. Add URL variation generator
3. Create "Find Alternative URLs" button in Developer Dashboard
4. Manual approval workflow for discovered URLs

### Phase 5: Maintenance (Ongoing)
1. Schedule periodic health checks (daily/weekly)
2. Admin dashboard for reviewing broken stations
3. User submission system for new URLs
4. Automatic cleanup of consistently failing URLs

---

## Benefits

### Immediate
- ✅ Automatic fallback when primary URL fails
- ✅ Health tracking of all URLs
- ✅ Easy testing via Developer Dashboard
- ✅ CSV export for analysis

### Long-term
- ✅ Self-healing station list
- ✅ Reduced manual maintenance
- ✅ Better user experience (fewer broken stations)
- ✅ Data-driven URL management
- ✅ Community-driven improvements

---

## Limitations & Considerations

### What This CAN'T Do
1. **Can't predict station shutdowns** - If a station goes offline permanently, no tech can fix it
2. **Can't access paywalled streams** - Some stations require authentication
3. **Can't bypass geo-restrictions** - Region-locked stations will still be blocked
4. **Can't guarantee 100% uptime** - Stations change URLs, servers go down

### What You Still Need Manually
1. **Adding new stations** - Discovery can help, but manual curation is best
2. **Removing dead stations** - Permanently offline stations should be manually removed
3. **Verifying quality** - Auto-discovered URLs might be lower quality
4. **Legal compliance** - Ensure you have rights to stream

### Technical Challenges
1. **CORS issues** - Some URLs can't be tested from browser (need server-side testing)
2. **False positives** - URL might test OK but not actually stream audio
3. **Rate limiting** - Testing 850 URLs might trigger rate limits
4. **Storage** - Health data for 850 stations × multiple URLs = significant localStorage usage

---

## Recommendation

### Start Simple (Phase 1-3)
1. **Multi-URL support** - Allow each station to have 2-3 URLs
2. **Manual testing** - Use your existing test button
3. **Automatic fallback** - If URL fails during playback, try next URL
4. **Health tracking** - Store which URLs work/fail

**Benefits:**
- Low complexity
- Immediate improvement
- No external dependencies
- Full control

### Later: Add Auto-Discovery (Phase 4)
- Only when you need it
- Helps find replacement URLs
- Still requires manual approval

**This approach is:**
- ✅ Practical
- ✅ Maintainable
- ✅ Effective
- ✅ Doesn't over-engineer

---

## Next Steps

1. **Review this proposal** - Does this approach work for you?
2. **Prioritize features** - Which phases do you want?
3. **Start with data migration** - I can help restructure your station data
4. **Build incrementally** - Add features as needed

Want me to start implementing Phase 1-3?
