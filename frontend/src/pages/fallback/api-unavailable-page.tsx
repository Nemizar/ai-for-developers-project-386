import { Alert, Button, Center, Paper, Stack, Text, Title } from '@mantine/core'
import { IconPlugConnectedX } from '@tabler/icons-react'
import { Link } from 'react-router-dom'

export function ApiUnavailablePage() {
  return (
    <Center mih="100vh" p="lg">
      <Paper p="xl" radius="md" withBorder maw={560}>
        <Stack>
          <Title order={2}>API unavailable</Title>
          <Alert color="orange" icon={<IconPlugConnectedX size={18} />}>
            Cannot connect to API. Check backend or Prism status and `VITE_API_BASE_URL`.
          </Alert>
          <Text size="sm" c="dimmed">
            The frontend only works through API contract endpoints.
          </Text>
          <Button component={Link} to="/book">
            Back to app
          </Button>
        </Stack>
      </Paper>
    </Center>
  )
}
