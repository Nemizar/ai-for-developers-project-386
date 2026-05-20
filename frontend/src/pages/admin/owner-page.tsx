import { Card, Stack, Text, Title } from '@mantine/core'
import { useEffect, useState } from 'react'

import { api } from '../../shared/api/client'
import { ApiError } from '../../shared/api/http'
import type { OwnerProfile } from '../../shared/api/types'
import { RequestState } from '../../shared/ui/request-state'

export function AdminOwnerPage() {
  const [data, setData] = useState<OwnerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        const profile = await api.getOwnerProfile()
        setData(profile)
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Failed to load owner profile')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  return (
    <Stack>
      <Title order={2}>Owner profile</Title>
      <RequestState isLoading={loading} error={error} isEmpty={!data} emptyLabel="Owner data is empty">
        <Card withBorder>
          <Text fw={700}>{data?.displayName}</Text>
          <Text c="dimmed">ID: {data?.id}</Text>
          <Text>{data?.email ?? 'No email specified'}</Text>
        </Card>
      </RequestState>
    </Stack>
  )
}
