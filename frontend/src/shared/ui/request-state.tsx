import { Alert, Center, Loader, Text } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import type { ReactNode } from 'react'

type Props = {
  isLoading?: boolean
  error?: string | null
  isEmpty?: boolean
  emptyLabel?: string
  children: ReactNode
}

export function RequestState({ isLoading, error, isEmpty, emptyLabel, children }: Props) {
  if (isLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    )
  }

  if (error) {
    return (
      <Alert color="red" icon={<IconAlertCircle size={16} />}>
        {error}
      </Alert>
    )
  }

  if (isEmpty) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        {emptyLabel ?? 'No data yet'}
      </Text>
    )
  }

  return children
}
