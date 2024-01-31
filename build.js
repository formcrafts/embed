const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/embed.ts'],
  outfile: 'dist/embed.js',
  bundle: true,
  format: 'umd',
  minify: false,
  keepNames: true,
  sourcemap: true,
  platform: 'neutral',
  loader: { '.css': 'text' },
  target: "esnext",
}).catch(() => process.exit(1));