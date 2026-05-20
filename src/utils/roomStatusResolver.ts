import { ROOM_DISPLAY_STATUS, RoomDisplayStatusCode } from "../constant/room.constant";

export interface ActiveBookingInfo {
  checkInDate: Date;
  checkOutDate: Date;
}

export interface ResolveRoomStatusInput {
  physicalStatus: string;
  activeBooking?: ActiveBookingInfo | null;
  upcomingBooking?: ActiveBookingInfo | null;
  now: Date;
}

export interface ResolvedRoomStatus {
  displayStatus: RoomDisplayStatusCode;
  displayStatusLabel?: string;
}

export function resolveRoomDisplayStatus({
  physicalStatus,
  activeBooking,
  upcomingBooking,
  now,
}: ResolveRoomStatusInput): RoomDisplayStatusCode {
  if (physicalStatus === ROOM_DISPLAY_STATUS.MAINTENANCE) {
    return ROOM_DISPLAY_STATUS.MAINTENANCE;
  }
  if (
    activeBooking &&
    now >= new Date(activeBooking.checkInDate) &&
    now < new Date(activeBooking.checkOutDate)
  ) {
    return ROOM_DISPLAY_STATUS.OCCUPIED;
  }

  if (physicalStatus === ROOM_DISPLAY_STATUS.CLEANING) {
    return ROOM_DISPLAY_STATUS.CLEANING;
  }

  if (upcomingBooking) {
    const checkIn = new Date(upcomingBooking.checkInDate);
    const isSameDay =
      now.getFullYear() === checkIn.getFullYear() &&
      now.getMonth() === checkIn.getMonth() &&
      now.getDate() === checkIn.getDate();

    if (isSameDay && now < checkIn) {
      return ROOM_DISPLAY_STATUS.RESERVED;
    }
  }

  return ROOM_DISPLAY_STATUS.AVAILABLE;
}
