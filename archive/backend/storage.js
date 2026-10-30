import fs from 'node:fs'
import path from 'node:path'

const DATA_DIR = path.resolve(import.meta.dirname, 'data')

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

export function readData(fileName, defaultData) {
  const filePath = path.join(DATA_DIR, fileName)
  if (!fs.existsSync(filePath)) {
    saveData(fileName, defaultData)
    return defaultData
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(raw)
  } catch (error) {
    console.error(`Error reading ${fileName}:`, error)
    return defaultData
  }
}

export function saveData(fileName, data) {
  const filePath = path.join(DATA_DIR, fileName)
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
  } catch (error) {
    console.error(`Error writing ${fileName}:`, error)
  }
}
