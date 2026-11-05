// Запускает preview-серверы приложений — как независимые деплои.
// node scripts/preview-all.mjs              — все три
// node scripts/preview-all.mjs shell cart   — только перечисленные (например, «Каталог лежит»)
import { spawn } from 'node:child_process'
const only = process.argv.slice(2)
const apps = [['shell', 5170], ['catalog', 5171], ['cart', 5172]].filter(([n]) => !only.length || only.includes(n))
const procs = apps.map(([name, port]) => {
  const p = spawn('npm', ['run', 'preview', '-w', name], { stdio: ['ignore', 'pipe', 'pipe'] })
  const out = (d) => String(d).split('\n').filter(Boolean).forEach((l) => console.log(`[${name}:${port}] ${l}`))
  p.stdout.on('data', out); p.stderr.on('data', out)
  return p
})
console.log('\nОткройте http://localhost:5170 — Shell. Ctrl+C — остановить всё.\n')
const stop = () => { procs.forEach((p) => p.kill()); process.exit() }
process.on('SIGINT', stop); process.on('SIGTERM', stop)
