'use server';

import {
	CreateEventParams,
	DeleteEventParams,
	GetAllEventsParams,
	GetEventsByUserParams,
	GetRelatedEventsByCategoryParams,
	UpdateEventParams,
} from '@/types';
import { handleError } from '../utils';
import { connectToDatabase } from '../database';
import User from '../database/models/user.model';
import Event, { EventDocument } from '../database/models/event.model';
import { revalidatePath } from 'next/cache';
import { FilterQuery, Query, _FilterQuery } from 'mongoose';
import Category from '../database/models/category.model';

const populate = <T>(query: Query<T, EventDocument>) => {
	return query
		.populate('organizer', '_id firstName lastName')
		.populate('category', '_id name');
};

const getCategoryByName = async (name: string) => {
	return Category.findOne({ name: { $regex: name, $options: 'i' } });
};

export const createEvent = async ({
	event,
	path,
	userId,
}: CreateEventParams): Promise<EventDocument> => {
	try {
		await connectToDatabase();

		const organizer = await User.findById(userId);

		if (!organizer) throw new Error('Organizer not found');

		const newEvent = await Event.create({
			...event,
			price: event.price || null,
			category: event.categoryId,
			organizer: userId,
		});

		return JSON.parse(JSON.stringify(newEvent));
	} catch (error) {
		return handleError(error);
	}
};

export const getEventById = async (eventId: string): Promise<EventDocument> => {
	try {
		await connectToDatabase();

		const event = await populate(Event.findById(eventId));

		if (!event) throw new Error('Event not found');

		return JSON.parse(JSON.stringify(event));
	} catch (error) {
		return handleError(error);
	}
};

export const deleteEvent = async ({ eventId, path }: DeleteEventParams) => {
	try {
		await connectToDatabase();

		const deletedEvent = await Event.findByIdAndDelete(eventId);
		if (deletedEvent) revalidatePath(path);
	} catch (error) {
		return handleError(error);
	}
};

export const getAllEvents = async ({
	query,
	limit = 6,
	page,
	category,
}: GetAllEventsParams): Promise<{
	data: EventDocument[];
	totalPages: number;
}> => {
	try {
		await connectToDatabase();

		const titleCondition = query
			? { title: { $regex: query, $options: 'i' } }
			: {};
		const categoryCondition = category
			? await getCategoryByName(category)
			: null;

		const filterQuery: FilterQuery<EventDocument> = {
			$and: [
				titleCondition,
				categoryCondition ? { category: categoryCondition._id } : {},
			],
		};

		const skipAmount = (Number(page) - 1) * limit;

		const eventsQuery = Event.find(filterQuery)
			.sort({ createdAt: 'desc' })
			.skip(skipAmount)
			.limit(6);

		const events = await populate(eventsQuery);
		const eventsCount = await Event.countDocuments(filterQuery);

		if (!events) throw new Error('Events not found');

		return {
			data: JSON.parse(JSON.stringify(events)),
			totalPages: Math.ceil(eventsCount / limit),
		};
	} catch (error) {
		return handleError(error);
	}
};

export async function updateEvent({ userId, event, path }: UpdateEventParams) {
	try {
		await connectToDatabase();

		const eventToUpdate = await Event.findById(event._id);
		if (!eventToUpdate || eventToUpdate.organizer.toString() !== userId) {
			throw new Error('Unauthorized or event not found');
		}

		const updatedEvent = await Event.findByIdAndUpdate(
			event._id,
			{ ...event, category: event.categoryId },
			{ new: true }
		);
		revalidatePath(path);

		return JSON.parse(JSON.stringify(updatedEvent));
	} catch (error) {
		handleError(error);
	}
}

export async function getEventsByUser({
	userId,
	limit = 6,
	page,
}: GetEventsByUserParams) {
	try {
		await connectToDatabase();

		const conditions = { organizer: userId };
		// const skipAmount = (page - 1) * limit;

		const eventsQuery = Event.find(conditions)
			.sort({ createdAt: 'desc' })
			.skip(0)
			.limit(limit);

		const events = await populate(eventsQuery);
		const eventsCount = await Event.countDocuments(conditions);

		return {
			data: JSON.parse(JSON.stringify(events)),
			totalPages: Math.ceil(eventsCount / limit),
		};
	} catch (error) {
		handleError(error);
	}
}

// GET RELATED EVENTS: EVENTS WITH SAME CATEGORY
export async function getRelatedEventsByCategory({
	categoryId,
	eventId,
	limit = 3,
	page = 1,
}: GetRelatedEventsByCategoryParams) {
	try {
		await connectToDatabase();

		// const skipAmount = (Number(page) - 1) * limit;
		const conditions = {
			$and: [{ category: categoryId }, { _id: { $ne: eventId } }],
		};

		const eventsQuery = Event.find(conditions)
			.sort({ createdAt: 'desc' })
			.skip(0)
			.limit(limit);

		const events = await populate(eventsQuery);
		const eventsCount = await Event.countDocuments(conditions);

		return {
			data: JSON.parse(JSON.stringify(events)),
			totalPages: Math.ceil(eventsCount / limit),
		};
	} catch (error) {
		handleError(error);
	}
}
