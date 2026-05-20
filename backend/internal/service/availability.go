package service

import (
	"time"

	"backend/internal/domain"
	"backend/internal/store"
)

const (
	defaultWindowDays  = 14
	defaultStepMinutes = 30
	businessHoursStart = 9
	businessHoursEnd   = 18
)

type AvailabilityService struct {
	store *store.MemoryStore
}

func NewAvailabilityService(st *store.MemoryStore) *AvailabilityService {
	return &AvailabilityService{store: st}
}

func (s *AvailabilityService) ListAvailableSlots(eventTypeID string, from, to *time.Time) (domain.AvailableSlotsResponse, error) {
	eventType, ok := s.store.GetEventType(eventTypeID)
	if !ok {
		return domain.AvailableSlotsResponse{}, domain.NewNotFoundError("event_type_not_found", "Event type not found", "")
	}

	now := time.Now().UTC()
	windowFrom := now
	windowTo := now.Add(defaultWindowDays * 24 * time.Hour)
	if from != nil {
		windowFrom = from.UTC()
	}
	if to != nil {
		windowTo = to.UTC()
	}
	if windowFrom.After(windowTo) {
		return domain.AvailableSlotsResponse{}, domain.NewValidationError("invalid_range", "Invalid range", "from must be before or equal to to")
	}

	bookings := s.store.ListBookingsByEventType(eventTypeID)
	duration := time.Duration(eventType.DurationMinutes) * time.Minute
	step := time.Duration(defaultStepMinutes) * time.Minute
	first := alignToStep(windowFrom, step)

	slots := make([]domain.Slot, 0)
	for start := first; !start.After(windowTo); start = start.Add(step) {
		if start.Hour() < businessHoursStart || start.Hour() >= businessHoursEnd {
			continue
		}
		end := start.Add(duration)
		if end.After(windowTo) {
			continue
		}

		free := true
		for _, item := range bookings {
			if start.Before(item.EndAt) && item.StartAt.Before(end) {
				free = false
				break
			}
		}
		if free {
			slots = append(slots, domain.Slot{StartAt: start, EndAt: end})
		}
	}

	return domain.AvailableSlotsResponse{
		Window: domain.AvailabilityWindow{
			From:            windowFrom,
			To:              windowTo,
			SlotStepMinutes: defaultStepMinutes,
		},
		Slots: slots,
	}, nil
}

func alignToStep(t time.Time, step time.Duration) time.Time {
	t = t.UTC().Truncate(step)
	if t.Before(time.Now().UTC().Add(-step)) {
		return time.Now().UTC().Truncate(step)
	}
	return t
}
