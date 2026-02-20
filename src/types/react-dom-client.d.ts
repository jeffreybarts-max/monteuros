declare module 'react-dom/client' {
  import { ReactElement } from 'react';
  
  interface Root {
    render(element: ReactElement): void;
    unmount(): void;
  }
  
  interface CreateRootOptions {
    identifierPrefix?: string;
    onRecoverableError?: (error: unknown) => void;
  }
  
  export function createRoot(
    container: Element | DocumentFragment,
    options?: CreateRootOptions
  ): Root;
  
  export function hydrateRoot(
    container: Element | DocumentFragment,
    initialChildren: ReactElement,
    options?: CreateRootOptions
  ): Root;
}
