export type PosAppGlobal = unknown

declare global {
  interface Window {
    __posApp?: PosAppGlobal
  }
}

export {}
