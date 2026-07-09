const OUT_DIR = '.vite/build'
// const OUT_DIR = 'dist'
import fs from 'fs'
import esbuild from 'esbuild'
if (fs.existsSync(OUT_DIR)) {
  fs.rmSync(OUT_DIR, { recursive: true, force: true })
}

esbuild.buildSync({
  entryPoints: ['src/preload.ts'],
  outfile: OUT_DIR + '/preload.js',
  platform: 'node',
  target: 'node16',
  format: 'cjs',
  bundle: true,
  sourcemap: false,
  external: ['electron', 'path', 'fs', 'os', 'crypto', 'http', 'https', 'stream', 'url'],
  // watch: true,
})

console.log('✅ Preload process built')
esbuild.buildSync({
  entryPoints: ['src/main.ts'],
  outfile: OUT_DIR + '/main.js',
  platform: 'node', // ✅ Node 环境
  target: 'node16',
  format: 'cjs', // Electron 主进程必须是 cjs
  bundle: true,
  sourcemap: false,
  // watch: true,
  external: [
    'electron', // Electron 自带，不能打进去
    'path',
    'fs',
    'os',
    'crypto',
    'http',
    'https',
    'stream',
    'url',
    'net',
    'tls',
  ],
})
console.log('✅ Main process built')
