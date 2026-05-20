import {
  ActionIcon,
  Button,
  Card,
  Group,
  Modal,
  NumberInput,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { IconPencil, IconTrash } from '@tabler/icons-react'
import { useEffect, useState } from 'react'

import { api } from '../../shared/api/client'
import { ApiError } from '../../shared/api/http'
import type { EventType } from '../../shared/api/types'
import { RequestState } from '../../shared/ui/request-state'

type FormData = { title: string; description: string; durationMinutes: number }

const emptyForm: FormData = { title: '', description: '', durationMinutes: 30 }

export function AdminEventTypesPage() {
  const [rows, setRows] = useState<EventType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [editing, setEditing] = useState<EventType | null>(null)
  const [opened, { open, close }] = useDisclosure(false)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      setRows(await api.listEventTypes())
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load event types')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const onCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    open()
  }

  const onEdit = (eventType: EventType) => {
    setEditing(eventType)
    setForm({
      title: eventType.title,
      description: eventType.description,
      durationMinutes: eventType.durationMinutes,
    })
    open()
  }

  const onSave = async () => {
    setSaving(true)
    try {
      if (editing) {
        await api.updateEventType(editing.id, form)
        notifications.show({ color: 'green', message: 'Event type updated' })
      } else {
        await api.createEventType(form)
        notifications.show({ color: 'green', message: 'Event type created' })
      }
      close()
      await load()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to save event type'
      notifications.show({ color: 'red', message })
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (eventType: EventType) => {
    const confirmed = window.confirm(`Delete event type "${eventType.title}"?`)
    if (!confirmed) {
      return
    }

    try {
      await api.deleteEventType(eventType.id)
      notifications.show({ color: 'green', message: 'Event type deleted' })
      await load()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to delete event type'
      notifications.show({ color: 'red', message })
    }
  }

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>Event types</Title>
        <Button onClick={onCreate}>Create event type</Button>
      </Group>

      <RequestState isLoading={loading} error={error} isEmpty={rows.length === 0} emptyLabel="No event types yet">
        <Card withBorder>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Title</Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th>Duration</Table.Th>
                <Table.Th w={100}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((row) => (
                <Table.Tr key={row.id}>
                  <Table.Td>{row.title}</Table.Td>
                  <Table.Td>
                    <Text lineClamp={2}>{row.description}</Text>
                  </Table.Td>
                  <Table.Td>{row.durationMinutes} min</Table.Td>
                  <Table.Td>
                    <Group gap={4} wrap="nowrap">
                      <ActionIcon variant="light" onClick={() => onEdit(row)}>
                        <IconPencil size={16} />
                      </ActionIcon>
                      <ActionIcon color="red" variant="light" onClick={() => onDelete(row)}>
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      </RequestState>

      <Modal opened={opened} onClose={close} title={editing ? 'Edit event type' : 'Create event type'} centered>
        <Stack>
          <TextInput
            label="Title"
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.currentTarget.value }))}
          />
          <Textarea
            label="Description"
            minRows={3}
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.currentTarget.value }))}
          />
          <NumberInput
            label="Duration (minutes)"
            min={5}
            max={480}
            value={form.durationMinutes}
            onChange={(value) => setForm((prev) => ({ ...prev, durationMinutes: Number(value) || 30 }))}
          />
          <Button loading={saving} onClick={onSave} disabled={!form.title || !form.description}>
            Save
          </Button>
        </Stack>
      </Modal>
    </Stack>
  )
}
