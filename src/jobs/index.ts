import { startBookingExpirationJob } from "./booking-expiration.job";
import { startBookingAutoCheckoutJob } from "./booking-auto-checkout.job";

export const startJobs = () => {
  startBookingExpirationJob();
  startBookingAutoCheckoutJob();
};