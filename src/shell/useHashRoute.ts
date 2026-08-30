import { useEffect, useState } from 'react';

export type Route =
  | { view: 'lab'; labId: string }
  | { view: 'prereq'; lessonId: string };

export function parseHash(hash: string, fallbackLabId: string): Route {
  const prereq = /^#\/prereq\/(.+)$/.exec(hash);
  if (prereq) return { view: 'prereq', lessonId: decodeURIComponent(prereq[1]!) };

  const lab = /^#\/lab\/(.+)$/.exec(hash);
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

export function goToPrereq(lessonId: string) {
  window.location.hash = `#/prereq/${encodeURIComponent(lessonId)}`;
}
