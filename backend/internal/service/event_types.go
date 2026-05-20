package service

import (
	"strings"

	"github.com/google/uuid"

	"backend/internal/domain"
	"backend/internal/store"
)

type EventTypeService struct {
	store *store.MemoryStore
}

func NewEventTypeService(st *store.MemoryStore) *EventTypeService {
	return &EventTypeService{store: st}
}

func (s *EventTypeService) List() []domain.EventType {
	return s.store.ListEventTypes()
}

func (s *EventTypeService) GetByID(id string) (domain.EventType, error) {
	item, ok := s.store.GetEventType(id)
	if !ok {
		return domain.EventType{}, domain.NewNotFoundError("event_type_not_found", "Event type not found", "")
	}
	return item, nil
}

func (s *EventTypeService) Create(input domain.EventTypeInput) (domain.EventType, error) {
	if err := validateEventTypeInput(input.Title, input.Description, input.DurationMinutes); err != nil {
		return domain.EventType{}, err
	}
	item := domain.EventType{
		ID:              uuid.NewString(),
		Title:           strings.TrimSpace(input.Title),
		Description:     strings.TrimSpace(input.Description),
		DurationMinutes: input.DurationMinutes,
	}
	s.store.UpsertEventType(item)
	return item, nil
}

func (s *EventTypeService) Update(id string, input domain.EventTypeUpdate) (domain.EventType, error) {
	item, ok := s.store.GetEventType(id)
	if !ok {
		return domain.EventType{}, domain.NewNotFoundError("event_type_not_found", "Event type not found", "")
	}

	if input.Title != nil {
		value := strings.TrimSpace(*input.Title)
		if value == "" {
			return domain.EventType{}, domain.NewValidationError("invalid_event_type", "Invalid event type", "title is required")
		}
		item.Title = value
	}
	if input.Description != nil {
		value := strings.TrimSpace(*input.Description)
		if value == "" {
			return domain.EventType{}, domain.NewValidationError("invalid_event_type", "Invalid event type", "description is required")
		}
		item.Description = value
	}
	if input.DurationMinutes != nil {
		if *input.DurationMinutes <= 0 {
			return domain.EventType{}, domain.NewValidationError("invalid_event_type", "Invalid event type", "durationMinutes must be positive")
		}
		item.DurationMinutes = *input.DurationMinutes
	}

	s.store.UpsertEventType(item)
	return item, nil
}

func (s *EventTypeService) Delete(id string) error {
	if ok := s.store.DeleteEventType(id); !ok {
		return domain.NewNotFoundError("event_type_not_found", "Event type not found", "")
	}
	return nil
}

func validateEventTypeInput(title, description string, durationMinutes int32) error {
	if strings.TrimSpace(title) == "" || strings.TrimSpace(description) == "" {
		return domain.NewValidationError("invalid_event_type", "Invalid event type", "title and description are required")
	}
	if durationMinutes <= 0 {
		return domain.NewValidationError("invalid_event_type", "Invalid event type", "durationMinutes must be positive")
	}
	return nil
}
