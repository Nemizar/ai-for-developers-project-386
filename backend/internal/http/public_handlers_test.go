package httpapi

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"backend/internal/bootstrap"
	"backend/internal/domain"
	"backend/internal/service"
	"backend/internal/store"
)

func TestCreateBookingConflict(t *testing.T) {
	owner := bootstrap.DefaultOwner()
	st := store.NewMemoryStore(owner)
	st.UpsertEventType(domain.EventType{ID: "et1", Title: "Call", Description: "desc", DurationMinutes: 30})

	eventSvc := service.NewEventTypeService(st)
	bookSvc := service.NewBookingService(st)
	availSvc := service.NewAvailabilityService(st)

	admin := NewAdminHandlers(owner, eventSvc, bookSvc)
	public := NewPublicHandlers(eventSvc, availSvc, bookSvc)
	router := NewRouter(admin, public)

	start := time.Date(2026, 1, 2, 11, 0, 0, 0, time.UTC).Format(time.RFC3339)
	body := map[string]any{
		"eventTypeId":  "et1",
		"startAt":      start,
		"guestName":    "Alice",
		"guestContact": "alice@example.com",
	}
	raw, _ := json.Marshal(body)

	req1 := httptest.NewRequest(http.MethodPost, "/public/bookings", bytes.NewReader(raw))
	req1.Header.Set("Content-Type", "application/json")
	resp1 := httptest.NewRecorder()
	router.ServeHTTP(resp1, req1)
	if resp1.Code != http.StatusOK {
		t.Fatalf("expected first booking 200, got %d", resp1.Code)
	}

	req2 := httptest.NewRequest(http.MethodPost, "/public/bookings", bytes.NewReader(raw))
	req2.Header.Set("Content-Type", "application/json")
	resp2 := httptest.NewRecorder()
	router.ServeHTTP(resp2, req2)
	if resp2.Code != http.StatusConflict {
		t.Fatalf("expected second booking 409, got %d", resp2.Code)
	}
}
