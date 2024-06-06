'use client';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { cn } from '@/lib/utils';
import { Button } from '@/Components/ui/button';
import { Calendar } from '@/Components/ui/calendar';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/Components/ui/select';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/Components/ui/form';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/Components/ui/popover';
import { Input } from '@/Components/ui/input';
import {
	editTodo,
	fetchTodos,
	setToDoComponents,
	setToDoItem,
} from '../store/todoSlice';
import { ToDoItem } from '@/context/types';

const FormSchema = z.object({
	date: z.date({
		required_error: 'A date is required.',
	}),
	todo: z.string({
		required_error: 'Todo title cannot be empty!',
	}),
	priority: z.string({
		required_error: 'Priority of todo is required',
	}),
});

const EditTodoForm = () => {
	const disDate = new Date();
	disDate.setDate(disDate.getDate() - 1);
	const dispatch = useDispatch<AppDispatch>();
	const { activeCollection, editToDoItem, toDoItems } = useSelector(
		(state: RootState) => state.todos
	);

	const [task, setTask] = useState<string | undefined>(editToDoItem?.task);
	const [priority, setPriority] = useState<number | undefined>(
		editToDoItem?.priority
	);
	const [date, setDate] = useState<Date | undefined>(editToDoItem?.date);

	const handleToSave = () => {
		if (date && task && priority !== undefined && editToDoItem) {
			const todoItem: ToDoItem = {
				id: editToDoItem.id,
				task,
				date,
				priority,
				isCompleted: editToDoItem.isCompleted,
				collection: activeCollection,
			};
			console.log(todoItem);
			dispatch(editTodo(todoItem));
			dispatch(setToDoComponents(<></>));
			dispatch(fetchTodos());
		}
	};

	const handleCancel = () => {
		if (editToDoItem) {
			const updatedToDoItems = [...toDoItems];
			updatedToDoItems.splice(editToDoItem.id - 1, 0, editToDoItem);
			dispatch(setToDoItem(updatedToDoItems));
			dispatch(setToDoComponents(<></>));
		}
	};

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			todo: editToDoItem?.task || '',
			date: editToDoItem ? new Date(editToDoItem.date) : new Date(),
			priority: String(editToDoItem?.priority || ''),
		},
	});

	function onSubmit(data: z.infer<typeof FormSchema>) {
		data ? console.log(data) : console.error('error');
		form.reset();
		handleToSave();
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className={`space-y-4 text-white`}>
				<FormField
					control={form.control}
					name='todo'
					render={({ field }) => (
						<FormItem className='flex gap-x-4 justify-start items-baseline'>
							<FormLabel htmlFor='input-todo'>Title</FormLabel>
							<FormControl>
								<Input
									className='bg-transparent text-inherit border-none outline-none focus:border-none '
									id='input-todo'
									{...field}
									onChange={e => {
										setTask(e.target.value);
										field.onChange(e);
										console.log(e.target.value);
									}}
									placeholder='Enter your todo'
								/>
							</FormControl>
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='date'
					render={({ field }) => (
						<FormItem className='flex gap-x-4 justify-start items-baseline'>
							<FormLabel
								htmlFor='date'
								className='text-white '>
								Date
							</FormLabel>
							<Popover>
								<PopoverTrigger asChild>
									<FormControl>
										<Button
											id='date'
											className={cn(
												'w-min pl-3 text-left font-normal bg-transparent',
												!field.value && 'text-muted-foreground'
											)}>
											{field.value ? (
												format(field.value, 'dd/MM/yyyy')
											) : (
												<span className='opacity-50'>dd/mm/yyyy</span>
											)}
											<CalendarIcon className='ml-2 h-4 w-4 opacity-50' />
										</Button>
									</FormControl>
								</PopoverTrigger>
								<PopoverContent
									className='w-auto p-0'
									align='start'
									onChange={() => {
										console.log(field.value);
										setDate(field.value);
									}}>
									<Calendar
										className='bg-[#131313] text-white rounded-md'
										mode='single'
										selected={field.value}
										onSelect={date => {
											setDate(date);
											field.onChange(date);
										}}
										disabled={date => date < disDate}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='priority'
					render={({ field }) => (
						<FormItem className='flex gap-x-4 justify-start items-baseline'>
							<FormLabel htmlFor='input-priority'>Priority</FormLabel>
							<FormControl>
								<Select
									onValueChange={(value: string) => {
										setPriority(Number(value));
										field.onChange(value);
									}}
									defaultValue={field.value}>
									<SelectTrigger className='w-[180px]'>
										<SelectValue
											placeholder='Select priority'
											onChange={field.onChange}
										/>
									</SelectTrigger>
									<SelectContent className='text-white '>
										<SelectItem value='-1'>Lower</SelectItem>
										<SelectItem value='0'>Normal</SelectItem>
										<SelectItem value='1'>Higher</SelectItem>
									</SelectContent>
								</Select>
							</FormControl>
						</FormItem>
					)}></FormField>
				<Button
					type='submit'
					className='mr-4'>
					Save
				</Button>
				<Button onClick={handleCancel}> Cancel</Button>
			</form>
		</Form>
	);
};

export default EditTodoForm;
