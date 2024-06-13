import {task_routes} from '../Controllers';
import { Router } from 'express';

let router = Router();

router.get(
    '/',
    task_routes.get_standard_message
);

router.get(
    '/tasks',
    task_routes.get_tasks
);

router.post(
    '/tasks',
    task_routes.create_task
);

router.delete(
    '/tasks/:id',
    task_routes.delete_task
);


router.put(
  '/tasks/:id',
  task_routes.put_task
);

router.patch(
    '/tasks/:id/complete',
    task_routes.patch_task
);

export default router;
