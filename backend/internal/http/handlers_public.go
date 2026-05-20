package httpapi

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"backend/internal/domain"
	"backend/internal/service"
)

type PublicHandlers struct {
	eventTypes   *service.EventTypeService
	availability *service.AvailabilityService
	bookings     *service.BookingService
}

func NewPublicHandlers(eventTypes *service.EventTypeService, availability *service.AvailabilityService, bookings *service.BookingService) *PublicHandlers {
	return &PublicHandlers{eventTypes: eventTypes, availability: availability, bookings: bookings}
}

func (h *PublicHandlers) ListPublicEventTypes(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, h.eventTypes.List())
}

func (h *PublicHandlers) ListAvailableSlots(w http.ResponseWriter, r *http.Request) {
	eventTypeID := chi.URLParam(r, "eventTypeId")
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

	response, svcErr := h.availability.ListAvailableSlots(eventTypeID, from, to)
	if svcErr != nil {
		writeError(w, svcErr)
		return
	}
	writeJSON(w, http.StatusOK, response)
}

func (h *PublicHandlers) CreateBooking(w http.ResponseWriter, r *http.Request) {
	var input domain.CreateBookingRequest
	if err := decodeJSON(r, &input); err != nil {
		writeError(w, err)
		return
	}

	item, err := h.bookings.Create(input)
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, item)
}
