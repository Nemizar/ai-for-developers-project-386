# Backend

In-memory Go backend that implements the API contract from `typespec/main.tsp`.

## Run

```bash
go run ./cmd/server
```

Server starts on `http://127.0.0.1:4010` by default.

Optional env:

- `PORT` - custom HTTP port.

## Test

```bash
go test ./...
```
