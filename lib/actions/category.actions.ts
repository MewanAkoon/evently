'use server';

import { CreateCategoryParams } from '@/types';
import { handleError } from '../utils';
import { connectToDatabase } from '../database';
import Category, { CategoryDocument } from '../database/models/category.model';

export const createCategory = async ({
	categoryName,
}: CreateCategoryParams): Promise<CategoryDocument> => {
	try {
		await connectToDatabase();
		const newCategory = await Category.create({ name: categoryName });
		return JSON.parse(JSON.stringify(newCategory));
	} catch (error) {
		return handleError(error);
	}
};

export const getAllCategories = async (): Promise<CategoryDocument[]> => {
	try {
		await connectToDatabase();
		const categories = await Category.find();
		return JSON.parse(JSON.stringify(categories));
	} catch (error) {
		return handleError(error);
	}
};
