FROM golang:1.23-alpine AS builder

WORKDIR /app

COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/. .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /bin/server ./cmd/server

FROM alpine:3.20

RUN adduser -D -H appuser
USER appuser

WORKDIR /app

COPY --from=builder /bin/server /app/server

EXPOSE 4010

CMD ["/app/server"]
