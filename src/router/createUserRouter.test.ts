import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';

import { mockRequest, mockResponse } from 'mock-req-res';
import { mock, instance, reset, when, verify } from 'ts-mockito';

import { Context } from '../context/Context';
import { RequestLogger } from '../logger/RequestLogger';
import { UserService } from '../service/UserService';

import { createUserRouter } from './createUserRouter';
import { User } from '../model/User';
import { EntityNotFoundError } from '../error/EntityNotFoundError';

describe('createUserRouter', () => {
    const userServiceMock = mock<UserService>();
    const requestLoggerMock = mock<RequestLogger>();
    const contextMock = mock<Context>();

    const createRouter = () => {
        when(contextMock.requestLogger).thenReturn(instance(requestLoggerMock));
        return createUserRouter(instance(userServiceMock), instance(contextMock));
    };

    afterEach(() => {
        reset(userServiceMock);
        reset(requestLoggerMock);
        reset(contextMock);
    });

    describe('get user by id', () => {
        const user: User = {
            age: 20,
            id: uuid(),
            isDeleted: false,
            login: 'login',
            password: 'password'
        };

        describe('given user is present', () => {
            beforeEach(() => {
                when(userServiceMock.getById(user.id)).thenReturn(
                    Promise.resolve(user)
                );
            });

            describe('when user is requested', () => {
                let response: Response;

                beforeEach(async () => {
                    const request = mockRequest({
                        method: 'GET',
                        url: `/user/${user.id}`,
                        host: ''
                    });
                    const router = createRouter();
                    response = mockResponse();
                    response.json = jest.fn();
                    return router(request, response, jest.fn());
                });

                it('then should return user json', async () => {
                    expect(response.json).toHaveBeenCalledWith(user);
                });
            });
        });

        describe('given user is missing', () => {
            const userId = uuid();
            const error = new EntityNotFoundError('stub message');

            beforeEach(() => {
                when(userServiceMock.getById(userId)).thenThrow(error);
            });

            describe('when user is requested', () => {
                let response: Response;
                let request: Request;

                beforeEach(async () => {
                    request = mockRequest({
                        method: 'GET',
                        url: `/user/${userId}`,
                        host: ''
                    });
                    const router = createRouter();
                    response = mockResponse();
                    response.json = jest.fn();
                    response.status = jest.fn().mockReturnValue(response);
                    return router(request, response, jest.fn());
                });

                it('then write error message to response', async () => {
                    expect(response.json).toHaveBeenCalledWith(error.message);
                });

                it('then should set "not found" response status', () => {
                    expect(response.status).toHaveBeenCalledWith(404);
                });

                it('then should log warning request message', () => {
                    verify(requestLoggerMock.warn(error.message, request)).once();
                });
            });
        });

        describe('given unknown error occurs', () => {
            const userId = uuid();
            const error = new Error('stub message');

            beforeEach(() => {
                when(userServiceMock.getById(userId)).thenThrow(error);
            });

            describe('when user is requested', () => {
                let spy: () => void;

                beforeEach(async () => {
                    const request = mockRequest({
                        method: 'GET',
                        url: `/user/${userId}`,
                        host: ''
                    });
                    const router = createRouter();
                    spy = jest.fn();
                    return router(request, mockResponse(), spy);
                });

                it('then should forward error to the next handler', () => {
                    expect(spy).toHaveBeenCalledWith(error);
                });
            });
        });
    });
});
