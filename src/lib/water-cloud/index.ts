import {ERRORS} from '@grnsft/if-core/utils';
import {PluginParams, ExecutePlugin} from '@grnsft/if-core/types';

import {ConfigParams, WUEEntry} from './types';

import * as CLOUD_WUE from './cloud-wue.json';

const {InputValidationError} = ERRORS;
const WUE_DEFAULT = 1.8;
const wueData: WUEEntry[] = CLOUD_WUE as WUEEntry[];

// // published as of 2023
// const awsWUE = 0.18;

// // global average 2022
// const azureWUE = 0.49;

// // estimated from totals by New Scientist 2023
// const gcpWUE = 1.1;

export const WaterCloud = (globalConfig: ConfigParams): ExecutePlugin => {
  const metadata = {
    kind: 'execute',
  };

  const validateInput = (input: PluginParams) => {
    const errors: string[] = [];
    const {energy, 'cloud/vendor': cloudVendor, wue} = input;

    if (typeof energy !== 'number') {
      errors.push('Energy must be numeric');
    }
    if (cloudVendor && typeof cloudVendor !== 'string') {
      errors.push('Cloud vendor must be a string');
    }
    if (wue && typeof wue !== 'number') {
      errors.push('Supplied WUE must be numeric');
    }

    if (errors.length > 0) {
      throw new InputValidationError(errors.join(', '));
    }

    return input;
  };

  const execute = async (inputs: PluginParams[]): Promise<PluginParams[]> => {
    return inputs.map(input => {
      globalConfig;
      const safeInput = validateInput(input);
      const energy = safeInput['energy'];
      const derivedWUE: number = safeInput['wue'] ?? wueCalculation(safeInput);
      const waterCloudConsumption = Math.round(energy * derivedWUE * 100) / 100;

      return {
        ...input,
        'water-cloud': waterCloudConsumption,
      };
    });
  };

  const wueCalculation = (input: PluginParams): number => {
    const cloudVendor = (input['cloud/vendor'] as string)?.toLowerCase();

    if (cloudVendor) return getWUE(cloudVendor, input['cloud/region']);
    else return WUE_DEFAULT;
  };

  // Function to get WUE by provider and optional region
  const getWUE = (provider: string, region?: string): number => {
    // First, try to find the provider-wide (default) WUE
    const providerDefault = wueData.find(
      entry =>
        entry.provider.toLowerCase() === provider.toLowerCase() &&
        entry.region === null
    );
    // Next, try to find the specific region if provided
    const result = wueData.find(
      entry =>
        entry.provider.toLowerCase() === provider.toLowerCase() &&
        region &&
        entry.region?.toLowerCase() === region.toLowerCase()
    );
    // Return the WUE value if found, otherwise return default WUE
    return result
      ? result.WUE
      : providerDefault
        ? providerDefault.WUE
        : WUE_DEFAULT;
  };

  return {
    metadata,
    execute,
  };
};
