// Consistent loading / error / empty copy shared across every fetch surface.
// Fail-loud: errors show the normalized message, never a blank screen.

export function Loading({ what = 'Loading…' }: { what?: string }) {
  return <p className="state state-loading">{what}</p>;
}

export function ErrorState({ message, resource }: { message: string; resource?: string }) {
  return (
    <p className="state state-error" role="alert">
      {resource ? `Couldn't load ${resource}: ` : 'Something went wrong: '}
      {message}
    </p>
  );
}

export function Empty({ message = 'Nothing here yet.' }: { message?: string }) {
  return <p className="state state-empty">{message}</p>;
}
