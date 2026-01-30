import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IResource extends Document {
  title: string
  description: string
  type: 'video' | 'pdf' | 'link'
  url?: string
  s3Key?: string
  duration?: string
  size?: string
  level?: 'Beginner' | 'Intermediate' | 'Advanced'
  order: number
  visible: boolean
  createdAt: Date
  updatedAt: Date
}

const ResourceSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['video', 'pdf', 'link'], required: true },
    url: { type: String, trim: true },
    s3Key: { type: String, trim: true },
    duration: { type: String, trim: true },
    size: { type: String, trim: true },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'] },
    order: { type: Number, default: 0 },
    visible: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'resources' }
)

const Resource: Model<IResource> = mongoose.models.Resource || mongoose.model<IResource>('Resource', ResourceSchema)
export default Resource
