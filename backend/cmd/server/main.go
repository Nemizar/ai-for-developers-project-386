package main

import (
	"log"
	"net/http"
	"os"

	"backend/internal/bootstrap"
	httpapi "backend/internal/http"
	"backend/internal/service"
	"backend/internal/store"
)

func main() {
	owner := bootstrap.DefaultOwner()
	st := store.NewMemoryStore(owner)
	for _, item := range bootstrap.DefaultEventTypes() {
		st.UpsertEventType(item)
	}

	eventTypeSvc := service.NewEventTypeService(st)
	bookingSvc := service.NewBookingService(st)
	availabilitySvc := service.NewAvailabilityService(st)

	adminHandlers := httpapi.NewAdminHandlers(owner, eventTypeSvc, bookingSvc)
	publicHandlers := httpapi.NewPublicHandlers(eventTypeSvc, availabilitySvc, bookingSvc)

	router := httpapi.NewRouter(adminHandlers, publicHandlers)

	port := os.Getenv("PORT")
	if port == "" {
		port = "4010"
	}

	addr := ":" + port
	log.Printf("backend listening on %s", addr)
	if err := http.ListenAndServe(addr, router); err != nil {
		log.Fatal(err)
	}
}
