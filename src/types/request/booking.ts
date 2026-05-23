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
  createdById?: string;
  fullName?: string;
  phone?: string;
  email?: string;
  checkInDate: Date;
  checkOutDate: Date;
  numberOfGuests: number;
  promotionId?: string;
  notes?: string;
  paymentMethod?: string;
  rooms: CreateBookingRoom[];
  services: CreateBookingService[];
}
