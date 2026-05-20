package service

import (
	"strings"
	"time"

	"github.com/google/uuid"

	"backend/internal/domain"
	"backend/internal/store"
)

type BookingService struct {
	store *store.MemoryStore
}

func NewBookingService(st *store.MemoryStore) *BookingService {
	return &BookingService{store: st}
}

func (s *BookingService) ListUpcoming(from, to *time.Time) ([]domain.Booking, error) {
	if from != nil && to != nil && from.After(*to) {
		return nil, domain.NewValidationError("invalid_range", "Invalid range", "from must be before or equal to to")
	}
	return s.store.ListBookings(from, to), nil
}

func (s *BookingService) Create(input domain.CreateBookingRequest) (domain.Booking, error) {
	if strings.TrimSpace(input.EventTypeID) == "" {
		return domain.Booking{}, domain.NewValidationError("invalid_booking", "Invalid booking payload", "eventTypeId is required")
	}
	if input.StartAt.IsZero() {
		return domain.Booking{}, domain.NewValidationError("invalid_booking", "Invalid booking payload", "startAt is required")
	}
	if strings.TrimSpace(input.GuestName) == "" || strings.TrimSpace(input.GuestContact) == "" {
		return domain.Booking{}, domain.NewValidationError("invalid_booking", "Invalid booking payload", "guestName and guestContact are required")
	}

	eventType, ok := s.store.GetEventType(input.EventTypeID)
	if !ok {
		return domain.Booking{}, domain.NewNotFoundError("event_type_not_found", "Event type not found", "")
	}

	startAt := input.StartAt.UTC()
	endAt := startAt.Add(time.Duration(eventType.DurationMinutes) * time.Minute)

	booking := domain.Booking{
		ID:             uuid.NewString(),
		EventTypeID:    eventType.ID,
		EventTypeTitle: eventType.Title,
		StartAt:        startAt,
		EndAt:          endAt,
		GuestName:      strings.TrimSpace(input.GuestName),
		GuestContact:   strings.TrimSpace(input.GuestContact),
		Note:           strings.TrimSpace(input.Note),
		CreatedAt:      time.Now().UTC(),
	}

	if ok := s.store.CreateBookingIfSlotFree(booking); !ok {
		return domain.Booking{}, domain.NewConflictError("slot_conflict", "Selected slot is already booked", "")
	}

	return booking, nil
}
