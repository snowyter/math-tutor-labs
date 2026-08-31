import { useEffect, useState } from 'react';
import type { LabNumbers } from '../engine/types';

export type PrereqParams = LabNumbers;

export type Route =
  | { view: 'lab'; labId: string }
  | { view: 'prereq'; lessonId: string; params?: PrereqParams }
  | { view: 'progress' };

function readParams(query: string): PrereqParams | undefined {
  const sp = new URLSearchParams(query);
  const mRaw = sp.get('m');
  const bRaw = sp.get('b');
  if (mRaw === null || bRaw === null || mRaw === '' || bRaw === '') return undefined;
  const m = Number(mRaw);
  const b = Number(bRaw);
  if (!Number.isFinite(m) || !Number.isFinite(b)) return undefined;
  return { m, b };
}

export function parseHash(hash: string, fallbackLabId: string): Route {
  if (hash === '#/progress') return { view: 'progress' };

  const prereq = /^#\/prereq\/([^?]+)(?:\?(.*))?$/.exec(hash);
  if (prereq) {
    return {
      view: 'prereq',
      lessonId: decodeURIComponent(prereq[1]!),
      params: prereq[2] ? readParams(prereq[2]) : undefined,
    };
  }

  const lab = /^#\/lab\/([^?]+)(?:\?(.*))?$/.exec(hash);
  if (lab) return { view: 'lab', labId: decodeURIComponent(lab[1]!) };

  return { view: 'lab', labId: fallbackLabId };
}

export function useHashRoute(fallbackLabId: string): Route {
  const [route, setRoute] = useState(() => parseHash(window.location.hash, fallbackLabId));

  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash, fallbackLabId));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, [fallbackLabId]);

  return route;
}

export function goToLab(labId: string) {
  window.location.hash = `#/lab/${encodeURIComponent(labId)}`;
}

export function goToPrereq(lessonId: string, params?: PrereqParams) {
  const query = params ? `?m=${params.m}&b=${params.b}` : '';
  window.location.hash = `#/prereq/${encodeURIComponent(lessonId)}${query}`;
}

export function goToProgress() {
  window.location.hash = '#/progress';
}
