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

export type FindAllRoomsResponse = {
  data: RoomResponse[];
  total: number;
  pageNum: number;
  pageSize: number;
};

export type RoomsFilter = {
  roomTypeCode?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
  pageNum?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}