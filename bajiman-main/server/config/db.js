import mongoose from "mongoose";

// Serverless-safe: cache the connection across Vercel invocations and never
// process.exit on failure (that kills the function instance mid-request).
let cached = globalThis._mongooseCached;
if (!cached) cached = globalThis._mongooseCached = { conn: null, promise: null };

const connectDB = async () => {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 })
      .then((m) => {
        console.log(`✅ Database Name: ${m.connection.name}`);
        return m;
      })
      .catch((err) => {
        cached.promise = null;
        console.error(`❌ MongoDB Error: ${err.message}`);
        throw err;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
};

export default connectDB;
