package httpapi

import (
	"encoding/json"
	"errors"
	"net/http"

	"backend/internal/domain"
)

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if payload == nil {
		return
	}
	_ = json.NewEncoder(w).Encode(payload)
}

func writeNoContent(w http.ResponseWriter) {
	w.WriteHeader(http.StatusNoContent)
}

func writeError(w http.ResponseWriter, err error) {
	var appErr *domain.AppError
	if errors.As(err, &appErr) {
		status := http.StatusInternalServerError
		switch {
		case errors.Is(appErr, domain.ErrValidation):
			status = http.StatusBadRequest
		case errors.Is(appErr, domain.ErrNotFound):
			status = http.StatusNotFound
		case errors.Is(appErr, domain.ErrConflict):
			status = http.StatusConflict
		}
		writeJSON(w, status, domain.APIError{Code: appErr.Code, Message: appErr.Message, Details: appErr.Details})
		return
	}

	writeJSON(w, http.StatusInternalServerError, domain.APIError{Code: "internal_error", Message: "Internal server error"})
}

func decodeJSON(r *http.Request, dst any) error {
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(dst); err != nil {
		return domain.NewValidationError("invalid_json", "Invalid JSON body", err.Error())
	}
	return nil
}
