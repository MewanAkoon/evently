'use client';

import React, { useState } from 'react';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from '../ui/form';
import { Button } from '../ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../ui/input';
import { EventFormData, eventFormSchema } from '@/lib/validator';
import { eventDefaultValues } from '@/constants';
import Dropdown from './Dropdown';
import { Textarea } from '../ui/textarea';
import FileUploader from './FileUploader';
import Image from 'next/image';

import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';
import { Checkbox } from '../ui/checkbox';
import { useUploadThing } from '@/lib/uploadthing';
import { useRouter } from 'next/navigation';
import { createEvent, updateEvent } from '@/lib/actions/event.actions';
import { EventDocument } from '@/lib/database/models/event.model';

type EventFormProps = {
	userId: string;
	type: 'create' | 'update';
	event?: EventDocument;
	eventId?: string;
};

export default function EventForm({
	userId,
	type,
	event,
	eventId,
}: EventFormProps) {
	const [files, setFiles] = useState<File[]>([]);

	const initialValues: EventFormData =
		event && type === 'update'
			? {
					...event,
					startDateTime: new Date(event.startDateTime),
					endDateTime: new Date(event.endDateTime),
					categoryId: event.category._id,
					price: event.price || '',
					url: event.url || '',
			  }
			: eventDefaultValues;

	const router = useRouter();

	const { startUpload } = useUploadThing('imageUploader');

	const form = useForm<EventFormData>({
		resolver: zodResolver(eventFormSchema),
		defaultValues: initialValues,
	});

	async function onSubmit(values: EventFormData) {
		const eventData = { ...values };

		let uploadedImageUrl = eventData.imageUrl;

		if (files.length > 0) {
			const uploadedImages = await startUpload(files);

			if (!uploadedImages) return;

			uploadedImageUrl = uploadedImages[0].url;
		}

		if (type === 'create') {
			try {
				const newEvent = await createEvent({
					userId,
					event: { ...eventData, imageUrl: uploadedImageUrl },
					path: '/profile',
				});

				if (newEvent) {
					form.reset();
					router.push(`/events/${newEvent._id}`);
				}
			} catch (error) {
				console.error(error);
			}
		}

		if (type === 'update') {
			if (!eventId) {
				router.back();
				return;
			}

			try {
				const updatedEvent = await updateEvent({
					userId,
					event: { ...eventData, _id: eventId, imageUrl: uploadedImageUrl },
					path: '/profile',
				});

				if (updatedEvent) {
					form.reset();
					router.push(`/events/${updatedEvent._id}`);
				}
			} catch (error) {
				console.error(error);
			}
		}
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className='flex flex-col gap-5'
			>
				<div className='flex flex-col gap-5 md:flex-row'>
					<FormField
						control={form.control}
						name='title'
						render={({ field }) => (
							<FormItem className='w-full'>
								<FormControl>
									<Input
										placeholder='Event Title'
										{...field}
										className='input-field'
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name='categoryId'
						render={({ field }) => (
							<FormItem className='w-full'>
								<FormControl>
									<Dropdown
										onChangeHandler={field.onChange}
										value={field.value}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<div className='flex flex-col gap-5 md:flex-row'>
					<FormField
						control={form.control}
						name='description'
						render={({ field }) => (
							<FormItem className='w-full'>
								<FormControl className='h-72'>
									<Textarea
										placeholder='Description'
										{...field}
										className='textarea rounded-2xl'
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name='imageUrl'
						render={({ field }) => (
							<FormItem className='w-full'>
								<FormControl className='h-72'>
									<FileUploader
										onFieldChange={field.onChange}
										imageUrl={field.value}
										setFiles={setFiles}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<div className='flex flex-col gap-5 md:flex-row'>
					<FormField
						control={form.control}
						name='location'
						render={({ field }) => (
							<FormItem className='w-full'>
								<FormControl>
									<div className='flex-center h-[54px] w-full overflow-hidden rounded-full bg-gray-50 px-4 py-2'>
										<Image
											src='/assets/icons/location-grey.svg'
											alt='location'
											width={24}
											height={24}
										/>
										<Input
											placeholder='Event Location or Online'
											{...field}
											className='input-field'
										/>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<div className='flex flex-col gap-5 md:flex-row'>
					<FormField
						control={form.control}
						name='startDateTime'
						render={({ field }) => (
							<FormItem className='w-full'>
								<FormControl>
									<div className='flex-center h-[54px] w-full overflow-hidden rounded-full bg-gray-50 px-4 py-2'>
										<Image
											src='/assets/icons/calendar.svg'
											alt='calendar'
											width={24}
											height={24}
											className='filter-grey'
										/>
										<p className='ml-3 whitespace-nowrap text-gray-600'>
											Start Date:
										</p>
										<DatePicker
											selected={field.value}
											onChange={field.onChange}
											showTimeSelect
											timeInputLabel='Time:'
											dateFormat='MM/dd/yyy h:mm aa'
											wrapperClassName='datePicker'
										/>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name='endDateTime'
						render={({ field }) => (
							<FormItem className='w-full'>
								<FormControl>
									<div className='flex-center h-[54px] w-full overflow-hidden rounded-full bg-gray-50 px-4 py-2'>
										<Image
											src='/assets/icons/calendar.svg'
											alt='calendar'
											width={24}
											height={24}
											className='filter-grey'
										/>
										<p className='ml-3 whitespace-nowrap text-gray-600'>
											End Date:
										</p>
										<DatePicker
											selected={field.value}
											onChange={field.onChange}
											showTimeSelect
											timeInputLabel='Time:'
											dateFormat='MM/dd/yyy h:mm aa'
											wrapperClassName='datePicker'
										/>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<div className='flex flex-col gap-5 md:flex-row'>
					<FormField
						control={form.control}
						name='price'
						render={({ field }) => (
							<FormItem className='w-full'>
								<FormControl>
									<div className='flex-center h-[54px] w-full overflow-hidden rounded-full bg-gray-50 px-4 py-2'>
										<Image
											src='/assets/icons/dollar.svg'
											alt='dollar'
											width={24}
											height={24}
											className='filter-grey'
										/>
										<Input
											type='number'
											placeholder='Price'
											{...field}
											className='p-regular-16 border-0 bg-gray-50 outline-offset-0 focus:border-0 focus-visible:ring-0 focus-visible:ring-offset-0'
										/>
										<FormField
											control={form.control}
											name='isFree'
											render={({ field }) => (
												<FormItem>
													<FormControl>
														<div className='flex items-center'>
															<label
																htmlFor='isFree'
																className='whitespace-nowrap pr-3 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
															>
																Free Ticket
															</label>
															<Checkbox
																id='isFree'
																className='mr-2 h-5 w-5 border-2 border-primary-500'
																checked={field.value}
																onCheckedChange={field.onChange}
															/>
														</div>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name='url'
						render={({ field }) => (
							<FormItem className='w-full'>
								<FormControl>
									<div className='flex-center h-[54px] w-full overflow-hidden rounded-full bg-gray-50 px-4 py-2'>
										<Image
											src='/assets/icons/link.svg'
											alt='link'
											width={24}
											height={24}
										/>
										<Input
											placeholder='URL'
											{...field}
											className='input-field'
										/>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<Button
					type='submit'
					size='lg'
					disabled={form.formState.isSubmitting}
					className='button col-span-2 w-full'
				>
					{form.formState.isSubmitting
						? 'Submitting...'
						: `${type === 'create' ? 'Create' : 'Edit'} Event`}
				</Button>
			</form>
		</Form>
	);
}
