import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';

import { mockRequest, mockResponse } from 'mock-req-res';
import { mock, instance, reset, when, verify, anyString } from 'ts-mockito';

import { Context } from '../context/Context';
import { RequestLogger } from '../logger/RequestLogger';
import { GroupService } from '../service/GroupService';
import { Group } from '../model/Group';
import { TranslationDictionary } from '../translation/TranslationDictionary';

import { createGroupRouter } from './createGroupRouter';
import { Permission } from '../model/Permission';
import { UniqueConstraintViolationError } from '../error/UniqueConstraintViolationError';

describe('createGroupRouter', () => {
    const groupServiceMock = mock<GroupService>();
    const requestLoggerMock = mock<RequestLogger>();
    const translationDictionaryMock = mock<TranslationDictionary>();
    const contextMock = mock<Context>();

    const createRouter = () => {
        when(contextMock.requestLogger).thenReturn(instance(requestLoggerMock));
        when(contextMock.translationDictionary).thenReturn(instance(translationDictionaryMock));
        return createGroupRouter(instance(groupServiceMock), instance(contextMock));
    };

    afterEach(() => {
        reset(groupServiceMock);
        reset(requestLoggerMock);
        reset(translationDictionaryMock);
        reset(contextMock);
    });

    describe('create group', () => {
        const group: Group = {
            id: uuid(),
            name: 'name',
            permissions: [Permission.READ]
        };

        let request: Request;

        beforeEach(() => {
            request = mockRequest({
                method: 'POST',
                url: '/create',
                host: ''
            });
            request.body = group;
        });

        const createGroup = (response: Response, nextFn: () => void = jest.fn()) => {
            const router = createRouter();
            return router(request, response, nextFn);
        };


        describe('when group is created', () => {
            let response: Response;

            beforeEach(async () => {
                response = mockResponse();
                response.sendStatus = jest.fn();
                return createGroup(response);
            });

            it('then should return "created" status', async () => {
                expect(response.sendStatus).toHaveBeenCalledWith(201);
            });
        });

        describe('given group violates unique constraint', () => {
            const error = new UniqueConstraintViolationError('stub message');
            const conflictMessage = 'conflict';

            beforeEach(() => {
                when(groupServiceMock.create(group)).thenThrow(error);
                when(translationDictionaryMock.getTranslation(anyString())).thenReturn(conflictMessage);
            });

            describe('when user is requested', () => {
                let response: Response;

                beforeEach(async () => {
                    response = mockResponse();
                    response.json = jest.fn();
                    response.status = jest.fn().mockReturnValue(response);
                    return createGroup(response);
                });

                it('then should write error message to response', async () => {
                    expect(response.json).toHaveBeenCalledWith(conflictMessage);
                });

                it('then should set "conflict" response status', () => {
                    expect(response.status).toHaveBeenCalledWith(422);
                });

                it('then should log warning request message', () => {
                    verify(requestLoggerMock.warn(error.message, request)).once();
                });
            });
        });

        describe('given unknown error occurs', () => {
            const error = new Error('stub message');

            beforeEach(() => {
                when(groupServiceMock.create(group)).thenThrow(error);
            });

            describe('when group is created', () => {
                let spy: () => void;

                beforeEach(async () => {
                    spy = jest.fn();
                    return createGroup(mockResponse(), spy);
                });

                it('then should forward error to the next handler', () => {
                    expect(spy).toHaveBeenCalledWith(error);
                });
            });
        });
    });
});
