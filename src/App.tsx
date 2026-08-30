import { useHashRoute } from './shell/useHashRoute';
import { LabShell } from './shell/LabShell';
import { PrereqPage } from './pages/PrereqPage';
import { ProgressPage } from './pages/ProgressPage';
import { LABS, prereqById } from './engine/registry';

export default function App() {
  const route = useHashRoute(LABS[0]!.id);

  if (route.view === 'progress') return <ProgressPage />;

  if (route.view === 'prereq') {
    const lesson = prereqById(route.lessonId);
    if (lesson) return <PrereqPage lesson={lesson} />;
  }

  return <LabShell />;
}
