/* eslint-disable sort-keys */
import { OpenApi3Dot1Object } from '@inversifyjs/open-api-types/v3Dot1';
import express from 'express';
import { Container, Newable } from 'inversify';

import { buildExpressServer } from '../../server/adapter/express/actions/buildExpressServer';
import { Server } from '../../server/models/Server';
import { BaseSwaggerUiController } from '../controllers/BaseSwagggerUiController';
import { swaggerUiControllerExpressBuilder } from './swaggerUiControllerExpressBuilder';

void (async () => {
  const apiPathFixture: string = '/api';
  const specFixture: OpenApi3Dot1Object = {
    openapi: '3.1.0',
    info: {
      title: 'One game API',
      version: '1.0',
    },
    servers: [
      {
        url: 'http://127.0.0.1:8000',
        description: 'Local development server',
      },
      {
        url: 'http://api.cornie.game',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        accessToken: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        refreshToken: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Types: {
          title: 'Types',
          $id: 'https://onegame.schemas/api/types.json',
          anyOf: [
            {
              $ref: 'https://onegame.schemas/api/v1/types.json',
            },
            {
              $ref: 'https://onegame.schemas/api/v2/types.json',
            },
          ],
        },
        TypesV1: {
          title: 'TypesV1',
          $id: 'https://onegame.schemas/api/v1/types.json',
          anyOf: [
            {
              $ref: 'https://onegame.schemas/api/v1/cards/card-array.json',
            },
            {
              $ref: 'https://onegame.schemas/api/v1/cards/card.json',
            },
            {
              $ref: 'https://onegame.schemas/api/v1/errors/error.json',
            },
            {
              $ref: 'https://onegame.schemas/api/v1/games/active-game-slot-cards.json',
            },
            {
              $ref: 'https://onegame.schemas/api/v1/games/active-game-state.json',
            },
            {
              $ref: 'https://onegame.schemas/api/v1/games/finished-game-state.json',
            },
            {
              $ref: 'https://onegame.schemas/api/v1/games/game-array.json',
            },
            {
              $ref: 'https://onegame.schemas/api/v1/games/game-card-spec.json',
            },
            {
              $ref: 'https://onegame.schemas/api/v1/games/game-create-query.json',
            },
            {
              $ref: 'https://onegame.schemas/api/v1/games/game-direction.json',
            },
            {
              $ref: 'https://onegame.schemas/api/v1/games/game-id-slot-create-query.json',
            },
            {
              $ref: 'https://onegame.schemas/api/v1/games/game-id-update-query.json',
            },
            {
              $ref: 'https://onegame.schemas/api/v1/games/game-message-event.json',
            },
            {
              $ref: 'https://onegame.schemas/api/v1/games/game-options.json',
            },
            {
              $ref: 'https://onegame.schemas/api/v1/games/game-slot.json',
            },
            {
              $ref: 'https://onegame.schemas/api/v1/games/game-spec-array.json',
            },
            {
              $ref: 'https://onegame.schemas/api/v1/games/game-spec.json',
            },
            {
              $ref: 'https://onegame.schemas/api/v1/games/game-spec-sort-option.json',
            },
            {
              $ref: 'https://onegame.schemas/api/v1/games/game-updated-message-event.json',
            },
            {
              $ref: 'https://onegame.schemas/api/v1/games/game.json',
            },
            {
              $ref: 'https://onegame.schemas/api/v1/users/maybe-user-array.json',
            },
            {
              $ref: 'https://onegame.schemas/api/v1/games/non-started-game-state.json',
            },
            {
              $ref: 'https://onegame.schemas/api/v1/users/user-code-create-query.json',
            },
            {
              $ref: 'https://onegame.schemas/api/v1/users/user-code-kind.json',
            },
            {
              $ref: 'https://onegame.schemas/api/v1/users/user-create-query.json',
            },
            {
              $ref: 'https://onegame.schemas/api/v1/users/user-detail.json',
            },
            {
              $ref: 'https://onegame.schemas/api/v1/users/user-me-update-query.json',
            },
            {
              $ref: 'https://onegame.schemas/api/v1/users/user-sort-option.json',
            },
            {
              $ref: 'https://onegame.schemas/api/v1/users/user.json',
            },
          ],
        },
        TypesV2: {
          title: 'TypesV2',
          $id: 'https://onegame.schemas/api/v2/types.json',
          anyOf: [
            {
              $ref: 'https://onegame.schemas/api/v2/auth/auth-create-query.json',
            },
            {
              $ref: 'https://onegame.schemas/api/v2/auth/auth.json',
            },
            {
              $ref: 'https://onegame.schemas/api/v2/game-events/game-event.json',
            },
          ],
        },
        ErrorV1: {
          $id: 'https://onegame.schemas/api/v1/errors/error.json',
          title: 'ErrorV1',
          type: 'object',
          additionalProperties: false,
          properties: {
            code: {
              type: 'string',
            },
            description: {
              type: 'string',
            },
            parameters: {
              type: 'object',
            },
          },
          required: ['description'],
        },
        NonStartedGameV1: {
          $id: 'https://onegame.schemas/api/v1/games/non-started-game.json',
          title: 'NonStartedGameV1',
          type: 'object',
          additionalProperties: false,
          properties: {
            id: {
              type: 'string',
            },
            isPublic: {
              type: 'boolean',
            },
            name: {
              type: 'string',
            },
            state: {
              $ref: 'https://onegame.schemas/api/v1/games/non-started-game-state.json',
            },
          },
          required: ['id', 'isPublic', 'state'],
        },
        NonStartedGameStateV1: {
          $id: 'https://onegame.schemas/api/v1/games/non-started-game-state.json',
          title: 'NonStartedGameStateV1',
          type: 'object',
          additionalProperties: false,
          properties: {
            slots: {
              type: 'array',
              items: {
                $ref: 'https://onegame.schemas/api/v1/games/non-started-game-slot.json',
              },
            },
            status: {
              const: 'nonStarted',
              type: 'string',
            },
          },
          required: ['slots', 'status'],
        },
        NonStartedGameSlotV1: {
          $id: 'https://onegame.schemas/api/v1/games/non-started-game-slot.json',
          title: 'NonStartedGameSlotV1',
          type: 'object',
          additionalProperties: false,
          properties: {
            userId: {
              type: ['string'],
            },
          },
          required: ['userId'],
        },
        GameV1: {
          title: 'GameV1',
          $id: 'https://onegame.schemas/api/v1/games/game.json',
          anyOf: [
            {
              $ref: 'https://onegame.schemas/api/v1/games/active-game.json',
            },
            {
              $ref: 'https://onegame.schemas/api/v1/games/finished-game.json',
            },
            {
              $ref: 'https://onegame.schemas/api/v1/games/non-started-game.json',
            },
          ],
        },
        GameUpdatedMessageEventV1: {
          title: 'GameUpdatedMessageEventV1',
          $id: 'https://onegame.schemas/api/v1/games/game-updated-message-event.json',
          type: 'object',
          additionalProperties: false,
          properties: {
            game: {
              $ref: 'https://onegame.schemas/api/v1/games/game.json',
            },
            kind: {
              const: 'game-updated',
            },
          },
          required: ['game', 'kind'],
        },
        GameSpecV1: {
          $id: 'https://onegame.schemas/api/v1/games/game-spec.json',
          title: 'GameSpecV1',
          type: 'object',
          additionalProperties: false,
          properties: {
            cardSpecs: {
              type: 'array',
              items: {
                $ref: 'https://onegame.schemas/api/v1/games/game-card-spec.json',
              },
            },
            gameId: {
              type: 'string',
            },
            gameSlotsAmount: {
              type: 'integer',
            },
            options: {
              $ref: 'https://onegame.schemas/api/v1/games/game-options.json',
            },
          },
          required: ['cardSpecs', 'gameId', 'gameSlotsAmount', 'options'],
        },
        GameSpecSortOptionV1: {
          $id: 'https://onegame.schemas/api/v1/games/game-spec-sort-option.json',
          title: 'GameSpecSortOptionV1',
          type: 'string',
          enum: ['gameIds'],
        },
        GameSpecArrayV1: {
          $id: 'https://onegame.schemas/api/v1/games/game-spec-array.json',
          title: 'GameSpecArrayV1',
          type: 'array',
          items: {
            $ref: 'https://onegame.schemas/api/v1/games/game-spec.json',
          },
        },
        GameSlotV1: {
          title: 'GameSlotV1',
          $id: 'https://onegame.schemas/api/v1/games/game-slot.json',
          anyOf: [
            {
              $ref: 'https://onegame.schemas/api/v1/games/active-game-slot.json',
            },
            {
              $ref: 'https://onegame.schemas/api/v1/games/finished-game-slot.json',
            },
            {
              $ref: 'https://onegame.schemas/api/v1/games/non-started-game-slot.json',
            },
          ],
        },
        GameOptionsV1: {
          title: 'GameOptionsV1',
          $id: 'https://onegame.schemas/api/v1/games/game-options.json',
          type: 'object',
          additionalProperties: false,
          properties: {
            chainDraw2Draw2Cards: {
              type: 'boolean',
            },
            chainDraw2Draw4Cards: {
              type: 'boolean',
            },
            chainDraw4Draw2Cards: {
              type: 'boolean',
            },
            chainDraw4Draw4Cards: {
              type: 'boolean',
            },
            playCardIsMandatory: {
              type: 'boolean',
            },
            playMultipleSameCards: {
              type: 'boolean',
            },
            playWildDraw4IfNoOtherAlternative: {
              type: 'boolean',
            },
          },
          required: [
            'chainDraw2Draw2Cards',
            'chainDraw2Draw4Cards',
            'chainDraw4Draw2Cards',
            'chainDraw4Draw4Cards',
            'playCardIsMandatory',
            'playMultipleSameCards',
            'playWildDraw4IfNoOtherAlternative',
          ],
        },
        GameMessageEventV1: {
          title: 'GameMessageEventV1',
          $id: 'https://onegame.schemas/api/v1/games/game-message-event.json',
          type: 'object',
          additionalProperties: false,
          anyOf: [
            {
              $ref: 'https://onegame.schemas/api/v1/games/game-updated-message-event.json',
            },
          ],
        },
        GameIdUpdateQueryV1: {
          $id: 'https://onegame.schemas/api/v1/games/game-id-update-query.json',
          title: 'GameIdUpdateQueryV1',
          anyOf: [
            {
              $ref: 'https://onegame.schemas/api/v1/games/game-id-draw-cards-query.json',
            },
            {
              $ref: 'https://onegame.schemas/api/v1/games/game-id-pass-turn-query.json',
            },
            {
              $ref: 'https://onegame.schemas/api/v1/games/game-id-play-cards-query.json',
            },
          ],
        },
        GameIdSlotCreateQueryV1: {
          $id: 'https://onegame.schemas/api/v1/games/game-id-slot-create-query.json',
          title: 'GameIdSlotCreateQueryV1',
          type: 'object',
          additionalProperties: false,
          properties: {
            userId: {
              type: ['string'],
            },
          },
          required: ['userId'],
        },
        GameIdPlayCardsQueryV1: {
          $id: 'https://onegame.schemas/api/v1/games/game-id-play-cards-query.json',
          title: 'GameIdPlayCardsQueryV1',
          type: 'object',
          additionalProperties: false,
          properties: {
            cardIndexes: {
              type: 'array',
              items: {
                type: 'number',
              },
            },
            colorChoice: {
              $ref: 'https://onegame.schemas/api/v1/cards/card-color.json',
            },
            kind: {
              const: 'playCards',
              type: 'string',
            },
            slotIndex: {
              type: 'number',
            },
          },
          required: ['cardIndexes', 'kind', 'slotIndex'],
        },
        GameIdPassTurnQueryV1: {
          $id: 'https://onegame.schemas/api/v1/games/game-id-pass-turn-query.json',
          title: 'GameIdPassTurnQueryV1',
          type: 'object',
          additionalProperties: false,
          properties: {
            kind: {
              const: 'passTurn',
              type: 'string',
            },
            slotIndex: {
              type: 'number',
            },
          },
          required: ['kind', 'slotIndex'],
        },
        GameIdDrawCardsQueryV1: {
          $id: 'https://onegame.schemas/api/v1/games/game-id-draw-cards-query.json',
          title: 'GameIdDrawCardsQueryV1',
          type: 'object',
          additionalProperties: false,
          properties: {
            kind: {
              const: 'drawCards',
              type: 'string',
            },
            slotIndex: {
              type: 'number',
            },
          },
          required: ['kind', 'slotIndex'],
        },
        GameDirectionV1: {
          $id: 'https://onegame.schemas/api/v1/games/game-direction.json',
          title: 'GameDirectionV1',
          type: 'string',
          enum: ['antiClockwise', 'clockwise'],
        },
        GameCreateQueryV1: {
          $id: 'https://onegame.schemas/api/v1/games/game-create-query.json',
          title: 'GameCreateQueryV1',
          type: 'object',
          additionalProperties: false,
          properties: {
            gameSlotsAmount: {
              type: 'integer',
            },
            isPublic: {
              type: 'boolean',
            },
            name: {
              type: 'string',
            },
            options: {
              $ref: 'https://onegame.schemas/api/v1/games/game-options.json',
            },
          },
          required: ['gameSlotsAmount', 'options'],
        },
        GameCardSpecV1: {
          $id: 'https://onegame.schemas/api/v1/games/game-card-spec.json',
          title: 'GameCardSpecV1',
          type: 'object',
          additionalProperties: false,
          properties: {
            amount: {
              type: 'integer',
            },
            card: {
              $ref: 'https://onegame.schemas/api/v1/cards/card.json',
            },
          },
          required: ['amount', 'card'],
        },
        GameArrayV1: {
          $id: 'https://onegame.schemas/api/v1/games/game-array.json',
          title: 'GameArrayV1',
          type: 'array',
          items: {
            $ref: 'https://onegame.schemas/api/v1/games/game.json',
          },
        },
        FinishedGameV1: {
          $id: 'https://onegame.schemas/api/v1/games/finished-game.json',
          title: 'FinishedGameV1',
          type: 'object',
          additionalProperties: false,
          properties: {
            id: {
              type: 'string',
            },
            isPublic: {
              type: 'boolean',
            },
            name: {
              type: 'string',
            },
            state: {
              $ref: 'https://onegame.schemas/api/v1/games/finished-game-state.json',
            },
          },
          required: ['id', 'isPublic', 'state'],
        },
        FinishedGameStateV1: {
          $id: 'https://onegame.schemas/api/v1/games/finished-game-state.json',
          title: 'FinishedGameStateV1',
          type: 'object',
          additionalProperties: false,
          properties: {
            slots: {
              type: 'array',
              items: {
                $ref: 'https://onegame.schemas/api/v1/games/finished-game-slot.json',
              },
            },
            status: {
              const: 'finished',
              type: 'string',
            },
          },
          required: ['slots', 'status'],
        },
        FinishedGameSlotV1: {
          $id: 'https://onegame.schemas/api/v1/games/finished-game-slot.json',
          title: 'FinishedGameSlotV1',
          type: 'object',
          additionalProperties: false,
          properties: {
            cardsAmount: {
              type: 'integer',
            },
            userId: {
              type: 'string',
            },
          },
          required: ['cardsAmount', 'userId'],
        },
        ActiveGameV1: {
          $id: 'https://onegame.schemas/api/v1/games/active-game.json',
          title: 'ActiveGameV1',
          type: 'object',
          additionalProperties: false,
          properties: {
            id: {
              type: 'string',
            },
            isPublic: {
              type: 'boolean',
            },
            name: {
              type: 'string',
            },
            state: {
              $ref: 'https://onegame.schemas/api/v1/games/active-game-state.json',
            },
          },
          required: ['id', 'isPublic', 'state'],
        },
        ActiveGameStateV1: {
          $id: 'https://onegame.schemas/api/v1/games/active-game-state.json',
          title: 'ActiveGameStateV1',
          type: 'object',
          additionalProperties: false,
          properties: {
            currentCard: {
              $ref: 'https://onegame.schemas/api/v1/cards/card.json',
            },
            currentColor: {
              $ref: 'https://onegame.schemas/api/v1/cards/card-color.json',
            },
            currentDirection: {
              $ref: 'https://onegame.schemas/api/v1/games/game-direction.json',
            },
            currentPlayingSlotIndex: {
              type: 'number',
            },
            currentTurnCardsDrawn: {
              type: 'boolean',
            },
            currentTurnCardsPlayed: {
              type: 'boolean',
            },
            drawCount: {
              type: 'number',
            },
            lastEventId: {
              type: ['string', 'null'],
            },
            slots: {
              type: 'array',
              items: {
                $ref: 'https://onegame.schemas/api/v1/games/active-game-slot.json',
              },
            },
            status: {
              const: 'active',
              type: 'string',
            },
            turnExpiresAt: {
              format: 'date-time',
              type: 'string',
            },
          },
          required: [
            'currentCard',
            'currentColor',
            'currentDirection',
            'currentPlayingSlotIndex',
            'currentTurnCardsDrawn',
            'currentTurnCardsPlayed',
            'drawCount',
            'lastEventId',
            'slots',
            'status',
            'turnExpiresAt',
          ],
        },
        ActiveGameSlotV1: {
          $id: 'https://onegame.schemas/api/v1/games/active-game-slot.json',
          title: 'ActiveGameSlotV1',
          type: 'object',
          additionalProperties: false,
          properties: {
            cardsAmount: {
              type: 'integer',
            },
            userId: {
              type: 'string',
            },
          },
          required: ['cardsAmount', 'userId'],
        },
        ActiveGameSlotCardsV1: {
          $id: 'https://onegame.schemas/api/v1/games/active-game-slot-cards.json',
          title: 'ActiveGameSlotCardsV1',
          $ref: 'https://onegame.schemas/api/v1/cards/card-array.json',
        },
        WildDraw4CardV1: {
          $id: 'https://onegame.schemas/api/v1/cards/wild-draw-4-card.json',
          title: 'WildDraw4CardV1',
          additionalProperties: false,
          type: 'object',
          properties: {
            kind: {
              const: 'wildDraw4',
              type: 'string',
            },
          },
          required: ['kind'],
        },
        WildCardV1: {
          $id: 'https://onegame.schemas/api/v1/cards/wild-card.json',
          title: 'WildCardV1',
          additionalProperties: false,
          type: 'object',
          properties: {
            kind: {
              const: 'wild',
              type: 'string',
            },
          },
          required: ['kind'],
        },
        SkipCardV1: {
          $id: 'https://onegame.schemas/api/v1/cards/skip-card.json',
          title: 'SkipCardV1',
          additionalProperties: false,
          type: 'object',
          properties: {
            color: {
              $ref: 'https://onegame.schemas/api/v1/cards/card-color.json',
            },
            kind: {
              const: 'skip',
              type: 'string',
            },
          },
          required: ['color', 'kind'],
        },
        ReverseCardV1: {
          $id: 'https://onegame.schemas/api/v1/cards/reverse-card.json',
          title: 'ReverseCardV1',
          additionalProperties: false,
          type: 'object',
          properties: {
            color: {
              $ref: 'https://onegame.schemas/api/v1/cards/card-color.json',
            },
            kind: {
              const: 'reverse',
              type: 'string',
            },
          },
          required: ['color', 'kind'],
        },
        NormalCardV1: {
          $id: 'https://onegame.schemas/api/v1/cards/normal-card.json',
          title: 'NormalCardV1',
          additionalProperties: false,
          type: 'object',
          properties: {
            color: {
              $ref: 'https://onegame.schemas/api/v1/cards/card-color.json',
            },
            kind: {
              const: 'normal',
              type: 'string',
            },
            number: {
              $ref: 'https://onegame.schemas/api/v1/cards/card-number.json',
            },
          },
          required: ['color', 'kind', 'number'],
        },
        DrawCardV1: {
          $id: 'https://onegame.schemas/api/v1/cards/draw-card.json',
          title: 'DrawCardV1',
          additionalProperties: false,
          type: 'object',
          properties: {
            color: {
              $ref: 'https://onegame.schemas/api/v1/cards/card-color.json',
            },
            kind: {
              const: 'draw',
              type: 'string',
            },
          },
          required: ['color', 'kind'],
        },
        CardV1: {
          $id: 'https://onegame.schemas/api/v1/cards/card.json',
          title: 'CardV1',
          anyOf: [
            {
              $ref: 'https://onegame.schemas/api/v1/cards/draw-card.json',
            },
            {
              $ref: 'https://onegame.schemas/api/v1/cards/normal-card.json',
            },
            {
              $ref: 'https://onegame.schemas/api/v1/cards/reverse-card.json',
            },
            {
              $ref: 'https://onegame.schemas/api/v1/cards/skip-card.json',
            },
            {
              $ref: 'https://onegame.schemas/api/v1/cards/wild-card.json',
            },
            {
              $ref: 'https://onegame.schemas/api/v1/cards/wild-draw-4-card.json',
            },
          ],
        },
        CardNumberV1: {
          $id: 'https://onegame.schemas/api/v1/cards/card-number.json',
          title: 'CardNumberV1',
          type: 'integer',
          maximum: 9,
          minimum: 0,
        },
        CardColorV1: {
          $id: 'https://onegame.schemas/api/v1/cards/card-color.json',
          title: 'CardColorV1',
          type: 'string',
          enum: ['blue', 'green', 'red', 'yellow'],
        },
        CardArrayV1: {
          $id: 'https://onegame.schemas/api/v1/cards/card-array.json',
          title: 'CardArrayV1',
          type: 'array',
          items: {
            $ref: 'https://onegame.schemas/api/v1/cards/card.json',
          },
        },
        UserV1: {
          $id: 'https://onegame.schemas/api/v1/users/user.json',
          title: 'UserV1',
          type: 'object',
          additionalProperties: false,
          properties: {
            active: {
              type: 'boolean',
            },
            id: {
              type: 'string',
            },
            name: {
              type: 'string',
            },
          },
          required: ['active', 'id', 'name'],
        },
        UserSortOptionV1: {
          $id: 'https://onegame.schemas/api/v1/users/user-sort-option.json',
          title: 'UserSortOptionV1',
          type: 'string',
          enum: ['ids'],
        },
        UserMeUpdateQueryV1: {
          $id: 'https://onegame.schemas/api/v1/users/user-me-update-query.json',
          title: 'UserMeUpdateQueryV1',
          type: 'object',
          additionalProperties: false,
          properties: {
            active: {
              const: true,
              type: 'boolean',
            },
            name: {
              type: 'string',
            },
            password: {
              type: 'string',
            },
          },
        },
        UserDetailV1: {
          $id: 'https://onegame.schemas/api/v1/users/user-detail.json',
          title: 'UserDetailV1',
          type: 'object',
          additionalProperties: false,
          properties: {
            email: {
              type: 'string',
            },
          },
          required: ['email'],
        },
        UserCreateQueryV1: {
          $id: 'https://onegame.schemas/api/v1/users/user-create-query.json',
          title: 'UserCreateQueryV1',
          type: 'object',
          additionalProperties: false,
          properties: {
            email: {
              type: 'string',
            },
            name: {
              type: 'string',
            },
            password: {
              type: 'string',
            },
          },
          required: ['email', 'name', 'password'],
        },
        UserCodeKindV1: {
          $id: 'https://onegame.schemas/api/v1/users/user-code-kind.json',
          title: 'UserCodeKindV1',
          enum: ['registerConfirm', 'resetPassword'],
          type: 'string',
        },
        UserCodeCreateQueryV1: {
          $id: 'https://onegame.schemas/api/v1/users/user-code-create-query.json',
          title: 'UserCodeCreateQueryV1',
          type: 'object',
          additionalProperties: false,
          properties: {
            kind: {
              $ref: 'https://onegame.schemas/api/v1/users/user-code-kind.json',
            },
          },
          required: ['kind'],
        },
        MaybeUserArrayV1: {
          $id: 'https://onegame.schemas/api/v1/users/maybe-user-array.json',
          title: 'MaybeUserArrayV1',
          items: {
            anyOf: [
              {
                $ref: 'https://onegame.schemas/api/v1/users/user.json',
              },
              {
                type: 'null',
              },
            ],
          },
          type: 'array',
        },
        TurnPassedGameEventV2: {
          $id: 'https://onegame.schemas/api/v2/game-events/turn-passed-game-event.json',
          title: 'TurnPassedGameEventV2',
          additionalProperties: false,
          type: 'object',
          properties: {
            currentPlayingSlotIndex: {
              type: 'integer',
            },
            kind: {
              const: 'turnPassed',
              type: 'string',
            },
            nextPlayingSlotIndex: {
              type: ['integer', 'null'],
            },
            position: {
              type: 'integer',
            },
          },
          required: [
            'currentPlayingSlotIndex',
            'kind',
            'nextPlayingSlotIndex',
            'position',
          ],
        },
        GameEventV2: {
          title: 'GameEventV2',
          $id: 'https://onegame.schemas/api/v2/game-events/game-event.json',
          anyOf: [
            {
              $ref: 'https://onegame.schemas/api/v2/game-events/cards-drawn-game-event.json',
            },
            {
              $ref: 'https://onegame.schemas/api/v2/game-events/cards-played-game-event.json',
            },
            {
              $ref: 'https://onegame.schemas/api/v2/game-events/turn-passed-game-event.json',
            },
          ],
        },
        CardsPlayedGameEventV2: {
          $id: 'https://onegame.schemas/api/v2/game-events/cards-played-game-event.json',
          title: 'CardsPlayedGameEventV2',
          anyOf: [
            {
              additionalProperties: false,
              type: 'object',
              properties: {
                cards: {
                  $ref: 'https://onegame.schemas/api/v1/cards/card-array.json',
                },
                currentCard: {
                  $ref: 'https://onegame.schemas/api/v1/cards/card.json',
                },
                currentColor: {
                  $ref: 'https://onegame.schemas/api/v1/cards/card-color.json',
                },
                currentDirection: {
                  $ref: 'https://onegame.schemas/api/v1/games/game-direction.json',
                },
                currentPlayingSlotIndex: {
                  type: 'integer',
                },
                drawCount: {
                  type: 'number',
                },
                kind: {
                  const: 'cardsPlayed',
                  type: 'string',
                },
                position: {
                  type: 'integer',
                },
              },
              required: [
                'cards',
                'currentCard',
                'currentColor',
                'currentDirection',
                'drawCount',
                'currentPlayingSlotIndex',
                'kind',
                'position',
              ],
            },
            {
              additionalProperties: false,
              type: 'object',
              properties: {
                cards: {
                  $ref: 'https://onegame.schemas/api/v1/cards/card-array.json',
                },
                currentCard: {
                  type: 'null',
                },
                currentColor: {
                  type: 'null',
                },
                currentDirection: {
                  type: 'null',
                },
                currentPlayingSlotIndex: {
                  type: 'integer',
                },
                drawCount: {
                  type: 'null',
                },
                kind: {
                  const: 'cardsPlayed',
                  type: 'string',
                },
                position: {
                  type: 'integer',
                },
              },
              required: [
                'cards',
                'currentCard',
                'currentColor',
                'currentDirection',
                'drawCount',
                'currentPlayingSlotIndex',
                'kind',
                'position',
              ],
            },
          ],
        },
        CardsDrawnGameEventV2: {
          $id: 'https://onegame.schemas/api/v2/game-events/cards-drawn-game-event.json',
          title: 'CardsDrawnGameEventV2',
          additionalProperties: false,
          type: 'object',
          properties: {
            currentPlayingSlotIndex: {
              type: 'integer',
            },
            drawAmount: {
              type: 'integer',
            },
            kind: {
              const: 'cardsDrawn',
              type: 'string',
            },
            position: {
              type: 'integer',
            },
          },
          required: [
            'currentPlayingSlotIndex',
            'drawAmount',
            'kind',
            'position',
          ],
        },
        LoginAuthCreateQueryV2: {
          $id: 'https://onegame.schemas/api/v2/auth/login-auth-create-query.json',
          title: 'LoginAuthCreateQueryV2',
          type: 'object',
          additionalProperties: false,
          properties: {
            email: {
              type: 'string',
            },
            kind: {
              const: 'login',
              type: 'string',
            },
            password: {
              type: 'string',
            },
          },
          required: ['email', 'kind', 'password'],
        },
        CodeAuthCreateQueryV2: {
          $id: 'https://onegame.schemas/api/v2/auth/code-auth-create-query.json',
          title: 'CodeAuthCreateQueryV2',
          type: 'object',
          additionalProperties: false,
          properties: {
            code: {
              type: 'string',
            },
            kind: {
              const: 'code',
              type: 'string',
            },
          },
          required: ['code', 'kind'],
        },
        AuthV2: {
          $id: 'https://onegame.schemas/api/v2/auth/auth.json',
          title: 'AuthV2',
          type: 'object',
          additionalProperties: false,
          properties: {
            accessToken: {
              type: 'string',
            },
            refreshToken: {
              type: 'string',
            },
          },
          required: ['accessToken', 'refreshToken'],
        },
        AuthCreateQueryV2: {
          $id: 'https://onegame.schemas/api/v2/auth/auth-create-query.json',
          title: 'AuthCreateQueryV2',
          anyOf: [
            {
              $ref: 'https://onegame.schemas/api/v2/auth/code-auth-create-query.json',
            },
            {
              $ref: 'https://onegame.schemas/api/v2/auth/login-auth-create-query.json',
            },
          ],
        },
      },
    },
    paths: {
      '/v1/games': {
        get: {
          summary: 'Get games',
          operationId: 'getGames',
          parameters: [
            {
              in: 'query',
              name: 'isPublic',
              required: false,
              schema: {
                type: 'boolean',
              },
              description: 'visibility of the games to be found',
            },
            {
              in: 'query',
              name: 'status',
              required: false,
              schema: {
                type: 'string',
              },
              description: 'status of the games to be found',
            },
            {
              in: 'query',
              name: 'page',
              required: false,
              schema: {
                minimum: 1,
                type: 'number',
              },
              description: 'pagination number',
            },
            {
              in: 'query',
              name: 'pageSize',
              required: false,
              schema: {
                maximum: 50,
                minimum: 1,
                type: 'number',
              },
              description: 'pagination size',
            },
          ],
          responses: {
            '200': {
              description: 'Games found',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/games/game-array.json',
                  },
                },
              },
            },
            '400': {
              description: 'BadRequest',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
            '403': {
              description: 'Forbidden',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
          },
          security: [
            {
              accessToken: [],
            },
          ],
          tags: ['Game'],
        },
        post: {
          summary: 'Create a game',
          operationId: 'createGame',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  $ref: 'https://onegame.schemas/api/v1/games/game-create-query.json',
                },
              },
            },
            required: true,
          },
          responses: {
            '200': {
              description: 'Game created',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/games/non-started-game.json',
                  },
                },
              },
            },
            '400': {
              description: 'BadRequest',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
            '403': {
              description: 'Forbidden',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
          },
          security: [
            {
              accessToken: [],
            },
          ],
          tags: ['Game'],
        },
      },
      '/v1/games/mine': {
        get: {
          summary: 'Get games I joined',
          operationId: 'getGamesMine',
          parameters: [
            {
              in: 'query',
              name: 'status',
              required: false,
              schema: {
                type: 'string',
              },
              description: 'status of the games to be found',
            },
            {
              in: 'query',
              name: 'page',
              required: false,
              schema: {
                minimum: 1,
                type: 'number',
              },
              description: 'pagination number',
            },
            {
              in: 'query',
              name: 'pageSize',
              required: false,
              schema: {
                maximum: 50,
                minimum: 1,
                type: 'number',
              },
              description: 'pagination size',
            },
          ],
          responses: {
            '200': {
              description: 'Games found',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/games/game-array.json',
                  },
                },
              },
            },
            '400': {
              description: 'BadRequest',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
          },
          security: [
            {
              accessToken: [],
            },
          ],
          tags: ['Game'],
        },
      },
      '/v1/games/{gameId}': {
        get: {
          summary: 'Get a game',
          operationId: 'getGame',
          parameters: [
            {
              in: 'path',
              name: 'gameId',
              schema: {
                type: 'string',
              },
              required: true,
              description: 'Id of the game to get',
            },
          ],
          responses: {
            '200': {
              description: 'Game found',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/games/game.json',
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
            '403': {
              description: 'Forbidden',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
            '404': {
              description: 'Game not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
          },
          security: [
            {
              accessToken: [],
            },
          ],
          tags: ['Game'],
        },
        patch: {
          summary: 'Update a game',
          operationId: 'updateGame',
          parameters: [
            {
              in: 'path',
              name: 'gameId',
              schema: {
                type: 'string',
              },
              required: true,
              description: 'Id of the game to update',
            },
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  $ref: 'https://onegame.schemas/api/v1/games/game-id-update-query.json',
                },
              },
            },
            required: true,
          },
          responses: {
            '200': {
              description: 'Game updated',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/games/game.json',
                  },
                },
              },
            },
            '400': {
              description: 'Bad request',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
            '403': {
              description: 'Forbidden',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
            '404': {
              description: 'Game not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
            '422': {
              description: 'Unprocessable operation',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
          },
          security: [
            {
              accessToken: [],
            },
          ],
          tags: ['Game'],
        },
      },
      '/v1/games/{gameId}/specs': {
        get: {
          summary: 'Get a game spec',
          operationId: 'getGameGameIdSpec',
          parameters: [
            {
              in: 'path',
              name: 'gameId',
              schema: {
                type: 'string',
              },
              required: true,
              description: 'Game id',
            },
          ],
          responses: {
            '200': {
              description: 'Game spec found',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/games/game-spec.json',
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
            '403': {
              description: 'Forbidden',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
            '404': {
              description: 'Game not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
          },
          security: [
            {
              accessToken: [],
            },
          ],
          tags: ['Game'],
        },
      },
      '/v1/games/specs': {
        get: {
          summary: 'Get game specs',
          operationId: 'getGamesSpecs',
          parameters: [
            {
              in: 'query',
              name: 'gameId',
              explode: true,
              schema: {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
              required: false,
              style: 'form',
              description: 'Game id',
            },
            {
              in: 'query',
              name: 'page',
              required: false,
              schema: {
                minimum: 1,
                type: 'number',
              },
              description: 'pagination number',
            },
            {
              in: 'query',
              name: 'pageSize',
              required: false,
              schema: {
                maximum: 50,
                minimum: 1,
                type: 'number',
              },
              description: 'pagination size',
            },
            {
              in: 'query',
              name: 'sort',
              required: false,
              schema: {
                $ref: 'https://onegame.schemas/api/v1/games/game-spec-sort-option.json',
              },
            },
          ],
          responses: {
            '200': {
              description: 'Game specs found',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/games/game-spec-array.json',
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
            '403': {
              description: 'Forbidden',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
          },
          security: [
            {
              accessToken: [],
            },
          ],
          tags: ['Game'],
        },
      },
      '/v1/games/{gameId}/slots': {
        post: {
          summary: 'Create a game slot',
          operationId: 'createGameSlot',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  $ref: 'https://onegame.schemas/api/v1/games/game-id-slot-create-query.json',
                },
              },
            },
            required: true,
          },
          parameters: [
            {
              in: 'path',
              name: 'gameId',
              schema: {
                type: 'string',
              },
              required: true,
              description: 'Id of the game containing the game slot to create',
            },
          ],
          responses: {
            '200': {
              description: 'Game slot created',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/games/game-slot.json',
                  },
                },
              },
            },
            '400': {
              description: 'Bad request',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
            '403': {
              description: 'Forbidden',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
            '409': {
              description: 'Conflict',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
            '422': {
              description: 'Unprocessable request',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
          },
          security: [
            {
              accessToken: [],
            },
          ],
          tags: ['Game'],
        },
      },
      '/v1/games/{gameId}/slots/{gameSlotIndex}/cards': {
        get: {
          summary: 'Get a game slot cards',
          operationId: 'getGameSlotCards',
          parameters: [
            {
              in: 'path',
              name: 'gameId',
              schema: {
                type: 'string',
              },
              required: true,
              description: 'Id of the game containing the game slot to get',
            },
            {
              in: 'path',
              name: 'gameSlotIndex',
              schema: {
                type: 'integer',
              },
              required: true,
              description: 'Index of the game slot to get',
            },
          ],
          responses: {
            '200': {
              description: 'Game slot cards found',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/games/active-game-slot-cards.json',
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
            '403': {
              description: 'Forbidden',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
            '422': {
              description: 'Game slot cards not processable',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
          },
          security: [
            {
              accessToken: [],
            },
          ],
          tags: ['Game'],
        },
      },
      '/v1/users': {
        post: {
          summary: 'Create user',
          operationId: 'createUser',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  $ref: 'https://onegame.schemas/api/v1/users/user-create-query.json',
                },
              },
            },
            required: true,
          },
          responses: {
            '200': {
              description: 'User created',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/users/user.json',
                  },
                },
              },
            },
            '400': {
              description: 'BadRequest',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
            '409': {
              description: 'Conflict',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
          },
          security: [],
          tags: ['User'],
        },
        get: {
          summary: 'Get users',
          operationId: 'getUsers',
          parameters: [
            {
              in: 'query',
              name: 'id',
              explode: true,
              schema: {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
              required: false,
              style: 'form',
              description: 'id',
            },
            {
              in: 'query',
              name: 'page',
              required: false,
              schema: {
                minimum: 1,
                type: 'number',
              },
              description: 'pagination number',
            },
            {
              in: 'query',
              name: 'pageSize',
              required: false,
              schema: {
                maximum: 50,
                minimum: 1,
                type: 'number',
              },
              description: 'pagination size',
            },
            {
              in: 'query',
              name: 'sort',
              required: false,
              schema: {
                $ref: 'https://onegame.schemas/api/v1/users/user-sort-option.json',
              },
            },
          ],
          responses: {
            '200': {
              description: 'Users found',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/users/maybe-user-array.json',
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
            '403': {
              description: 'Invalid credentials',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
          },
          security: [
            {
              accessToken: [],
            },
          ],
          tags: ['User'],
        },
      },
      '/v1/users/email/{email}/code': {
        delete: {
          summary: 'Delete user code',
          operationId: 'deleteUserByEmailCode',
          parameters: [
            {
              in: 'path',
              name: 'email',
              schema: {
                type: 'string',
              },
              required: true,
              description: 'Email of the user whose code is being deleted',
            },
          ],
          responses: {
            '200': {
              description: 'User deleted',
            },
            '422': {
              description: 'Unprocessable operation',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
          },
          tags: ['User'],
        },
        post: {
          summary: 'Create user code',
          operationId: 'createUserByEmailCode',
          parameters: [
            {
              in: 'path',
              name: 'email',
              schema: {
                type: 'string',
              },
              required: true,
              description: 'Email of the user whose code is being deleted',
            },
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  $ref: 'https://onegame.schemas/api/v1/users/user-code-create-query.json',
                },
              },
            },
            required: false,
          },
          responses: {
            '201': {
              description: 'User code created',
            },
            '409': {
              description:
                'Entity conflict. This is likely to happen due to the existence of another code for this user.',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
            '422': {
              description:
                'Unprocessable operation. This is likely to happen if the kind of request cannot be accepted for the user given its current state.',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
          },
          tags: ['User'],
        },
      },
      '/v1/users/me': {
        delete: {
          summary: 'Delete user me',
          operationId: 'deleteUserMe',
          responses: {
            '200': {
              description: 'User deleted',
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
          },
          security: [
            {
              accessToken: [],
            },
          ],
          tags: ['User'],
        },
        get: {
          summary: 'Get current user',
          operationId: 'getUserMe',
          responses: {
            '200': {
              description: 'User found',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/users/user.json',
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
            '403': {
              description: 'Invalid credentials',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
          },
          security: [
            {
              accessToken: [],
            },
          ],
          tags: ['User'],
        },
        patch: {
          summary: 'Update user me',
          operationId: 'updateUserMe',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  $ref: 'https://onegame.schemas/api/v1/users/user-me-update-query.json',
                },
              },
            },
            required: true,
          },
          responses: {
            '200': {
              description: 'User updated',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/users/user.json',
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
            '403': {
              description: 'Forbidden',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
          },
          security: [
            {
              accessToken: [],
            },
          ],
          tags: ['User'],
        },
      },
      '/v1/users/me/detail': {
        get: {
          summary: 'Get current user detail',
          operationId: 'getUserMeDetail',
          responses: {
            '200': {
              description: 'User detail found',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/users/user-detail.json',
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
            '403': {
              description: 'Invalid credentials',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
          },
          security: [
            {
              accessToken: [],
            },
          ],
          tags: ['User'],
        },
      },
      '/v1/users/{userId}': {
        get: {
          summary: 'Get a user by ID',
          operationId: 'getUser',
          parameters: [
            {
              in: 'path',
              name: 'userId',
              schema: {
                type: 'string',
              },
              required: true,
              description: 'Id of the user to get',
            },
          ],
          responses: {
            '200': {
              description: 'User found',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/users/user.json',
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
            '404': {
              description: 'User not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
          },
          security: [
            {
              accessToken: [],
            },
          ],
          tags: ['User'],
        },
      },
      '/v2/auth': {
        post: {
          summary: 'Create an authorization token',
          operationId: 'createAuthV2',
          requestBody: {
            content: {
              'application/json': {
                examples: {
                  authByCode: {
                    summary: 'User code',
                    value: {
                      code: '0077df18851946fb67e552b83f34d58283548c38c4c5f144e6b655280b773528',
                      kind: 'code',
                    },
                  },
                  authByLogin: {
                    summary: 'User credentials',
                    value: {
                      email: 'mail@example.com',
                      kind: 'login',
                      password: 'sample-password',
                    },
                  },
                },
                schema: {
                  $ref: 'https://onegame.schemas/api/v2/auth/auth-create-query.json',
                },
              },
            },
            required: false,
          },
          responses: {
            '200': {
              description: 'Authorization token created',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v2/auth/auth.json',
                  },
                },
              },
            },
            '400': {
              description: 'Bad request',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
          },
          security: [
            {},
            {
              refreshToken: [],
            },
          ],
          tags: ['Auth'],
        },
      },
      '/v2/events/games/{gameId}': {
        get: {
          summary: 'Get game events (SSE)',
          operationId: 'getGameEventsV2',
          parameters: [
            {
              in: 'path',
              name: 'gameId',
              schema: {
                type: 'string',
              },
              required: true,
              description: 'Game id of the events to get.',
            },
          ],
          responses: {
            '200': {
              description: 'Game events found',
              content: {
                'text/event-stream': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                        },
                        data: {
                          $ref: 'https://onegame.schemas/api/v2/game-events/game-event.json',
                        },
                      },
                      required: ['id', 'data'],
                    },
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: 'https://onegame.schemas/api/v1/errors/error.json',
                  },
                },
              },
            },
          },
          security: [
            {
              accessToken: [],
            },
          ],
          tags: ['Game events'],
        },
      },
    },
    tags: [
      {
        name: 'Auth',
        description: 'Authorization management operations',
      },
      {
        name: 'Game',
        description: 'Game management operations',
      },
      {
        name: 'Game events',
        description: 'Game events management operations',
      },
      {
        name: 'User',
        description: 'User management operations',
      },
    ],
  };

  const container: Container = new Container();

  const controller: Newable<BaseSwaggerUiController<express.Response, void>> =
    swaggerUiControllerExpressBuilder({
      apiPath: apiPathFixture,
      openApiObject: specFixture,
    });

  container.bind(controller).toSelf().inSingletonScope();

  const server: Server = await buildExpressServer(container);

  console.log(
    `Server is running at http://${server.host}:${server.port.toString()}`,
  );
})();
