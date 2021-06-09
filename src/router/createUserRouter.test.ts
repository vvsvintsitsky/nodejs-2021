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
        const userId = uuid();
        let request: Request;

        const getUser = (response: Response, nextFn: () => void = jest.fn()) => {
            const router = createRouter();
            return router(request, response, nextFn);
        };

        beforeEach(() => {
            request = mockRequest({
                method: 'GET',
                url: `/user/${userId}`,
                host: ''
            });
        });

        describe('given user is present', () => {
            const user: User = {
                age: 20,
                id: userId,
                isDeleted: false,
                login: 'login',
                password: 'password'
            };

            beforeEach(() => {
                when(userServiceMock.getById(user.id)).thenReturn(
                    Promise.resolve(user)
                );
            });

            describe('when user is requested', () => {
                let response: Response;

                beforeEach(async () => {
                    response = mockResponse();
                    response.json = jest.fn();
                    return getUser(response);
                });

                it('then should return user json', async () => {
                    expect(response.json).toHaveBeenCalledWith(user);
                });
            });
        });

        describe('given user is missing', () => {
            const error = new EntityNotFoundError('stub message');

            beforeEach(() => {
                when(userServiceMock.getById(userId)).thenThrow(error);
            });

            describe('when user is requested', () => {
                let response: Response;

                beforeEach(async () => {
                    response = mockResponse();
                    response.json = jest.fn();
                    response.status = jest.fn().mockReturnValue(response);
                    return getUser(response);
                });

                it('then should write error message to response', async () => {
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
            const error = new Error('stub message');

            beforeEach(() => {
                when(userServiceMock.getById(userId)).thenThrow(error);
            });

            describe('when user is requested', () => {
                let spy: () => void;

                beforeEach(async () => {
                    spy = jest.fn();
                    return getUser(mockResponse(), spy);
                });

                it('then should forward error to the next handler', () => {
                    expect(spy).toHaveBeenCalledWith(error);
                });
            });
        });
    });
});
