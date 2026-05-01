-- Speed up customer bookings listing and admin filters
CREATE INDEX IF NOT EXISTS idx_bookings_customer_date_time ON bookings (customer_id, booking_date, booking_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status_date ON bookings (status, booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_staff_date ON bookings (staff_id, booking_date);

