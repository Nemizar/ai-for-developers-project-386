package httpapi

import (
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"

	"backend/internal/domain"
	"backend/internal/service"
)

type AdminHandlers struct {
	owner       domain.OwnerProfile
	eventTypes  *service.EventTypeService
	bookingsSvc *service.BookingService
}

func NewAdminHandlers(owner domain.OwnerProfile, eventTypes *service.EventTypeService, bookings *service.BookingService) *AdminHandlers {
	return &AdminHandlers{owner: owner, eventTypes: eventTypes, bookingsSvc: bookings}
}

func (h *AdminHandlers) GetOwnerProfile(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, h.owner)
}

func (h *AdminHandlers) ListEventTypes(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, h.eventTypes.List())
}

func (h *AdminHandlers) CreateEventType(w http.ResponseWriter, r *http.Request) {
	var input domain.EventTypeInput
	if err := decodeJSON(r, &input); err != nil {
		writeError(w, err)
		return
	}

	item, err := h.eventTypes.Create(input)
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, item)
}

func (h *AdminHandlers) UpdateEventType(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "eventTypeId")
	var input domain.EventTypeUpdate
	if err := decodeJSON(r, &input); err != nil {
		writeError(w, err)
		return
	}

	item, err := h.eventTypes.Update(id, input)
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, item)
}

func (h *AdminHandlers) DeleteEventType(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "eventTypeId")
	if err := h.eventTypes.Delete(id); err != nil {
		writeError(w, err)
		return
	}
	writeNoContent(w)
}

func (h *AdminHandlers) ListUpcomingBookings(w http.ResponseWriter, r *http.Request) {
	from, err := parseOptionalTime(r.URL.Query().Get("from"))
	if err != nil {
		writeError(w, err)
		return
	}
	to, err := parseOptionalTime(r.URL.Query().Get("to"))
	if err != nil {
		writeError(w, err)
		return
	}

	rows, svcErr := h.bookingsSvc.ListUpcoming(from, to)
	if svcErr != nil {
		writeError(w, svcErr)
		return
	}
	writeJSON(w, http.StatusOK, rows)
}

func parseOptionalTime(raw string) (*time.Time, error) {
	if raw == "" {
		return nil, nil
	}
	t, err := time.Parse(time.RFC3339, raw)
	if err != nil {
		return nil, domain.NewValidationError("invalid_datetime", "Invalid datetime", err.Error())
	}
	t = t.UTC()
	return &t, nil
}
