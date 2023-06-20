import { Router } from 'express';
import { protectedEndpoints } from '../constants/constants';

const userRoutes = Router();

const path = `/${protectedEndpoints.user}`;
