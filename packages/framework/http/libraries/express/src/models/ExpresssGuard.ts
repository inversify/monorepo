import { Guard } from '@inversifyjs/http-core';
import express from 'express';

export type ExpressGuard = Guard<express.Request>;
