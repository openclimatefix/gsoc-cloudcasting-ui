export interface CloudLayerAPI {
  fetchLayer: (variable: string, timeStep: number) => Promise<Blob>;
  getAvailableVariables: () => CloudVariable[];
  getMaxTimeSteps: () => number;
  fetchDataInfo: () => Promise<DataInfo>;
}

export interface CloudVariable {
  value: string;
  label: string;
  description?: string;
}

export interface DataInfo {
  file_exists: boolean;
  init_time: string | null;
  forecast_steps: number[];
  variables: string[];
  file_size_mb: number;
  last_modified: string | null;
  time_range: string | null;
  error: string | null;
}

export const CLOUD_VARIABLES: CloudVariable[] = [
  { value: 'IR_016', label: 'IR 0.16 μm', description: 'Infrared channel for cloud detection' },
  { value: 'IR_039', label: 'IR 0.39 μm', description: 'Infrared channel for cloud properties' },
  { value: 'IR_087', label: 'IR 0.87 μm', description: 'Near-infrared for cloud phase' },
  { value: 'IR_108', label: 'IR 10.8 μm', description: 'Thermal infrared for cloud temperature' },
  {
    value: 'IR_120',
    label: 'IR 12.0 μm',
    description: 'Thermal infrared for atmospheric water vapor',
  },
  { value: 'IR_134', label: 'IR 13.4 μm', description: 'Thermal infrared for CO2 absorption' },
  { value: 'VIS006', label: 'VIS 0.06 μm', description: 'Visible light for cloud reflectance' },
  { value: 'VIS008', label: 'VIS 0.08 μm', description: 'Visible light for surface features' },
  { value: 'WV_062', label: 'WV 6.2 μm', description: 'Water vapor channel - upper troposphere' },
  { value: 'WV_073', label: 'WV 7.3 μm', description: 'Water vapor channel - mid troposphere' },
];

const API_BASE_URL =
  process.env.NEXT_PUBLIC_CLOUDCASTING_API_URL || 'http://0.0.0.0:8000/api/cloudcasting/layers';
const API_DATA_INFO_URL =
  (process.env.NEXT_PUBLIC_CLOUDCASTING_API_URL
    ? process.env.NEXT_PUBLIC_CLOUDCASTING_API_URL.replace('/layers', '')
    : 'http://0.0.0.0:8000/api/cloudcasting') + '/data-info';
const MAX_TIME_STEPS = 12; // 3 hours with 15-minute intervals

export class CloudCastingAPI implements CloudLayerAPI {
  private async getAuthHeaders(): Promise<HeadersInit> {
    try {
      // Using dynamic import to prevent SSR issues
      const { authService } = await import('./auth-service');
      const token = await authService.getAccessToken();

      return {
        Authorization: `Bearer ${token}`,
      };
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return {};
    }
  }

  async fetchLayer(variable: string, timeStep: number): Promise<Blob> {
    const url = `${API_BASE_URL}/${variable}/${timeStep}.tif`;
    console.log(`Fetching cloud layer from: ${url}`);

    const headers = await this.getAuthHeaders();

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch cloud layer: ${response.status} ${response.statusText}`);
    }

    return response.blob();
  }

  getAvailableVariables(): CloudVariable[] {
    return CLOUD_VARIABLES;
  }

  getMaxTimeSteps(): number {
    return MAX_TIME_STEPS;
  }

  async fetchDataInfo(): Promise<DataInfo> {
    console.log(`Fetching data info from: ${API_DATA_INFO_URL}`);

    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(API_DATA_INFO_URL, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        console.error(`API Error: ${response.status} ${response.statusText}`);
        return {
          file_exists: false,
          init_time: null,
          forecast_steps: [],
          variables: [],
          file_size_mb: 0,
          last_modified: null,
          time_range: null,
          error: `API Error: ${response.status} ${response.statusText}`,
        };
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching data info:', error);
      return {
        file_exists: false,
        init_time: null,
        forecast_steps: [],
        variables: [],
        file_size_mb: 0,
        last_modified: null,
        time_range: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const cloudcastingAPI = new CloudCastingAPI();

export function formatTimeStep(step: number): string {
  const minutes = step * 15;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `+${remainingMinutes}min`;
  } else if (remainingMinutes === 0) {
    return `+${hours}h`;
  } else {
    return `+${hours}h ${remainingMinutes}m`;
  }
}

export function createLayerId(variable: string, timeStep: number): string {
  return `cloud-layer-${variable}-${timeStep}`;
}
