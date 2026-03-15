export type AmenityResponse = {
  id: string;
  name: string;
  icon: string | null;
}

export type FeaturedRoomResponse = {
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