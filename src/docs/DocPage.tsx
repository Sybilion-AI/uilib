import { Suspense } from 'react';
import { Navigate, useParams } from 'react-router-dom';

import S from './DocsShell.styl';
import { DOC_DEFAULT_SLUG, DOC_REGISTRY, docPageComponents } from './registry';

export function DocPage() {
  const { slug } = useParams();
  const entry = DOC_REGISTRY.find(e => e.slug === slug);
  const Comp = slug ? docPageComponents[slug] : undefined;

  if (!entry || !Comp) {
    return <Navigate to={`/docs/${DOC_DEFAULT_SLUG}`} replace />;
  }

  return (
    <Suspense fallback={<div className={S.loading}>Loading…</div>}>
      <Comp />
    </Suspense>
  );
}
