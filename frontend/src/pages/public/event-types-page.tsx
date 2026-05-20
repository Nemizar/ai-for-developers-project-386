import { Button, Card, Group, Stack, Text, Title } from '@mantine/core'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { api } from '../../shared/api/client'
import { ApiError } from '../../shared/api/http'
import type { EventType } from '../../shared/api/types'
import { RequestState } from '../../shared/ui/request-state'

export function PublicEventTypesPage() {
  const [rows, setRows] = useState<EventType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        setRows(await api.listPublicEventTypes())
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to load event types')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  return (
    <Stack>
      <Title order={2}>Book a meeting</Title>
      <Text c="dimmed">Choose event type to see available slots.</Text>
      <RequestState isLoading={loading} error={error} isEmpty={rows.length === 0} emptyLabel="No public event types">
        <Stack>
          {rows.map((row) => (
            <Card key={row.id} withBorder>
              <Group justify="space-between" align="flex-start">
                <Stack gap={2} maw="75%">
                  <Text fw={700}>{row.title}</Text>
                  <Text size="sm" c="dimmed">
                    {row.description}
                  </Text>
                  <Text size="sm">Duration: {row.durationMinutes} min</Text>
                </Stack>
                <Button component={Link} to={`/book/${row.id}`}>
                  Select
                </Button>
              </Group>
            </Card>
          ))}
        </Stack>
      </RequestState>
    </Stack>
  )
}
