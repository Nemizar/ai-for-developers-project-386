const baseUrl = process.env.SMOKE_API_BASE_URL ?? process.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:4010'

const checks = [
  { name: 'Public event types', path: '/public/event-types', method: 'GET' },
  { name: 'Admin owner profile', path: '/admin/owner', method: 'GET' },
  { name: 'Admin event types', path: '/admin/event-types', method: 'GET' },
  { name: 'Admin bookings', path: '/admin/bookings', method: 'GET' },
]

async function run() {
  console.log(`Smoke API base URL: ${baseUrl}`)
  let failed = false

  for (const check of checks) {
    const url = `${baseUrl}${check.path}`

    try {
      const response = await fetch(url, { method: check.method })
      const ok = response.status >= 200 && response.status < 300

      if (!ok) {
        failed = true
        console.error(`[FAIL] ${check.name}: ${response.status}`)
        continue
      }

      console.log(`[PASS] ${check.name}: ${response.status}`)
    } catch (error) {
      failed = true
      console.error(`[FAIL] ${check.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  if (failed) {
    process.exitCode = 1
    return
  }

  console.log('Smoke API checks passed')
}

await run()
