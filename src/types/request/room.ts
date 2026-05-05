import { RoomStatusCode } from "../../constant/room.constant";

export type CreateRoomRequest = {
  roomName: string;
  roomNumber: string;
  roomTypeId: string;
  basePrice: number;
  floor: number;
  maxGuests: number;
  balcony: boolean;
  size?: number;
  bedType?: string;
  view?: string;
  description?: string;
  notes?: string;
  amenityIds?: string[];
  thumbnailUrl?: string;
  imageUrls?: string[];
};

export type UpdateRoomStatusRequest = {
  id: string;
  status: RoomStatusCode;
};

export type UpdateRoomRequest = {
  roomName:    string;
  roomNumber:  string;
  roomTypeId:  string;
  basePrice:   number;
  floor:       number;
  maxGuests:   number;
  balcony:     boolean;
  size?:       number;
  bedType?:    string;
  view?:       string;
  description?: string;
  notes?:      string;
  amenityIds?: string[];
  thumbnailUrl?: string;
  imageUrls?:  string[];
  deleteImageIds?: string[];
};

export type AvailableRoomsRequest = {
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  excludeRoomId?: string;
}

export type MulterFiles = { [fieldname: string]: Express.Multer.File[] };
