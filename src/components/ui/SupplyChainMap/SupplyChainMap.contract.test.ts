import { readFileSync } from 'node:fs';
import path from 'node:path';

const dir = path.join(process.cwd(), 'src/components/ui/SupplyChainMap');
const map = readFileSync(path.join(dir, 'SupplyChainMap.tsx'), 'utf8');
const draw = readFileSync(path.join(dir, 'supply-chain-map-draw.ts'), 'utf8');
const worker = readFileSync(
  path.join(dir, 'SupplyChainMap.render.worker.ts'),
  'utf8',
);
const styl = readFileSync(path.join(dir, 'SupplyChainMap.styl'), 'utf8');

describe('SupplyChainMap contract', () => {
  it('stays a self-contained map (no onboarding / globe / graph)', () => {
    expect(map).toMatch(/buildConfirmedMapScene/);
    expect(map).toMatch(/discloseMapScene/);
    expect(map).toMatch(/clusterMapNodes/);
    expect(map).toMatch(/useMapBaseRenderer/);
    expect(map).toMatch(/role="application"/);
    expect(map).not.toMatch(/from ['"]@\/lib\/onboarding['"]/);
    expect(map).not.toMatch(/from ['"]@\/lib\/globe-/);
    expect(map).not.toMatch(/from ['"]@\/components\/globe-/);
    expect(map).not.toMatch(/from ['"]@\/components\/graph-/);
  });

  it('paints world-atlas land in a worker-safe module', () => {
    expect(draw).toMatch(/world-atlas\/countries-110m\.json/);
    expect(draw).toMatch(/paintSupplyChainMap/);
    expect(worker).toMatch(/OffscreenCanvas/);
    expect(worker).toMatch(/paintSupplyChainMap/);
  });

  it('ships map chrome styles with the component', () => {
    expect(styl).toMatch(/^\.root/m);
    expect(styl).toMatch(/^\.canvas/m);
    expect(styl).toMatch(/^\.baseCanvas/m);
    expect(styl).toMatch(/^\.overlay/m);
    expect(styl).toMatch(/^\.marker/m);
    expect(styl).toMatch(/^\.node/m);
    expect(styl).toMatch(/^\.label/m);
    expect(styl).toMatch(/\.marker:hover \.node/);
    expect(styl).toMatch(/\.marker:hover \.label/);
  });
});
