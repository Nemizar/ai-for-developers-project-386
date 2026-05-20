package store

import (
	"sort"
	"sync"
	"time"

	"backend/internal/domain"
)

type MemoryStore struct {
	mu         sync.RWMutex
	owner      domain.OwnerProfile
	eventTypes map[string]domain.EventType
	bookings   map[string]domain.Booking
}

func NewMemoryStore(owner domain.OwnerProfile) *MemoryStore {
	return &MemoryStore{
		owner:      owner,
		eventTypes: map[string]domain.EventType{},
		bookings:   map[string]domain.Booking{},
	}
}

func (s *MemoryStore) GetOwner() domain.OwnerProfile {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.owner
}

func (s *MemoryStore) ListEventTypes() []domain.EventType {
	s.mu.RLock()
	defer s.mu.RUnlock()

	result := make([]domain.EventType, 0, len(s.eventTypes))
	for _, item := range s.eventTypes {
		result = append(result, item)
	}
	sort.Slice(result, func(i, j int) bool {
		return result[i].Title < result[j].Title
	})
	return result
}

func (s *MemoryStore) GetEventType(id string) (domain.EventType, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	item, ok := s.eventTypes[id]
	return item, ok
}

func (s *MemoryStore) UpsertEventType(item domain.EventType) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.eventTypes[item.ID] = item
}

func (s *MemoryStore) DeleteEventType(id string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, ok := s.eventTypes[id]; !ok {
		return false
	}
	delete(s.eventTypes, id)
	return true
}

func (s *MemoryStore) ListBookings(from, to *time.Time) []domain.Booking {
	s.mu.RLock()
	defer s.mu.RUnlock()

	result := make([]domain.Booking, 0, len(s.bookings))
	for _, item := range s.bookings {
		if from != nil && item.StartAt.Before(*from) {
			continue
		}
		if to != nil && item.StartAt.After(*to) {
			continue
		}
		result = append(result, item)
	}

	sort.Slice(result, func(i, j int) bool {
		return result[i].StartAt.Before(result[j].StartAt)
	})
	return result
}

func (s *MemoryStore) ListBookingsByEventType(eventTypeID string) []domain.Booking {
	s.mu.RLock()
	defer s.mu.RUnlock()

	result := make([]domain.Booking, 0)
	for _, item := range s.bookings {
		if item.EventTypeID == eventTypeID {
			result = append(result, item)
		}
	}

	sort.Slice(result, func(i, j int) bool {
		return result[i].StartAt.Before(result[j].StartAt)
	})
	return result
}

func (s *MemoryStore) CreateBookingIfSlotFree(booking domain.Booking) bool {
	s.mu.Lock()
	defer s.mu.Unlock()

	for _, item := range s.bookings {
		if item.EventTypeID != booking.EventTypeID {
			continue
		}
		if booking.StartAt.Before(item.EndAt) && item.StartAt.Before(booking.EndAt) {
			return false
		}
	}

	s.bookings[booking.ID] = booking
	return true
}
