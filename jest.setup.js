import { app, connectDB, mongoose } from './src/app.js';

global.server;

beforeAll(async () => {
  await connectDB();
  global.server = app.listen(4000);
});

afterAll(async () => {
  await mongoose.connection.close();
  await new Promise(resolve => global.server.close(resolve));
});