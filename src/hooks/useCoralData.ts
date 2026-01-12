/**
 * Hook for loading and parsing coral data from Excel file
 */

import { useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useStore } from '../store/useStore';
import { parseCoralData } from '../utils/dataTransform';

export function useCoralData(dataPath: string = '/data/LTER_1_Back_Reef_Transects_1-2_2013-2024.xlsx') {
  const { setCorals, setLoading, setError } = useStore();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        // Fetch the Excel file
        const response = await fetch(dataPath);
        if (!response.ok) {
          throw new Error(`Failed to load data: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();

        // Parse with xlsx
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to array of arrays
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        // Skip header row
        const dataRows = rawData.slice(1);

        // Parse into coral objects
        const corals = parseCoralData(dataRows);

        console.log(`Loaded ${corals.length} coral records`);

        setCorals(corals);
        setLoading(false);
      } catch (err) {
        console.error('Error loading coral data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    }

    loadData();
  }, [dataPath, setCorals, setLoading, setError]);
}
