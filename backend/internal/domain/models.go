package domain

import "time"

type OwnerProfile struct {
	ID          string `json:"id"`
	DisplayName string `json:"displayName"`
	Email       string `json:"email,omitempty"`
}

type EventType struct {
	ID              string `json:"id"`
	Title           string `json:"title"`
	Description     string `json:"description"`
	DurationMinutes int32  `json:"durationMinutes"`
}

type EventTypeInput struct {
	Title           string `json:"title"`
	Description     string `json:"description"`
	DurationMinutes int32  `json:"durationMinutes"`
}

type EventTypeUpdate struct {
	Title           *string `json:"title,omitempty"`
	Description     *string `json:"description,omitempty"`
	DurationMinutes *int32  `json:"durationMinutes,omitempty"`
}

type Slot struct {
	StartAt time.Time `json:"startAt"`
	EndAt   time.Time `json:"endAt"`
}

type Booking struct {
	ID             string    `json:"id"`
	EventTypeID    string    `json:"eventTypeId"`
	EventTypeTitle string    `json:"eventTypeTitle"`
	StartAt        time.Time `json:"startAt"`
	EndAt          time.Time `json:"endAt"`
	GuestName      string    `json:"guestName"`
	GuestContact   string    `json:"guestContact"`
	Note           string    `json:"note,omitempty"`
	CreatedAt      time.Time `json:"createdAt"`
}

type CreateBookingRequest struct {
	EventTypeID  string    `json:"eventTypeId"`
	StartAt      time.Time `json:"startAt"`
	GuestName    string    `json:"guestName"`
	GuestContact string    `json:"guestContact"`
	Note         string    `json:"note,omitempty"`
}

type AvailabilityWindow struct {
	From            time.Time `json:"from"`
	To              time.Time `json:"to"`
	SlotStepMinutes int32     `json:"slotStepMinutes"`
}

type AvailableSlotsResponse struct {
	Window AvailabilityWindow `json:"window"`
	Slots  []Slot             `json:"slots"`
}

type APIError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Details string `json:"details,omitempty"`
}
