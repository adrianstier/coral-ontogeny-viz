/**
 * DataLoader - Loads coral ontogeny data from R-generated JSON files
 * Uses the public/data/ directory structure created by scripts/R/03_export_for_webapp.R
 */

interface SummaryData {
  dataset: {
    name: string;
    years: [number, number];
    n_colonies: number;
    n_observations: number;
    transects: string[];
    genera: string[];
  };
  population: Array<{
    year: number;
    live_colonies: number;
  }>;
  population_by_genus: Record<string, Array<{
    year: number;
    count: number;
  }>>;
  size_distribution: Record<string, {
    mean: number;
    median: number;
    sd: number;
    min: number;
    max: number;
  }>;
}

interface SpatialColony {
  coral_id: string;
  genus: string;
  transect: string;
  x: number;
  y: number;
  diameter: number;
  status: string;
  fate: string;
  alive: boolean;
}

interface DemographicEvents {
  recruitment: Record<number, Array<{
    coral_id: string;
    genus: string;
    transect: string;
    x: number;
    y: number;
  }>>;
  mortality: Record<number, Array<{
    coral_id: string;
    genus: string;
    transect: string;
    x: number;
    y: number;
  }>>;
}

interface SizeFrequency {
  [year: number]: Record<string, Array<{
    bin_min: number;
    bin_max: number;
    bin_mid: number;
    count: number;
  }>>;
}

interface ColorSchemes {
  genus: Record<string, string>;
  fate: Record<string, string>;
}

interface DataDictionary {
  variables: Record<string, string>;
  missing_codes: Record<string, string>;
  units: Record<string, string>;
}

class DataLoaderClass {
  private baseUrl = '/data';
  private cache: Map<string, any> = new Map();

  /**
   * Load summary statistics (population, size distributions)
   */
  async loadSummary(): Promise<SummaryData> {
    return this.loadJSON<SummaryData>('summary_statistics.json');
  }

  /**
   * Load spatial data for a specific year
   */
  async loadSpatial(year: number): Promise<SpatialColony[]> {
    return this.loadJSON<SpatialColony[]>(`spatial_${year}.json`);
  }

  /**
   * Load demographic events (recruitment, mortality)
   */
  async loadDemographicEvents(): Promise<DemographicEvents> {
    return this.loadJSON<DemographicEvents>('demographic_events.json');
  }

  /**
   * Load size-frequency distribution data
   */
  async loadSizeFrequency(): Promise<SizeFrequency> {
    return this.loadJSON<SizeFrequency>('size_frequency.json');
  }

  /**
   * Load color schemes (genus and fate colors from R)
   */
  async loadColorSchemes(): Promise<ColorSchemes> {
    return this.loadJSON<ColorSchemes>('color_schemes.json');
  }

  /**
   * Load data dictionary
   */
  async loadDataDictionary(): Promise<DataDictionary> {
    return this.loadJSON<DataDictionary>('data_dictionary.json');
  }

  /**
   * Load time series data (CSV)
   */
  async loadTimeSeries(): Promise<any[]> {
    const cacheKey = 'timeseries.csv';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`${this.baseUrl}/${cacheKey}`);
      if (!response.ok) {
        throw new Error(`Failed to load ${cacheKey}: ${response.statusText}`);
      }

      const text = await response.text();
      const data = this.parseCSV(text);

      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Error loading ${cacheKey}:`, error);
      throw error;
    }
  }

  /**
   * Load manifest file
   */
  async loadManifest(): Promise<any> {
    return this.loadJSON('manifest.json');
  }

  /**
   * Generic JSON loader with caching
   */
  private async loadJSON<T>(filename: string): Promise<T> {
    if (this.cache.has(filename)) {
      return this.cache.get(filename);
    }

    try {
      const response = await fetch(`${this.baseUrl}/${filename}`);
      if (!response.ok) {
        throw new Error(`Failed to load ${filename}: ${response.statusText}`);
      }

      const data = await response.json();
      this.cache.set(filename, data);
      return data;
    } catch (error) {
      console.error(`Error loading ${filename}:`, error);
      throw error;
    }
  }

  /**
   * Parse CSV text into array of objects
   */
  private parseCSV(text: string): any[] {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',');
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const row: any = {};

      headers.forEach((header, index) => {
        const value = values[index];
        // Try to parse as number
        const numValue = parseFloat(value);
        row[header.trim()] = isNaN(numValue) ? value.trim() : numValue;
      });

      data.push(row);
    }

    return data;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Preload data for multiple years
   */
  async preloadYears(years: number[]): Promise<void> {
    const promises = years.map(year => this.loadSpatial(year).catch(err => {
      console.warn(`Failed to preload year ${year}:`, err);
      return null;
    }));

    await Promise.all(promises);
  }

  /**
   * Get available years from manifest or summary
   */
  async getAvailableYears(): Promise<number[]> {
    try {
      const summary = await this.loadSummary();
      const [start, end] = summary.dataset.years;
      const years: number[] = [];

      for (let year = start; year <= end; year++) {
        years.push(year);
      }

      return years;
    } catch (error) {
      console.error('Failed to get available years:', error);
      // Fallback to default range
      return Array.from({ length: 12 }, (_, i) => 2013 + i);
    }
  }
}

// Export singleton instance
export const DataLoader = new DataLoaderClass();

// Export types
export type {
  SummaryData,
  SpatialColony,
  DemographicEvents,
  SizeFrequency,
  ColorSchemes,
  DataDictionary
};
