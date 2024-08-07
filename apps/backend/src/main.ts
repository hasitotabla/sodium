import { NestFactory } from '@nestjs/core';
import { HttpException, ValidationPipe } from '@nestjs/common';

import { NextFunction, Request, Response } from 'express';
import { ValidationError } from 'class-validator';

import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
// import { setupCSRF } from './utilities/xsrf';

const allowedOrigins = process.env.CORS_ORIGIN.split(',').reduce(
  (prev, curr) => ({
    ...prev,
    [curr]: true,
  }),
  { localhost: true },
);

(async () => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    credentials: true,
    exposedHeaders: ['x-csrf-token'],
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      const hostname = new URL(origin).hostname;
      if (!hostname) {
        return callback(null, true);
      }

      if (!allowedOrigins[hostname]) {
        return callback(new Error('Not allowed by CORS'));
      }

      return callback(null, true);
    },
  });

  // app.use(cookieParser());
  // app.use(csurf());

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (process.env.CUSTOM_POWERED_BY_HEADER !== 'false')
      res.setHeader('x-powered-by', process.env.CUSTOM_POWERED_BY_HEADER);

    // const token = req.csrfToken();

    // res.setHeader('x-xsrf-token', token);
    // res.locals.csrfToken = token;

    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      disableErrorMessages: false,
      exceptionFactory: function (validationErrors: ValidationError[]) {
        const modifiedError = [];

        validationErrors.forEach((error) => {
          for (const message of Object.values(error.constraints)) {
            let errorObj: any;

            try {
              const parsed = JSON.parse(message);

              if (!parsed && typeof parsed !== 'object')
                throw new Error('still not an object');

              errorObj = parsed;
            } catch (e) {
              errorObj = {
                message,
                parameters: error.property,
              };
            }

            modifiedError.push(errorObj);
          }
        });

        return new HttpException(
          {
            message: 'Validation Error',
            additionalInfo: modifiedError,
          },
          400,
        );
      },
    }),
  );

  await app.listen(4500);
})();
