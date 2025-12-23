/**
 * Test utilities for React components.
 *
 * Provides a custom render function that wraps components
 * with necessary providers (Router, etc.).
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

interface WrapperOptions {
  initialPath?: string;
}

/**
 * Custom render function that wraps components with providers.
 *
 * For simple component tests that don't need routing,
 * this provides a clean wrapper. For route-dependent tests,
 * use the router directly in the test.
 */
function AllTheProviders({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & WrapperOptions,
) {
  const { initialPath: _initialPath, ...renderOptions } = options || {};

  return render(ui, { wrapper: AllTheProviders, ...renderOptions });
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

// Override render with our custom version
export { customRender as render };
