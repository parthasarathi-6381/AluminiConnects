// app.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

// import routers (use ESM syntax)
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import discussionRoutes from './routes/discussion.routes.js';
import adminRoutes from './routes/admin.routes.js';
import eventRoutes from './routes/event.routes.js';
import jobRoutes from './routes/job.routes.js';
import "./cronJobs/cleanUpEvents.js";
console.log("✅ app.js loaded");

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/discussion', discussionRoutes);
app.use('/api/admin',adminRoutes);
app.use('/api/events',eventRoutes);
app.use("/api/jobs", jobRoutes);

app.get('/', (req, res) => res.send('Alumni Discussion Backend'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error' });
});

export default app;
