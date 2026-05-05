export interface CreateBookingRoom {
  roomId: string;
  roomName: string;
}

export interface CreateBookingService {
  serviceId: string;
  quantity: number;
}

export interface CreateBookingRequest {
  customerId: string;
  userId?: string;
  checkInDate: Date;
  checkOutDate: Date;
  numberOfGuests: number;
  promotionId?: string;
  notes?: string;
  rooms: CreateBookingRoom[];
  services: CreateBookingService[];
}
