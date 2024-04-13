'use client';

import React, { startTransition, useEffect, useState } from 'react';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../ui/select';
import { CategoryDocument } from '@/lib/database/models/category.model';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '../ui/alert-dialog';
import { Input } from '../ui/input';
import {
	createCategory,
	getAllCategories,
} from '@/lib/actions/category.actions';

type DropdownProps = {
	value?: string;
	onChangeHandler?: () => void;
};

export default function Dropdown({ value, onChangeHandler }: DropdownProps) {
	const [categories, setCategories] = useState<CategoryDocument[]>([]);

	const [newCategory, setNewCategory] = useState('');

	const handleAddCategory = () => {
		if (!newCategory) return;
		createCategory({ categoryName: newCategory }).then((newCategory) => {
			setCategories((prev) => [...prev, newCategory]);
			setNewCategory('');
		});
	};

	useEffect(() => {
		(async () => {
			const categoryList = await getAllCategories();
			categoryList && setCategories(categoryList);
		})();
	}, []);

	return (
		<Select onValueChange={onChangeHandler} defaultValue={value}>
			<SelectTrigger className='select-field'>
				<SelectValue placeholder='Category' />
			</SelectTrigger>
			<SelectContent>
				{categories.map((category) => (
					<SelectItem
						key={category._id}
						value={category._id}
						className='select-item p-regular-14'
					>
						{category.name}
					</SelectItem>
				))}
				<AlertDialog>
					<AlertDialogTrigger className='p-medium-14 flex w-full rounded-sm py-3 pl-8 text-primary-500 hover:bg-primary-50 focus:text-primary-500'>
						Add new category
					</AlertDialogTrigger>
					<AlertDialogContent className='bg-white'>
						<AlertDialogHeader>
							<AlertDialogTitle>New Category</AlertDialogTitle>
							<AlertDialogDescription>
								<Input
									type='text'
									placeholder='Category Name'
									className='input-field mt-3'
									onChange={(e) => setNewCategory(e.target.value)}
								/>
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								onClick={() => startTransition(handleAddCategory)}
							>
								Continue
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</SelectContent>
		</Select>
	);
}
