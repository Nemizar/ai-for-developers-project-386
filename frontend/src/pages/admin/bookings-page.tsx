import { Button, Card, Group, Stack, Table, TextInput, Title } from '@mantine/core'
import { useEffect, useState } from 'react'

import { api } from '../../shared/api/client'
import { ApiError } from '../../shared/api/http'
import type { Booking } from '../../shared/api/types'
import { formatDate, toIsoOrUndefined } from '../../shared/lib/date'
import { RequestState } from '../../shared/ui/request-state'

export function AdminBookingsPage() {
  const [rows, setRows] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const load = async () => {
    setLoading(true)
    setError(null)

    const fromIso = toIsoOrUndefined(from)
    const toIso = toIsoOrUndefined(to)

    if (from && !fromIso) {
      setError('Invalid "from" date')
      setLoading(false)
      return
    }

    if (to && !toIso) {
      setError('Invalid "to" date')
      setLoading(false)
      return
    }

    if (fromIso && toIso && fromIso > toIso) {
      setError('"From" date must be earlier than "to" date')
      setLoading(false)
      return
    }

    try {
      setRows(await api.listUpcomingBookings(fromIso, toIso))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Stack>
      <Title order={2}>Upcoming bookings</Title>
      <Card withBorder>
        <Group align="end">
          <TextInput
            label="From"
            type="datetime-local"
            value={from}
            onChange={(event) => setFrom(event.currentTarget.value)}
          />
          <TextInput
            label="To"
            type="datetime-local"
            value={to}
            onChange={(event) => setTo(event.currentTarget.value)}
          />
          <Button onClick={() => void load()}>Apply filters</Button>
        </Group>
      </Card>

      <RequestState isLoading={loading} error={error} isEmpty={rows.length === 0} emptyLabel="No upcoming bookings">
        <Card withBorder>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Event</Table.Th>
                <Table.Th>Time</Table.Th>
                <Table.Th>Guest</Table.Th>
                <Table.Th>Contact</Table.Th>
                <Table.Th>Created</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((row) => (
                <Table.Tr key={row.id}>
                  <Table.Td>{row.eventTypeTitle}</Table.Td>
                  <Table.Td>
                    {formatDate(row.startAt)} - {formatDate(row.endAt)}
                  </Table.Td>
                  <Table.Td>{row.guestName}</Table.Td>
                  <Table.Td>{row.guestContact}</Table.Td>
                  <Table.Td>{formatDate(row.createdAt)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      </RequestState>
    </Stack>
  )
}
