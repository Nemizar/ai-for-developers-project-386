const baseUrl = process.env.SMOKE_API_BASE_URL ?? process.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:4010'

function fail(message) {
  console.error(`[FAIL] ${message}`)
  process.exitCode = 1
}

async function requestJson(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options)
  const text = await response.text()

  let body = null
  if (text) {
    try {
      body = JSON.parse(text)
    } catch {
      body = text
    }
  }

  return { response, body }
}

function isoWindow() {
  const from = new Date()
  const to = new Date(from.getTime() + 1000 * 60 * 60 * 24 * 14)
  return { from: from.toISOString(), to: to.toISOString() }
}

async function run() {
  console.log(`Booking smoke API base URL: ${baseUrl}`)

  const eventTypesResult = await requestJson('/public/event-types')
  if (!eventTypesResult.response.ok || !Array.isArray(eventTypesResult.body) || eventTypesResult.body.length === 0) {
    fail(`Public event types are unavailable (${eventTypesResult.response.status})`)
    return
  }

  const eventTypeId = eventTypesResult.body[0].id
  if (!eventTypeId) {
    fail('First event type does not have id')
    return
  }

  const { from, to } = isoWindow()
  const slotsResult = await requestJson(
    `/public/event-types/${encodeURIComponent(eventTypeId)}/slots?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
  )
  if (!slotsResult.response.ok || !slotsResult.body || !Array.isArray(slotsResult.body.slots)) {
    fail(`Failed to fetch slots (${slotsResult.response.status})`)
    return
  }
  if (slotsResult.body.slots.length === 0) {
    fail('No available slots in default window')
    return
  }

  const startAt = slotsResult.body.slots[0].startAt
  const payload = {
    eventTypeId,
    startAt,
    guestName: 'Smoke Tester',
    guestContact: 'smoke@example.com',
    note: 'booking smoke test',
  }

  const createResult = await requestJson('/public/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!createResult.response.ok) {
    fail(`Booking creation failed (${createResult.response.status})`)
    return
  }

  if (!createResult.body?.id || createResult.body.eventTypeId !== eventTypeId || createResult.body.startAt !== startAt) {
    fail('Booking response payload has unexpected shape')
    return
  }

  const duplicateResult = await requestJson('/public/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (duplicateResult.response.status !== 409) {
    fail(`Expected duplicate booking conflict 409, got ${duplicateResult.response.status}`)
    return
  }

  const invalidResult = await requestJson('/public/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      eventTypeId,
      startAt,
      guestName: '   ',
      guestContact: '',
    }),
  })

  if (invalidResult.response.status !== 400) {
    fail(`Expected invalid payload status 400, got ${invalidResult.response.status}`)
    return
  }

  if (!invalidResult.body || typeof invalidResult.body !== 'object') {
    fail('Expected JSON error payload for invalid booking')
    return
  }

  if (invalidResult.body.code !== 'invalid_booking') {
    fail(`Expected error code invalid_booking, got ${String(invalidResult.body.code)}`)
    return
  }

  if (invalidResult.body.message !== 'Invalid booking payload') {
    fail(`Expected validation message, got ${String(invalidResult.body.message)}`)
    return
  }

  console.log('[PASS] Booking flow smoke checks passed')
}

await run()
