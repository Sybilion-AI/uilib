import { isPresetScriptGraph, branchesFromPresetScriptGraph } from '../components/ui/Chat/ChatMessage/presetScript.js';

const PRESET_FREEFORM_DEFAULTS_BY_ID = {
    '4': {
        initial: 'q_company',
        p_rev: 'complete',
        p_mar: 'complete',
        p_risk: 'complete',
    },
    '5': { initial: 'q_goal' },
};
function mergePresetFreeformDefaults(presets) {
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

export { mergePresetFreeformDefaults };
