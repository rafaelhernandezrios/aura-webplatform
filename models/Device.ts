import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IDevice extends Document {
  serialNumber: string
  userId?: mongoose.Types.ObjectId
  model: string
  firmwareVersion: string
  status: 'active' | 'inactive' | 'blocked'
  lastSeen?: Date
  createdAt: Date
  updatedAt: Date
}

const DeviceSchema: Schema = new Schema(
  {
    serialNumber: { type: String, required: true, unique: true, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    model: { type: String, required: true, trim: true, default: 'Aura Pro v2.1' },
    firmwareVersion: { type: String, required: true, trim: true, default: '2.1.0' },
    status: { type: String, enum: ['active', 'inactive', 'blocked'], default: 'active' },
    lastSeen: { type: Date },
  },
  { timestamps: true, collection: 'devices' }
)

const Device: Model<IDevice> = mongoose.models.Device || mongoose.model<IDevice>('Device', DeviceSchema)
export default Device
