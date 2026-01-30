import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IRelease extends Document {
  version: string
  fileName: string
  platform: 'windows' | 'macos' | 'linux' | 'mobile' | 'all'
  platformLabel: string
  size?: string
  changelog?: string
  isLatest: boolean
  createdAt: Date
  updatedAt: Date
}

const ReleaseSchema: Schema = new Schema(
  {
    version: { type: String, required: true, trim: true },
    fileName: { type: String, required: true, trim: true },
    platform: { type: String, enum: ['windows', 'macos', 'linux', 'mobile', 'all'], required: true },
    platformLabel: { type: String, required: true, trim: true },
    size: { type: String, trim: true },
    changelog: { type: String },
    isLatest: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'releases' }
)

const Release: Model<IRelease> = mongoose.models.Release || mongoose.model<IRelease>('Release', ReleaseSchema)
export default Release
