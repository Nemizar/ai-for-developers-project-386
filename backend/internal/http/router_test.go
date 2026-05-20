package httpapi

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"backend/internal/bootstrap"
	"backend/internal/service"
	"backend/internal/store"
)

func TestRootReturnsOK(t *testing.T) {
	owner := bootstrap.DefaultOwner()
	st := store.NewMemoryStore(owner)

	eventSvc := service.NewEventTypeService(st)
	bookSvc := service.NewBookingService(st)
	availSvc := service.NewAvailabilityService(st)

	admin := NewAdminHandlers(owner, eventSvc, bookSvc)
	public := NewPublicHandlers(eventSvc, availSvc, bookSvc)
	router := NewRouter(admin, public)

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	resp := httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	if resp.Code != http.StatusOK {
		t.Fatalf("expected 200 for root path, got %d", resp.Code)
	}
}
