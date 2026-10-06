import 'reflect-metadata';

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  type GrpcObject,
  loadPackageDefinition,
  type ServiceClientConstructor,
} from '@grpc/grpc-js';
import { loadSync, type PackageDefinition } from '@grpc/proto-loader';
import { type GrpcServiceDefinition } from '@inversifyjs/grpc-core';

export interface ChatMessage {
  text: string;
}

export interface HeroRequest {
  id: string;
}

export interface HeroResponse {
  name: string;
}

export interface UploadRequest {
  name: string;
}

export interface UploadResponse {
  names: string[];
}

const protoPath: string = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'hero.proto',
);

const packageDefinition: PackageDefinition = loadSync(protoPath, {
  defaults: true,
  enums: String,
  keepCase: false,
  longs: String,
  oneofs: true,
});

function isGrpcObject(value: unknown): value is GrpcObject {
  return typeof value === 'object' && value !== null;
}

function isServiceClientConstructor(
  value: unknown,
): value is ServiceClientConstructor {
  return typeof value === 'function' && 'service' in value;
}

function readPackageObject(root: GrpcObject, packageName: string): GrpcObject {
  const packageParts: string[] = packageName.split('.');
  let current: GrpcObject = root;

  for (const packagePart of packageParts) {
    const next: unknown = current[packagePart];

    if (!isGrpcObject(next)) {
      throw new Error(`gRPC package "${packageName}" was not found`);
    }

    current = next;
  }

  return current;
}

function readServiceConstructor(
  packageObject: GrpcObject,
  serviceName: string,
): ServiceClientConstructor {
  const service: unknown = packageObject[serviceName];

  if (!isServiceClientConstructor(service)) {
    throw new Error(`gRPC service "${serviceName}" was not found`);
  }

  return service;
}

function readServiceDefinition(
  packageObject: GrpcObject,
  serviceName: string,
): GrpcServiceDefinition {
  return readServiceConstructor(packageObject, serviceName).service;
}

const loadedPackage: GrpcObject = loadPackageDefinition(packageDefinition);
const heroPackage: GrpcObject = readPackageObject(loadedPackage, 'hero.v1');

export const heroChatServiceDefinition: GrpcServiceDefinition =
  readServiceDefinition(heroPackage, 'HeroChatService');

export const heroListServiceDefinition: GrpcServiceDefinition =
  readServiceDefinition(heroPackage, 'HeroListService');

export const heroServiceDefinition: GrpcServiceDefinition =
  readServiceDefinition(heroPackage, 'HeroService');

export const heroUploadServiceDefinition: GrpcServiceDefinition =
  readServiceDefinition(heroPackage, 'HeroUploadService');

export function getHeroServiceConstructor(
  serviceName: string,
): ServiceClientConstructor {
  return readServiceConstructor(heroPackage, serviceName);
}
