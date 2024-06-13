import { model, Schema } from 'mongoose'

const task = new Schema(
  {
    summary: { type: String, required: true },
    description: { type: String, required: true },
    start: { type: Object, required: true },
    end: { type: Object, required: true },
    eventId: { type: String, required: true },
    isDone: { type: Boolean, required: true, default: false },
  },
)

const Task = model('Task', task, 'Task')

export { Task }
