import { request, toQuery } from './http'
import type {
  AvailableSlotsResponse,
  Booking,
  CreateBookingRequest,
  EventType,
  EventTypeInput,
  EventTypeUpdate,
  OwnerProfile,
} from './types'

export const api = {
  getOwnerProfile: () => request<OwnerProfile>('/admin/owner'),
  listEventTypes: () => request<EventType[]>('/admin/event-types'),
  createEventType: (input: EventTypeInput) =>
    request<EventType>('/admin/event-types', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  updateEventType: (eventTypeId: string, input: EventTypeUpdate) =>
    request<EventType>(`/admin/event-types/${eventTypeId}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
  deleteEventType: (eventTypeId: string) =>
    request<void>(`/admin/event-types/${eventTypeId}`, {
      method: 'DELETE',
    }),
  listUpcomingBookings: (from?: string, to?: string) =>
    request<Booking[]>(`/admin/bookings${toQuery({ from, to })}`),
  listPublicEventTypes: () => request<EventType[]>('/public/event-types'),
  listAvailableSlots: (eventTypeId: string, from?: string, to?: string) =>
    request<AvailableSlotsResponse>(`/public/event-types/${eventTypeId}/slots${toQuery({ from, to })}`),
  createBooking: (input: CreateBookingRequest) =>
    request<Booking>('/public/bookings', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
}
