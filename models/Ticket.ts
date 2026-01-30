import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IMessage {
  body: string
  fromUser: mongoose.Types.ObjectId
  isStaff: boolean
  createdAt: Date
}

export interface ITicket extends Document {
  userId: mongoose.Types.ObjectId
  subject: string
  messages: IMessage[]
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high'
  assignedTo?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const MessageSchema = new Schema(
  {
    body: { type: String, required: true },
    fromUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isStaff: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  }
)

const TicketSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true, trim: true },
    messages: [MessageSchema],
    status: { type: String, enum: ['open', 'in-progress', 'resolved', 'closed'], default: 'open' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, collection: 'tickets' }
)

const Ticket: Model<ITicket> = mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', TicketSchema)
export default Ticket
