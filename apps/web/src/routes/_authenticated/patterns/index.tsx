import { createFileRoute } from '@tanstack/react-router';
import { PatternsPage } from '@/pages/patterns-page';

export const Route = createFileRoute('/_authenticated/patterns/')({
  component: PatternsPage,
});
