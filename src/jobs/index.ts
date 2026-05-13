import { startBookingExpirationJob } from "./booking-expiration.job";

export const startJobs = () => {
  startBookingExpirationJob();
};