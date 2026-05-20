import { AppShell, Container, Group, NavLink, Title } from '@mantine/core'
import { Link, Outlet, useLocation } from 'react-router-dom'

const links = [
  { to: '/admin/owner', label: 'Admin: Owner' },
  { to: '/admin/event-types', label: 'Admin: Event Types' },
  { to: '/admin/bookings', label: 'Admin: Bookings' },
  { to: '/book', label: 'Public: Book' },
]

export function AppLayout() {
  const location = useLocation()

  return (
    <AppShell header={{ height: 74 }}>
      <AppShell.Header>
        <Container size="lg" h="100%">
          <Group h="100%" justify="space-between" wrap="nowrap">
            <Title order={4}>Calls Calendar</Title>
            <Group gap="xs" wrap="wrap" justify="flex-end">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  component={Link}
                  to={link.to}
                  label={link.label}
                  active={location.pathname.startsWith(link.to)}
                />
              ))}
            </Group>
          </Group>
        </Container>
      </AppShell.Header>
      <AppShell.Main>
        <Container size="lg" py="xl">
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  )
}
