import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer, } from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from './ws-jwt.guard';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking, BookingDocument } from 'src/customers/booking/schemas/booking.schema';

@WebSocketGateway({
  cors: { origin: '*' },
})
@UseGuards(WsJwtGuard)
export class LiveTrackingGateway {
  @WebSocketServer()
  server: Server;
  constructor(
    @InjectModel(Booking.name) private readonly bookingModel: Model<BookingDocument>,) { }

  // CUSTOMER + DRIVER joins booking room
  @SubscribeMessage('joinBooking')
  handleJoin(
    @MessageBody() data: { bookingId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`booking:${data.bookingId}`);
    return { joined: data.bookingId };
  }

  // Leave room (optional)
  @SubscribeMessage('leaveBooking')
  handleLeave(
    @MessageBody() data: { bookingId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`booking:${data.bookingId}`);
  }

  // Emit driver location
  async emitDriverLocation(
    bookingId: string,
    location: { lat: number; lng: number },
  ) {
    // 🔥 Persist last location (important for reconnects)
    await this.bookingModel.findByIdAndUpdate(bookingId, {
      lastDriverLocation: location,
    });

    this.server
      .to(`booking:${bookingId}`)
      .emit('driverLocation', location);
  }

  // Emit Driver Update 
  emitDriverUpdate(
    bookingId: string,
    payload: {
      location: { lat: number; lng: number };
      etaMin: number;
    },
  ) {
    this.server
      .to(`booking:${bookingId}`)
      .emit('driver:update', payload);
  }

  // Stop tracking
  stopTracking(bookingId: string) {
    this.server
      .to(`booking:${bookingId}`)
      .emit('tripCompleted');
  }
}
