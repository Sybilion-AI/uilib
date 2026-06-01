import type { ChatPreset } from '#uilib/components/ui/Chat/Chat.types';

/** Sample dataset name — mirrors app dataset page chat presets. */
export const DOCS_SAMPLE_DATASET_NAME = 'HDPE Spot Price';

export function getDocsDatasetPresets(
  datasetName: string = DOCS_SAMPLE_DATASET_NAME,
): ChatPreset[] {
  return [
    {
      id: '1',
      text: `What should my planning decisions be based on the "${datasetName}" forecasts?`,
    },
    {
      id: '2',
      text: `Explain the "${datasetName}" forecast.`,
    },
    {
      id: '3',
      text: `What is the "${datasetName}" forecast performance?`,
    },
  ];
}

export const DOCS_DATASET_PRESETS = getDocsDatasetPresets();
