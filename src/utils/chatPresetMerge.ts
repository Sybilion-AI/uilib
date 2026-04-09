import type { ChatPreset } from '@/components/ui/Chat/Chat.types';
import {
  branchesFromPresetScriptGraph,
  isPresetScriptGraph,
} from '@/components/ui/Chat/ChatMessage/presetScript';

const PRESET_FREEFORM_DEFAULTS_BY_ID: Record<string, Record<string, string>> = {
  '4': {
    initial: 'q_company',
    p_rev: 'complete',
    p_mar: 'complete',
    p_risk: 'complete',
  },
  '5': { initial: 'q_goal' },
};

export function mergePresetFreeformDefaults(presets: ChatPreset[]): ChatPreset[] {
  return presets.map(p => {
    const fromId = PRESET_FREEFORM_DEFAULTS_BY_ID[p.id];
    let merged = { ...(fromId ?? {}), ...(p.freeformNext ?? {}) };

    if (Object.keys(merged).length === 0) {
      const script = p.script;
      if (isPresetScriptGraph(script)) {
        const branchKeys = Object.keys(branchesFromPresetScriptGraph(script));
        if (branchKeys.length === 1) {
          merged = { initial: branchKeys[0] };
        }
      }
    }

    return Object.keys(merged).length > 0 ? { ...p, freeformNext: merged } : p;
  });
}
