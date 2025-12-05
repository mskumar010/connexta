import mongoose, { Schema } from 'mongoose';

export interface IRoom {
	_id: string;
	name: string;
	slug: string;
	description?: string;
	tags: string[];
	members: string[]; // User IDs
	createdBy: string; // User ID
	createdAt: Date;
	updatedAt: Date;
}

const roomSchema = new Schema<IRoom>(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		slug: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		description: {
			type: String,
			trim: true,
		},
		createdBy: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		} as any,
		tags: {
			type: [String],
			required: true,
			default: [],
		},
		members: [
			{
				type: Schema.Types.ObjectId,
				ref: 'User',
			},
		],
	},
	{
		timestamps: true,
	}
);

// Index for faster queries
roomSchema.index({ createdBy: 1 });

export const Room = mongoose.model<IRoom>('Room', roomSchema);

