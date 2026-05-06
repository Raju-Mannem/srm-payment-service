import 'dotenv/config';
import { build } from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';

const isProd = process.env.NODE_ENV === 'production';

build({
  entryPoints: ['src/server.ts'],
  external: ['pg'],
  outdir: 'dist',
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  sourcemap: true,
  minify: isProd,
  plugins: [nodeExternalsPlugin()],
  outExtension: {
    '.js': '.js',
  },
}).catch(() => process.exit(1));
