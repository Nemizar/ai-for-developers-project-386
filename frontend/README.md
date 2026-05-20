# Frontend

## Run

1. Copy env: `cp .env.example .env`
2. Install deps: `npm install`
3. Start dev server: `npm run dev`

## API mode

- Prism mode: set `VITE_API_BASE_URL` to Prism URL.
- Backend mode: set `VITE_API_BASE_URL` to backend URL.

## Mock API with Prism

1. Install TypeSpec deps: `cd ../typespec && npm install`
2. Generate OpenAPI: `npm run build`
3. Install frontend deps: `cd ../frontend && npm install`
4. Start Prism mock server: `npm run mock:prism`

## Smoke checks

- Run API smoke checks against current API URL: `npm run smoke:api`
- Override target URL: `SMOKE_API_BASE_URL=http://127.0.0.1:4010 npm run smoke:api`

## Contract source

- TypeSpec contract: `typespec/main.tsp`
