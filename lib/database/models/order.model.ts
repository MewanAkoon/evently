import { Schema, model, models, Document, Model } from 'mongoose';

export interface OrderDocument extends Document {
	createdAt: Date;
	stripeId: string;
	totalAmount: string;
	event: {
		_id: string;
		title: string;
	};
	buyer: {
		_id: string;
		firstName: string;
		lastName: string;
	};
}

export type OrderItem = {
	_id: string;
	totalAmount: string;
	createdAt: Date;
	eventTitle: string;
	eventId: string;
	buyer: string;
};

const orderSchema = new Schema<OrderDocument>({
	createdAt: {
		type: Date,
		default: Date.now,
	},
	stripeId: {
		type: String,
		required: true,
		unique: true,
	},
	totalAmount: {
		type: String,
	},
	event: {
		type: Schema.Types.ObjectId,
		ref: 'Event',
	},
	buyer: {
		type: Schema.Types.ObjectId,
		ref: 'User',
	},
});

const Order: Model<OrderDocument> = models.Order || model('Order', orderSchema);

export default Order;
