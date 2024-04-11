import { Document, Model, Schema, model, models } from 'mongoose';

export interface UserDocument extends Document {
	clerkId: string;
	email: string;
	username: string;
	firstName: string;
	lastName: string | null;
	photo: string;
}

const userSchema = new Schema<UserDocument>({
	clerkId: { type: String, required: true, unique: true },
	email: { type: String, required: true, unique: true },
	username: { type: String, required: true, unique: true },
	firstName: { type: String, required: true },
	lastName: { type: String, default: null },
	photo: { type: String, required: true },
});

userSchema.index({ clerkId: 1 });

const User: Model<UserDocument> = models.User || model('User', userSchema);

export default User;
