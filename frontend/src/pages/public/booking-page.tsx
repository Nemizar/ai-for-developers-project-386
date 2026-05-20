import {
  Alert,
  Button,
  Card,
  Group,
  Radio,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { api } from '../../shared/api/client'
import { ApiError } from '../../shared/api/http'
import type { Booking, Slot } from '../../shared/api/types'
import { formatDate, toIsoOrUndefined } from '../../shared/lib/date'
import { RequestState } from '../../shared/ui/request-state'

export function PublicBookingPage() {
  const { eventTypeId } = useParams<{ eventTypeId: string }>()
  const [slots, setSlots] = useState<Slot[]>([])
  const [windowLabel, setWindowLabel] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStartAt, setSelectedStartAt] = useState<string>('')
  const [guestName, setGuestName] = useState('')
  const [guestContact, setGuestContact] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [created, setCreated] = useState<Booking | null>(null)

  const range = useMemo(() => {
    const from = new Date()
    const to = new Date(from.getTime() + 1000 * 60 * 60 * 24 * 14)
    return {
      from: from.toISOString(),
      to: to.toISOString(),
    }
  }, [])

  useEffect(() => {
    const load = async () => {
      if (!eventTypeId) {
        setError('Missing event type id')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const response = await api.listAvailableSlots(eventTypeId, range.from, range.to)
        setSlots(response.slots)
        setWindowLabel(`${formatDate(response.window.from)} - ${formatDate(response.window.to)}`)
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to load slots')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [eventTypeId, range.from, range.to])

  const submit = async () => {
    if (!eventTypeId) {
      return
    }

    const startAt = toIsoOrUndefined(selectedStartAt)
    if (!startAt) {
      notifications.show({ color: 'red', message: 'Select a slot' })
      return
    }

    if (!guestName || !guestContact) {
      notifications.show({ color: 'red', message: 'Fill guest name and contact' })
      return
    }

    setSaving(true)
    try {
      const booking = await api.createBooking({
        eventTypeId,
        startAt,
        guestName,
        guestContact,
        note: note || undefined,
      })
      setCreated(booking)
      notifications.show({ color: 'green', message: 'Booking created' })
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to create booking'
      notifications.show({ color: 'red', message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>Booking</Title>
        <Button component={Link} variant="light" to="/book">
          Back to event types
        </Button>
      </Group>

      {created && (
        <Alert color="green" title="Booking confirmed">
          #{created.id} for {created.guestName} at {formatDate(created.startAt)}
        </Alert>
      )}

      <RequestState isLoading={loading} error={error} isEmpty={slots.length === 0} emptyLabel="No available slots">
        <Card withBorder>
          <Stack>
            <Text fw={700}>Available slots</Text>
            <Text size="sm" c="dimmed">
              Window: {windowLabel}
            </Text>
            <Radio.Group value={selectedStartAt} onChange={setSelectedStartAt}>
              <Stack gap="xs">
                {slots.map((slot) => (
                  <Radio key={slot.startAt} value={slot.startAt} label={formatDate(slot.startAt)} />
                ))}
              </Stack>
            </Radio.Group>
          </Stack>
        </Card>

        <Card withBorder>
          <Stack>
            <TextInput label="Guest name" value={guestName} onChange={(event) => setGuestName(event.currentTarget.value)} />
            <TextInput
              label="Guest contact"
              placeholder="email or phone"
              value={guestContact}
              onChange={(event) => setGuestContact(event.currentTarget.value)}
            />
            <Textarea label="Note" value={note} onChange={(event) => setNote(event.currentTarget.value)} />
            <Button loading={saving} onClick={() => void submit()} disabled={!selectedStartAt || !guestName || !guestContact}>
              Create booking
            </Button>
          </Stack>
        </Card>
      </RequestState>
    </Stack>
  )
}
