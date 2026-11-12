/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly APP_NAME: string;
  readonly APP_LICENSE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
