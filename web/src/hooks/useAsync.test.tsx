import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useAsync } from './useAsync';

function Probe({ fn }: { fn: () => Promise<string> }) {
  const { loading, data, error } = useAsync(fn, []);
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="data">{data ?? ''}</span>
      <span data-testid="error">{error ?? ''}</span>
    </div>
  );
}

describe('useAsync', () => {
  it('transitions loading → data', async () => {
    render(<Probe fn={() => Promise.resolve('hello')} />);
    expect(screen.getByTestId('loading')).toHaveTextContent('true');
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('data')).toHaveTextContent('hello');
    expect(screen.getByTestId('error')).toHaveTextContent('');
  });

  it('transitions loading → error with the error message', async () => {
    render(<Probe fn={() => Promise.reject(new Error('nope'))} />);
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    expect(screen.getByTestId('error')).toHaveTextContent('nope');
    expect(screen.getByTestId('data')).toHaveTextContent('');
  });
});
