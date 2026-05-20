package domain

import "errors"

var (
	ErrNotFound   = errors.New("not found")
	ErrValidation = errors.New("validation error")
	ErrConflict   = errors.New("conflict")
)

type AppError struct {
	Kind    error
	Code    string
	Message string
	Details string
}

func (e *AppError) Error() string {
	return e.Message
}

func (e *AppError) Unwrap() error {
	return e.Kind
}

func NewValidationError(code, message, details string) *AppError {
	return &AppError{Kind: ErrValidation, Code: code, Message: message, Details: details}
}

func NewNotFoundError(code, message, details string) *AppError {
	return &AppError{Kind: ErrNotFound, Code: code, Message: message, Details: details}
}

func NewConflictError(code, message, details string) *AppError {
	return &AppError{Kind: ErrConflict, Code: code, Message: message, Details: details}
}
