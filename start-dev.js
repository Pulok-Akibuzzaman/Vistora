import { spawn } from 'node:child_process'
import path from 'node:path'

const isWin = process.platform === 'win32'
const npmCmd = isWin ? 'npm.cmd' : 'npm'
const nodeCmd = isWin ? 'node.exe' : 'node'

console.log('\x1b[36m%s\x1b[0m', '==============================================================')
console.log('\x1b[36m%s\x1b[0m', '  🎓 CSE412 IELTS Listening Exam System - Local Orchestrator')
console.log('\x1b[36m%s\x1b[0m', '==============================================================')
console.log(' Starting Backend Server (Port 5001)...')
console.log(' Starting Frontend Dev Server...')
console.log('\x1b[36m%s\x1b[0m', '==============================================================\n')

const backendCwd = path.resolve(import.meta.dirname, 'backend')
const frontendCwd = path.resolve(import.meta.dirname, 'Frontend UI')

// Spawn Backend
const backend = spawn(nodeCmd, ['server.js'], {
  cwd: backendCwd,
  stdio: 'pipe',
  shell: true,
  env: { ...process.env, PORT: '5001' }
})

backend.stdout.on('data', data => {
  const lines = data.toString().trim().split('\n')
  lines.forEach(line => console.log('\x1b[35m[Backend]\x1b[0m', line))
})

backend.stderr.on('data', data => {
  const lines = data.toString().trim().split('\n')
  lines.forEach(line => console.error('\x1b[31m[Backend Err]\x1b[0m', line))
})

// Spawn Frontend
const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: frontendCwd,
  stdio: 'pipe',
  shell: true,
  env: { ...process.env }
})

frontend.stdout.on('data', data => {
  const lines = data.toString().trim().split('\n')
  lines.forEach(line => console.log('\x1b[32m[Frontend]\x1b[0m', line))
})

frontend.stderr.on('data', data => {
  const lines = data.toString().trim().split('\n')
  lines.forEach(line => console.error('\x1b[33m[Frontend Msg]\x1b[0m', line))
})

function cleanup() {
  console.log('\n\x1b[36m%s\x1b[0m', 'Shutting down servers gracefully...')
  backend.kill('SIGINT')
  frontend.kill('SIGINT')
  process.exit(0)
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
