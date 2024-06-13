import task_routes from './task';
import { Router } from 'express';

const router = Router();

router.use(task_routes);

export default router;
