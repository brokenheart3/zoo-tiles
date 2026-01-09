import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  hints: {
    free: number;
    purchased: number;
    lastDailyRefresh: Date;
  };
  stats: {
    puzzlesSolved: number;
    dailyStreak: number;
    totalPoints: number;
    bestTime: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  hints: {
    free: { type: Number, default: 4, min: 0, max: 4 },
    purchased: { type: Number, default: 0, min: 0 },
    lastDailyRefresh: { type: Date, default: Date.now }
  },
  stats: {
    puzzlesSolved: { type: Number, default: 0, min: 0 },
    dailyStreak: { type: Number, default: 0, min: 0 },
    totalPoints: { type: Number, default: 0, min: 0 },
    bestTime: { type: Number, default: 0, min: 0 }
  }
}, { 
  timestamps: true 
});

export default mongoose.model<IUser>('User', UserSchema);