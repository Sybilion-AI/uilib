'use client';

import cn from 'classnames';
import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import S from './SupplyChainMap.styl';
import type { SupplyChainMapProps } from './SupplyChainMap.types';
import { MAP_COLORS } from './map-colors';
import {
  discloseMapScene,
  resolveMapDisclosureAnchors,
} from './map-disclosure';
import { placeMapLabels } from './map-labels';
import {
  HOME_CAMERA,
  MIN_ZOOM,
  type MapCamera,
  ZOOM_STEP,
  cameraCenteredOn,
  cameraFitPoints,
  clampCamera,
  mapProjection,
  panCamera,
  projectPoint,
  syntheticAltitude,
  zoomCamera,
} from './map-projection';
import {
  CLUSTER_RADIUS_PX,
  clusterMapNodes,
  forceOpenExpired,
  remapArcsToClusters,
} from './supply-chain-map-clusters';
import type { MapDrawArc, MapDrawCommand } from './supply-chain-map-draw';
import {
  type MapSceneArc,
  type MapSceneNode,
  buildConfirmedMapScene,
  resolveMapSelection,
} from './supply-chain-map-scene';
import { activeMapCascade } from './supply-chain-map-types';
import { useMapBaseRenderer } from './use-map-base-renderer';

type SceneArc = MapSceneArc & {
  fromId: string;
  toId: string;
  onSpine?: boolean;
};

const DRAG_THRESHOLD_PX = 4;
const LANE_HIT_PX = 7;
const FLY_MS = 700;

