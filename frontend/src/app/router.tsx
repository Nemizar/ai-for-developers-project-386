import { Navigate, Route, Routes } from 'react-router-dom'

import { AppLayout } from './layout'
import { AdminBookingsPage } from '../pages/admin/bookings-page'
import { AdminEventTypesPage } from '../pages/admin/event-types-page'
import { AdminOwnerPage } from '../pages/admin/owner-page'
import { NotFoundPage } from '../pages/fallback/not-found-page'
import { ApiUnavailablePage } from '../pages/fallback/api-unavailable-page'
import { PublicBookingPage } from '../pages/public/booking-page'
import { PublicEventTypesPage } from '../pages/public/event-types-page'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/book" replace />} />
      <Route path="/api-unavailable" element={<ApiUnavailablePage />} />
      <Route element={<AppLayout />}>
        <Route path="/admin/owner" element={<AdminOwnerPage />} />
        <Route path="/admin/event-types" element={<AdminEventTypesPage />} />
        <Route path="/admin/bookings" element={<AdminBookingsPage />} />
        <Route path="/book" element={<PublicEventTypesPage />} />
        <Route path="/book/:eventTypeId" element={<PublicBookingPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
