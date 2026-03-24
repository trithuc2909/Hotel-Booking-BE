export type AmenityResponse = {
  id: string;
  name: string;
  icon: string | null;
}

export type RoomResponse = {
  id: string;
  roomTypeId: string;
  roomTypeName: string;
  roomTypeCode: string;
  roomNumber: string;
  roomName: string;
  notes: string;
  basePrice: number;
  maxGuests: number;
  thumbnailUrl: string;
  rating: number | null;
  status: string;
  amenities: AmenityResponse[];
}

export type RoomsFilter = {
  roomTypeCode?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  limit?: number;
}