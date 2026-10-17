/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RELAYER_URL?: string;
  readonly VITE_SYA_TOKEN_ADDRESS?: string;
  readonly VITE_TEST_USD_ADDRESS?: string;
  readonly VITE_FORWARDER_ADDRESS?: string;
  readonly VITE_ESCROW_ADDRESS?: string;
  readonly VITE_ARBITRATOR_ADDRESS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.svg' {
  const content: string;
  export default content;
}
