import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">Mantle</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400">
        Reasoning Substrate - Coming Soon
      </p>
    </main>
  );
}
