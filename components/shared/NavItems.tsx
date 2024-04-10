'use client';

import { headerLinks } from '@/constants';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

export default function NavItems() {
	const pathname = usePathname();

	return (
		<ul className='md:flex-between flex w-full flex-col items-start gap-5 md:flex-row'>
			{headerLinks.map((link) => (
				<li
					key={link.route}
					className={cn(
						'flex-center p-medium whitespace-nowrap',
						pathname === link.route && 'text-primary-500'
					)}
				>
					<Link href={link.route}> {link.label}</Link>
				</li>
			))}
		</ul>
	);
}
