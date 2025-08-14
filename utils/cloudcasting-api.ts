export interface CloudLayerAPI {
  fetchLayer: (variable: string, timeStep: number) => Promise<Blob>;
  getAvailableVariables: () => CloudVariable[];
  getMaxTimeSteps: () => number;
}

export interface CloudVariable {
  value: string;
  label: string;
  description?: string;
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
  process.env.NEXT_PUBLIC_CLOUDCASTING_API_URL ||
  'http://51.20.136.254:8000/api/cloudcasting/layers';
const MAX_TIME_STEPS = 12; // 3 hours with 15-minute intervals

export class CloudCastingAPI implements CloudLayerAPI {
  async fetchLayer(variable: string, timeStep: number): Promise<Blob> {
    const url = `${API_BASE_URL}/${variable}/${timeStep}.tif`;
    console.log(`Fetching cloud layer from: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
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
