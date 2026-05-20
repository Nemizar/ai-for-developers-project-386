import "@typespec/http";
import "@typespec/openapi3";

using TypeSpec.Http;

@service({ title: "Calls Calendar API" })
@server("https://api.example.com", "Production")
namespace CallsCalendar;

alias UtcDateTime = utcDateTime;

model OwnerProfile {
  id: "owner-default";
  displayName: string;
  email?: string;
}

model EventType {
  id: string;
  title: string;
  description: string;
  durationMinutes: int32;
}

model EventTypeInput {
  title: string;
  description: string;
  durationMinutes: int32;
}

model EventTypeUpdate {
  title?: string;
  description?: string;
  durationMinutes?: int32;
}

model Slot {
  startAt: UtcDateTime;
  endAt: UtcDateTime;
}

model Booking {
  id: string;
  eventTypeId: string;
  eventTypeTitle: string;
  startAt: UtcDateTime;
  endAt: UtcDateTime;
  guestName: string;
  guestContact: string;
  note?: string;
  createdAt: UtcDateTime;
}

model CreateBookingRequest {
  eventTypeId: string;
  startAt: UtcDateTime;
  guestName: string;
  guestContact: string;
  note?: string;
}

model AvailabilityWindow {
  from: UtcDateTime;
  to: UtcDateTime;
  slotStepMinutes: int32;
}

@error
model ApiError {
  code: string;
  message: string;
  details?: string;
}

@error
model NotFoundError {
  ...ApiError;
}

@error
model ValidationError {
  ...ApiError;
}

@error
model ConflictError {
  ...ApiError;
}

interface AdminApi {
  @get
  @route("/admin/owner")
  getOwnerProfile(): OwnerProfile;

  @get
  @route("/admin/event-types")
  listEventTypes(): EventType[];

  @post
  @route("/admin/event-types")
  createEventType(@body input: EventTypeInput): EventType;

  @patch
  @route("/admin/event-types/{eventTypeId}")
  updateEventType(@path eventTypeId: string, @body input: EventTypeUpdate): EventType | NotFoundError;

  @delete
  @route("/admin/event-types/{eventTypeId}")
  deleteEventType(@path eventTypeId: string): void | NotFoundError;

  @get
  @route("/admin/bookings")
  listUpcomingBookings(
    @query from?: UtcDateTime,
    @query to?: UtcDateTime
  ): Booking[] | ValidationError;
}

interface PublicApi {
  @get
  @route("/public/event-types")
  listPublicEventTypes(): EventType[];

  @get
  @route("/public/event-types/{eventTypeId}/slots")
  listAvailableSlots(
    @path eventTypeId: string,
    @query from?: UtcDateTime,
    @query to?: UtcDateTime
  ): {
    window: AvailabilityWindow;
    slots: Slot[];
  } | NotFoundError | ValidationError;

  @post
  @route("/public/bookings")
  createBooking(@body input: CreateBookingRequest): Booking | NotFoundError | ValidationError | ConflictError;
}

@doc("All interfaces in a single API contract.")
interface CalendarApi extends AdminApi, PublicApi {}
