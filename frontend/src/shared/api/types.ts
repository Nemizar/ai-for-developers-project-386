export type UtcDateTime = string

export type OwnerProfile = {
  id: 'owner-default'
  displayName: string
  email?: string
}

export type EventType = {
  id: string
  title: string
  description: string
  durationMinutes: number
}

export type EventTypeInput = {
  title: string
  description: string
  durationMinutes: number
}

export type EventTypeUpdate = Partial<EventTypeInput>

export type Slot = {
  startAt: UtcDateTime
  endAt: UtcDateTime
}

export type Booking = {
  id: string
  eventTypeId: string
  eventTypeTitle: string
  startAt: UtcDateTime
  endAt: UtcDateTime
  guestName: string
  guestContact: string
  note?: string
  createdAt: UtcDateTime
}

export type CreateBookingRequest = {
  eventTypeId: string
  startAt: UtcDateTime
  guestName: string
  guestContact: string
  note?: string
}

export type AvailabilityWindow = {
  from: UtcDateTime
  to: UtcDateTime
  slotStepMinutes: number
}

export type AvailableSlotsResponse = {
  window: AvailabilityWindow
  slots: Slot[]
}

export type ApiErrorPayload = {
  code: string
  message: string
  details?: string
}
