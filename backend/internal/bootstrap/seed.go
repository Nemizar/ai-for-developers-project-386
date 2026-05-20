package bootstrap

import "backend/internal/domain"

func DefaultOwner() domain.OwnerProfile {
	return domain.OwnerProfile{
		ID:          "owner-default",
		DisplayName: "Alex Owner",
		Email:       "owner@example.com",
	}
}

func DefaultEventTypes() []domain.EventType {
	return []domain.EventType{
		{
			ID:              "event-intro-call",
			Title:           "Intro Call",
			Description:     "Quick intro call",
			DurationMinutes: 30,
		},
		{
			ID:              "event-deep-dive",
			Title:           "Deep Dive",
			Description:     "Detailed technical session",
			DurationMinutes: 60,
		},
	}
}
