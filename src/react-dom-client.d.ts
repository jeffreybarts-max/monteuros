declare module 'react-dom/client' {
  import { Root, createRoot as originalCreateRoot, hydrateRoot as originalHydrateRoot } from 'react-dom'
  
  export function createRoot(container: Element | DocumentFragment): Root
  export function hydrateRoot(container: Element | DocumentFragment, initialChildren: React.ReactNode): Root
}
