import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAnnouncement extends Document {
  title: string
  body: string
  type: 'info' | 'warning' | 'maintenance' | 'news'
  active: boolean
  startAt?: Date
  endAt?: Date
  createdAt: Date
  updatedAt: Date
}

const AnnouncementSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    type: { type: String, enum: ['info', 'warning', 'maintenance', 'news'], default: 'news' },
    active: { type: Boolean, default: true },
    startAt: { type: Date },
    endAt: { type: Date },
  },
  { timestamps: true, collection: 'announcements' }
)

const Announcement: Model<IAnnouncement> = mongoose.models.Announcement || mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema)
export default Announcement
