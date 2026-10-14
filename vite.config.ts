import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { resolveCloudConfig } from "./scripts/validate-cloud-config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  // Vercel integrations may create NEXT_PUBLIC_* or unprefixed settings.
  // Read them at build time, but expose ONLY the validated public URL and key.
  const config = resolveCloudConfig({ ...loadEnv(mode, __dirname, ""), ...process.env });
  return {
    plugins: [react(), tailwindcss(), viteSingleFile()],
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(config.url),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(config.key),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
  };
});
