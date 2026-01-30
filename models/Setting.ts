import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ISetting extends Document {
  key: string
  value: string | number | boolean | object
  updatedAt: Date
}

const SettingSchema: Schema = new Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    value: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true, collection: 'settings' }
)

const Setting: Model<ISetting> = mongoose.models.Setting || mongoose.model<ISetting>('Setting', SettingSchema)
export default Setting
