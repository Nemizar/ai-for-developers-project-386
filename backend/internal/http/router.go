package httpapi

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func NewRouter(admin *AdminHandlers, public *PublicHandlers) http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{"http://localhost:*", "http://127.0.0.1:*"},
		AllowedMethods: []string{"GET", "POST", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Accept", "Authorization", "Content-Type"},
	}))

	r.Get("/", func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	r.Route("/admin", func(ar chi.Router) {
		ar.Get("/owner", admin.GetOwnerProfile)
		ar.Get("/event-types", admin.ListEventTypes)
		ar.Post("/event-types", admin.CreateEventType)
		ar.Patch("/event-types/{eventTypeId}", admin.UpdateEventType)
		ar.Delete("/event-types/{eventTypeId}", admin.DeleteEventType)
		ar.Get("/bookings", admin.ListUpcomingBookings)
	})

	r.Route("/public", func(pr chi.Router) {
		pr.Get("/event-types", public.ListPublicEventTypes)
		pr.Get("/event-types/{eventTypeId}/slots", public.ListAvailableSlots)
		pr.Post("/bookings", public.CreateBooking)
	})

	return r
}
