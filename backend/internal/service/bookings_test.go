package service

import (
	"testing"
	"time"

	"backend/internal/bootstrap"
	"backend/internal/domain"
	"backend/internal/store"
)

func TestBookingConflict(t *testing.T) {
	st := store.NewMemoryStore(bootstrap.DefaultOwner())
	st.UpsertEventType(domain.EventType{ID: "et1", Title: "Call", Description: "desc", DurationMinutes: 30})
	svc := NewBookingService(st)

	start := time.Date(2026, 1, 5, 10, 0, 0, 0, time.UTC)
	_, err := svc.Create(domain.CreateBookingRequest{
		EventTypeID:  "et1",
		StartAt:      start,
		GuestName:    "Alice",
		GuestContact: "alice@example.com",
	})
	if err != nil {
		t.Fatalf("first booking should succeed: %v", err)
	}

	_, err = svc.Create(domain.CreateBookingRequest{
		EventTypeID:  "et1",
		StartAt:      start.Add(15 * time.Minute),
		GuestName:    "Bob",
		GuestContact: "bob@example.com",
	})
	if err == nil {
		t.Fatalf("second booking should fail with conflict")
	}
}
