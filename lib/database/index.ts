import mongoose from 'mongoose';

declare global {
	var mongooseCache:
		| {
				conn: mongoose.Connection | null;
				promise: Promise<mongoose.Connection> | null;
		  }
		| undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

const options: mongoose.ConnectOptions = {
	dbName: 'evently',
	bufferCommands: false,
};

let cached = global.mongooseCache || { conn: null, promise: null };

// A function that checks for existing database connection,
// connects if none exists, and returns the connection.
export async function connectToDatabase() {
	if (!MONGODB_URI) {
		throw new Error(
			'Please define the MONGODB_URI environment variable inside .env.local'
		);
	}

	if (cached.conn) {
		return cached.conn;
	}

	if (!cached.promise) {
		cached.promise = mongoose
			.connect(MONGODB_URI, options)
			.then((mongoose) => {
				return mongoose.connection;
			})
			.catch((err) => {
				// If initial connection fails, log the error and throw it
				console.error('MongoDB connection error:', err);
				cached.promise = null; // Reset promise to allow for future connection attempts
				throw err;
			});
	}

	cached.conn = await cached.promise;
	return cached.conn;
}
