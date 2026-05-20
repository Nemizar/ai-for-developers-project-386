import { Button, Center, Paper, Stack, Text, Title } from '@mantine/core'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <Center mih="100vh" p="lg">
      <Paper p="xl" radius="md" withBorder>
        <Stack>
          <Title order={2}>404</Title>
          <Text>Page not found.</Text>
          <Button component={Link} to="/book">
            Go to booking
          </Button>
        </Stack>
      </Paper>
    </Center>
  )
}
