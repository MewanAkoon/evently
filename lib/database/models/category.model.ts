import { Document, Model, Schema, model, models } from 'mongoose';

export interface CategoryDocument extends Document {
	_id: string;
	name: string;
}

const categorySchema = new Schema<CategoryDocument>({
	name: { type: String, required: true, unique: true },
});

const Category: Model<CategoryDocument> =
	models.Category || model('Category', categorySchema);

export default Category;
