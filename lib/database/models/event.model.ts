import { Document, Model, Schema, model, models } from 'mongoose';
import { UserDocument } from './user.model';
import { CategoryDocument } from './category.model';

export interface EventDocument extends Document {
	title: string;
	description: string | null;
	location: string | null;
	createdAt: Date;
	imageUrl: string;
	startDateTime: Date;
	endDateTime: Date;
	price: string;
	isFree: boolean;
	url: string | null;
	category: Pick<CategoryDocument, '_id' | 'name'>;
	organizer: Pick<UserDocument, '_id' | 'firstName' | 'lastName'>;
}

const eventSchema = new Schema({
	title: { type: String, required: true },
	description: { type: String, default: null },
	location: { type: String, default: null },
	createdAt: { type: Date, default: Date.now },
	imageUrl: { type: String, required: true },
	startDateTime: { type: Date, default: Date.now },
	endDateTime: { type: Date, default: Date.now },
	price: { type: String, required: true },
	isFree: { type: Boolean, default: false },
	url: { type: String, default: null },
	category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
	organizer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

const Event: Model<EventDocument> = models.Event || model('Event', eventSchema);

export default Event;
