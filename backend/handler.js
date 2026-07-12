import awsLambdaFastify from '@fastify/aws-lambda';
import app from './server.js';

// Register the adapter before ready() so decorators are added before start
const adapter = awsLambdaFastify(app);
const initPromise = app.ready();

export const lambdaHandler = async (event, context) => {
  await initPromise;
  return adapter(event, context);
};