function labelTier(altitude: number): 'far' | 'mid' | 'near' {
  if (altitude > 1.6) return 'far';
  if (altitude > 0.9) return 'mid';
  return 'near';
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function segmentDistance(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  const t =
    lenSq === 0
      ? 0
      : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function inspectionLocation(node: MapSceneNode): string | null {
  return (
    [node.place, node.country, node.precision].filter(Boolean).join(' · ') ||
    null
  );
}

function orgNodeId(
  entities: SupplyChainMapProps['entities'],
): string | undefined {
  return entities.find(
    entity => entity.type === 'company' && entity.status === 'confirmed',
  )?.id;
}

export function SupplyChainMap({
  entities,
  edges,
  onEdgeSelect,
  onNodeClick,
  cascade,
  fill,
  className,
}: SupplyChainMapProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [camera, setCamera] = useState<MapCamera | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<MapSceneNode | null>(null);
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const forceOpenKRef = useRef<number | null>(null);

  const scene = useMemo(
    () => buildConfirmedMapScene(entities, edges),
    [entities, edges],
  );
  const liveCascade = useMemo(() => activeMapCascade(cascade), [cascade]);
  const orgId = useMemo(() => orgNodeId(entities), [entities]);

  const sceneNodes = useMemo(
    () =>
      scene.nodes.map(node => ({
        ...node,
        impacted: liveCascade?.onPathIds.has(node.id) ?? false,
      })),
    [scene.nodes, liveCascade],
  );
  const sceneArcs = useMemo<SceneArc[]>(
    () =>
      scene.arcs.map(arc => ({
        ...arc,
        fromId: arc.fromEntity,
        toId: arc.toEntity,
        onSpine: liveCascade?.pathIds.includes(arc.fromEntity) ?? false,
      })),
    [scene.arcs, liveCascade],
  );

  const byId = useMemo(
    () => new Map(sceneNodes.map(node => [node.id, node])),
    [sceneNodes],
  );
  const inspected = resolveMapSelection(selected, sceneNodes);
  const disclosureAnchors = useMemo(
    () =>
      resolveMapDisclosureAnchors(byId, {
        selectedId: inspected?.id ?? null,
      }),
    [byId, inspected],
  );

  const altitude = syntheticAltitude(camera?.k ?? 1);
  const tier = labelTier(altitude);
  const disclosedScene = useMemo(
    () =>
      discloseMapScene(sceneNodes, sceneArcs, {
        tier,
        orgId,
        ...disclosureAnchors,
        expanded: showAll,
      }),
    [sceneNodes, sceneArcs, tier, orgId, disclosureAnchors, showAll],
  );

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const apply = (w: number, h: number) => {
      if (w > 0 && h > 0) setSize({ w: Math.round(w), h: Math.round(h) });
    };
    apply(el.clientWidth, el.clientHeight);
    const ro = new ResizeObserver(entries => {
      const r = entries[0]?.contentRect;
      if (r) apply(r.width, r.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [scene.nodes.length > 0]);

  useEffect(() => {
    if (size.w === 0 || size.h === 0) return;
    setCamera(cam => (cam ? clampCamera(cam, size.w, size.h) : cam));
  }, [size.w, size.h]);

  useEffect(() => {
    if (selected && !inspected) setSelected(null);
  }, [selected, inspected]);

  useEffect(() => {
    const openedAt = forceOpenKRef.current;
    const k = camera?.k;
    if (openedAt == null || k == null || expandedIds.size === 0) return;
    if (!forceOpenExpired(openedAt, k)) return;
    forceOpenKRef.current = null;
    setExpandedIds(new Set());
  }, [camera?.k, expandedIds.size]);

  const cameraRef = useRef<MapCamera | null>(null);
  cameraRef.current = camera;
  const flyRaf = useRef(0);
  const stopFlying = useCallback(() => {
    if (flyRaf.current) cancelAnimationFrame(flyRaf.current);
    flyRaf.current = 0;
  }, []);
  useEffect(() => stopFlying, [stopFlying]);

  const flyTo = useCallback(
    (target: MapCamera) => {
      stopFlying();
      const from = cameraRef.current ?? HOME_CAMERA;
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / FLY_MS);
        const e = easeInOutCubic(t);
        setCamera(
          clampCamera(
            {
              k: from.k + (target.k - from.k) * e,
              x: from.x + (target.x - from.x) * e,
              y: from.y + (target.y - from.y) * e,
            },
            size.w,
            size.h,
          ),
        );
        if (t < 1) flyRaf.current = requestAnimationFrame(step);
      };
      flyRaf.current = requestAnimationFrame(step);
    },
    [size.w, size.h, stopFlying],
  );

  const openedRef = useRef(false);
  useEffect(() => {
    if (openedRef.current || size.w === 0 || size.h === 0) return;
    openedRef.current = true;
    setCamera(
      cameraFitPoints(
        scene.nodes.map(n => ({ lat: n.lat, lng: n.lng })),
        size.w,
        size.h,
      ),
    );
  }, [size.w, size.h, scene.nodes]);

  const resetView = useCallback(() => {
    forceOpenKRef.current = null;
    setExpandedIds(new Set());
    flyTo(
      cameraFitPoints(
        scene.nodes.map(n => ({ lat: n.lat, lng: n.lng })),
        size.w,
        size.h,
      ),
    );
  }, [flyTo, scene.nodes, size.w, size.h]);

  const zoomBy = useCallback(
    (dir: 1 | -1) => {
      const cam = cameraRef.current ?? HOME_CAMERA;
      flyTo(
        zoomCamera(
          cam,
          dir > 0 ? ZOOM_STEP : 1 / ZOOM_STEP,
          { x: size.w / 2, y: size.h / 2 },
          size.w,
          size.h,
        ),
      );
    },
    [flyTo, size.w, size.h],
  );

  const dragRef = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const hitLanesRef = useRef<{ id: string; points: [number, number][] }[]>([]);

  const onPointerDown = useCallback((ev: ReactPointerEvent<HTMLDivElement>) => {
    if (ev.button !== 0) return;
    dragRef.current = { x: ev.clientX, y: ev.clientY, moved: false };
    ev.currentTarget.setPointerCapture(ev.pointerId);
  }, []);

  const onPointerMove = useCallback(
    (ev: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dx = ev.clientX - drag.x;
      const dy = ev.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
      drag.moved = true;
      drag.x = ev.clientX;
      drag.y = ev.clientY;
      stopFlying();
      setCamera(cam => (cam ? panCamera(cam, dx, dy, size.w, size.h) : cam));
    },
    [size.w, size.h, stopFlying],
  );

  const closeInspector = useCallback(() => setSelected(null), []);

  const onPointerUp = useCallback(
    (ev: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      dragRef.current = null;
      if (!drag || drag.moved) return;
      const rect = wrapRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;
      let bestId: string | null = null;
      let bestD = LANE_HIT_PX;
      for (const lane of hitLanesRef.current) {
        const pts = lane.points;
        for (let i = 1; i < pts.length; i++) {
          const d = segmentDistance(
            x,
            y,
            pts[i - 1][0],
            pts[i - 1][1],
            pts[i][0],
            pts[i][1],
          );
          if (d < bestD) {
            bestD = d;
            bestId = lane.id;
          }
        }
      }
      if (bestId) {
        setSelected(null);
        onEdgeSelect?.(bestId);
        return;
      }
      closeInspector();
    },
    [closeInspector, onEdgeSelect],
  );

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (ev: WheelEvent) => {
      ev.preventDefault();
      const rect = el.getBoundingClientRect();
      stopFlying();
      const at = { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
      setCamera(cam =>
        cam
          ? zoomCamera(cam, Math.exp(-ev.deltaY * 0.0022), at, size.w, size.h)
          : cam,
      );
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [size.w, size.h, stopFlying]);

  const onKeyDown = useCallback(
    (ev: React.KeyboardEvent<HTMLDivElement>) => {
      if (ev.target !== ev.currentTarget) return;
      const pan = 60;
      if (ev.key === '+' || ev.key === '=') zoomBy(1);
      else if (ev.key === '-' || ev.key === '_') zoomBy(-1);
      else if (ev.key === '0') resetView();
      else if (ev.key === 'ArrowLeft')
        setCamera(c => (c ? panCamera(c, pan, 0, size.w, size.h) : c));
      else if (ev.key === 'ArrowRight')
        setCamera(c => (c ? panCamera(c, -pan, 0, size.w, size.h) : c));
      else if (ev.key === 'ArrowUp')
        setCamera(c => (c ? panCamera(c, 0, pan, size.w, size.h) : c));
      else if (ev.key === 'ArrowDown')
        setCamera(c => (c ? panCamera(c, 0, -pan, size.w, size.h) : c));
      else if (ev.key === 'Escape') closeInspector();
      else return;
      ev.preventDefault();
    },
    [zoomBy, resetView, size.w, size.h, closeInspector],
  );

  const proj = useMemo(
    () =>
      camera && size.w > 0
        ? mapProjection(size.w, size.h, camera).clipAngle(null)
        : null,
    [camera, size],
  );
  const worldView = (camera?.k ?? MIN_ZOOM) <= MIN_ZOOM + 1e-6;
  const project = useCallback(
    (lat: number, lng: number): [number, number] | null =>
      proj ? projectPoint(proj, lat, lng) : null,
    [proj],
  );
  const onScreen = useCallback(
    (p: [number, number] | null, margin = 40): p is [number, number] =>
      p !== null &&
      p[0] > -margin &&
      p[0] < size.w + margin &&
      p[1] > -margin &&
      p[1] < size.h + margin,
    [size],
  );

  const clusters = useMemo(
    () =>
      proj
        ? clusterMapNodes(sceneNodes, project, CLUSTER_RADIUS_PX, expandedIds)
        : [],
    [proj, sceneNodes, project, expandedIds],
  );
  const clusteredArcs = useMemo(
    () => remapArcsToClusters(disclosedScene.arcs, clusters),
    [disclosedScene.arcs, clusters],
  );

  const drawArcs = useMemo<MapDrawArc[]>(
    () =>
      clusteredArcs.map(a => {
        const dim = Boolean(
          liveCascade &&
          !liveCascade.laneIds.has(a.id) &&
          !liveCascade.onPathIds.has(a.fromEntity) &&
          !liveCascade.onPathIds.has(a.toEntity),
        );
        return {
          id: a.id,
          from: a.from,
          to: a.to,
          color:
            a.onSpine || liveCascade?.laneIds.has(a.id)
              ? MAP_COLORS.spine
              : MAP_COLORS.arcDefault,
          alpha: dim ? 0.22 : 1,
        };
      }),
    [clusteredArcs, liveCascade],
  );

  const drawCommand = useMemo<MapDrawCommand | null>(() => {
    if (!camera || size.w === 0 || size.h === 0) return null;
    return {
      width: size.w,
      height: size.h,
      dpr: typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1,
      camera,
      arcs: drawArcs,
    };
  }, [camera, size, drawArcs]);

  const { mode: rendererMode, canvasKey } = useMapBaseRenderer(
    canvasRef,
    drawCommand,
    lanes => {
      hitLanesRef.current = lanes;
    },
    scene.nodes.length > 0,
  );

  const labels = useMemo(
    () =>
      clusters
        .filter(c => c.nodeId)
        .map(c => {
          const n = byId.get(c.nodeId!);
          return {
            id: c.id,
            lat: c.lat,
            lng: c.lng,
            text: n?.name ?? c.id,
            primary: c.id === orgId || c.id === inspected?.id,
          };
        }),
    [clusters, byId, orgId, inspected],
  );
  const placedLabels = useMemo(
    () => (proj ? placeMapLabels(labels, project, size.w, size.h) : []),
    [proj, labels, project, size],
  );
  const placedLabelById = useMemo(
    () => new Map(placedLabels.map(l => [l.id, l])),
    [placedLabels],
  );

  const flyToPlace = useCallback(
    (lat: number, lng: number) => {
      const k = cameraRef.current?.k ?? HOME_CAMERA.k;
      flyTo(cameraCenteredOn(lat, lng, k, size.w, size.h));
    },
    [flyTo, size.w, size.h],
  );

  const activateCluster = useCallback(
    (cluster: (typeof clusters)[number]) => {
      if (cluster.nodeId) {
        const node = byId.get(cluster.nodeId);
        if (!node) return;
        setSelected(node);
        onNodeClick?.(node.id);
        flyToPlace(node.lat, node.lng);
        return;
      }
      setSelected(null);
      if (forceOpenKRef.current == null) {
        forceOpenKRef.current = cameraRef.current?.k ?? HOME_CAMERA.k;
      }
      setExpandedIds(prev => {
        const next = new Set(prev);
        for (const id of cluster.memberIds) next.add(id);
        return next;
      });
    },
    [byId, flyToPlace, onNodeClick],
  );

  const at = (p: [number, number]): CSSProperties => ({
    left: `${p[0]}px`,
    top: `${p[1]}px`,
  });

  const ready = camera !== null && size.w > 0;
  const shownRouteCount = disclosedScene.arcs.length;
  const totalRouteCount = scene.arcs.length;

  if (scene.nodes.length === 0) {
    return (
      <div className={cn(S.root, fill && S.fill, className)}>
        <div className={S.empty} role="status">
          No confirmed locations yet — confirm a placed node to show it on the
          map.
        </div>
      </div>
    );
  }

  return (
    <div className={cn(S.root, fill && S.fill, className)}>
      <div
        ref={wrapRef}
        className={S.canvas}
        role="application"
        aria-label={`Supply chain map, ${scene.nodes.length} located ${
          scene.nodes.length === 1 ? 'site' : 'sites'
        }, ${shownRouteCount} of ${totalRouteCount} routes. Drag to pan, arrow keys pan, plus and minus zoom, 0 resets the view.`}
        data-map-renderer={rendererMode}
        data-camera-k={camera?.k ?? ''}
        data-map-force-open={expandedIds.size}
        data-map-places={scene.nodes.length}
        data-map-glyphs={
          clusters.filter(c => {
            const p = project(c.lat, c.lng);
            return p != null && (worldView || onScreen(p));
          }).length
        }
        data-map-clustered={clusters.reduce((sum, c) => sum + c.count, 0)}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          dragRef.current = null;
        }}
        onKeyDown={onKeyDown}
      >
        <canvas
          key={canvasKey}
          ref={canvasRef}
          className={S.baseCanvas}
          aria-hidden
        />
        {ready ? (
          <div className={S.overlay}>
            {clusters.map(cluster => {
              const p = project(cluster.lat, cluster.lng);
              if (!p || (!worldView && !onScreen(p))) return null;
              const node = cluster.nodeId
                ? byId.get(cluster.nodeId)
                : undefined;
              const dim = Boolean(
                liveCascade &&
                !cluster.memberIds.some(id => liveCascade.onPathIds.has(id)),
              );
              const selectedNode = Boolean(
                inspected && cluster.memberIds.includes(inspected.id),
              );
              const isOrg = Boolean(orgId && cluster.memberIds.includes(orgId));
              const label = cluster.nodeId
                ? placedLabelById.get(cluster.id)
                : undefined;
              const names = cluster.memberIds
                .map(id => byId.get(id)?.name)
                .filter((name): name is string => Boolean(name));
              const title =
                node?.name ??
                (names.length > 3
                  ? `${names.slice(0, 3).join(', ')} +${names.length - 3}`
                  : names.join(', '));
              return (
                <div
                  key={cluster.id}
                  className={cn(
                    S.marker,
                    cluster.count > 1 && S.cluster,
                    selectedNode && S.selected,
                    dim && S.dimmed,
                  )}
                  style={at(p)}
                >
                  <button
                    type="button"
                    className={cn(S.node, cluster.count > 1 && S.cluster)}
                    style={{
                      background: isOrg ? MAP_COLORS.org : MAP_COLORS.chain,
                    }}
                    title={title}
                    aria-label={
                      node
                        ? `Inspect ${node.name}`
                        : `Show ${cluster.count} nearby sites`
                    }
                    onPointerDown={e => e.stopPropagation()}
                    onPointerUp={e => e.stopPropagation()}
                    onClick={e => {
                      e.stopPropagation();
                      activateCluster(cluster);
                    }}
                  >
                    {cluster.count > 1 ? cluster.count : null}
                  </button>
                  {label ? (
                    <button
                      type="button"
                      className={cn(S.label, label.primary && S.primary)}
                      title={label.text}
                      aria-label={`Inspect ${label.text}`}
                      onPointerDown={e => e.stopPropagation()}
                      onPointerUp={e => e.stopPropagation()}
                      onClick={e => {
                        e.stopPropagation();
                        activateCluster(cluster);
                      }}
                    >
                      {label.text}
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}

        <div className={S.disclosure} role="region" aria-label="Map disclosure">
          <span role="status" aria-live="polite">
            <strong>{showAll ? 'All routes' : 'Overview'}</strong>
            {' · '}
            <span>
              {shownRouteCount} of {totalRouteCount} routes
            </span>
            {disclosedScene.canRevealByZoom ? (
              <span> · Zoom in to reveal more</span>
            ) : null}
          </span>
          <button
            type="button"
            className={S.action}
            aria-pressed={showAll}
            onClick={() => setShowAll(expanded => !expanded)}
          >
            {showAll ? 'Return to overview' : 'Show all'}
          </button>
          <div className={S.zoom}>
            <button
              type="button"
              className={S.action}
              onClick={() => zoomBy(1)}
            >
              +
            </button>
            <button
              type="button"
              className={S.action}
              onClick={() => zoomBy(-1)}
            >
              −
            </button>
            <button type="button" className={S.action} onClick={resetView}>
              0
            </button>
          </div>
        </div>
      </div>

      {inspected ? (
        <div className={S.inspection} aria-live="polite">
          <div className={S.kicker}>{inspected.type}</div>
          <strong>{inspected.name}</strong>
          {inspectionLocation(inspected) ? (
            <p>{inspectionLocation(inspected)}</p>
          ) : null}
        </div>
      ) : (
        <p className={S.hint}>
          Select a confirmed location to inspect its stored details.
        </p>
      )}
    </div>
  );
}
