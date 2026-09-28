const esbuild = require('esbuild');
const path = require('path');

const watch = process.argv.includes('--watch');

const config = {
  entryPoints: ['src/supportly-widget.ts'],
  bundle: true,
  minify: !watch,
  outfile: path.join(__dirname, '..', 'backend', 'public', 'widget', 'supportly-widget.js'),
  format: 'iife',
  target: ['es2020'],
  sourcemap: watch,
};

if (watch) {
  esbuild.context(config).then(ctx => {
    ctx.watch();
    console.log('Watching for changes...');
  });
} else {
  esbuild.build(config).then(() => {
    console.log('Widget built successfully!');
  });
}
