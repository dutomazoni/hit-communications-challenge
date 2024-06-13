import { Task } from '../Models'
import { google } from 'googleapis'
import path from 'path'
import { promises as fs } from 'fs'
import { authenticate } from '@google-cloud/local-auth'

let task_routes = {}

const SCOPES = ['https://www.googleapis.com/auth/calendar']
const TOKEN_PATH = path.join(process.cwd(), 'token.json')
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json')

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist () {
  try {
    const content = await fs.readFile(TOKEN_PATH)
    const credentials = JSON.parse(content)
    return google.auth.fromJSON(credentials)
  } catch (err) {
    return null
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials (client) {
  const content = await fs.readFile(CREDENTIALS_PATH)
  const keys = JSON.parse(content)
  const key = keys.installed || keys.web
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  })
  await fs.writeFile(TOKEN_PATH, payload)
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize () {
  let client = await loadSavedCredentialsIfExist()
  if (client) {
    return client
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  })
  if (client.credentials) {
    await saveCredentials(client)
  }
  return client
}

task_routes.get_standard_message = async (req, res) => {
  try {
    return res.status(200).json({ message: 'Welcome!' })
  } catch (error) {
    return res.status(400).json({})
  }
}

task_routes.get_tasks = async (req, res) => {
  try {
    const tasks = await Task.find()
    authorize().then(async (auth) => {
      const calendar = google.calendar({ version: 'v3', auth })
      await calendar.events.list({
        calendarId: 'primary',
        singleEvents: true,
        timeMin: new Date().toISOString(),
        orderBy: 'startTime',
      }, async function (err, event) {
        if (err) {
          console.log('There was an error contacting the Calendar service: ' + err)
          return res.status(400).json()
        }
        const events = event.data.items;
        if (!events || events.length === 0) {
          console.log('No events found.')
          return
        }
        console.log('Events:')
        events.map((event, i) => {
          const start = event.start.dateTime || event.start.date
          console.log(`${start} - ${event.summary}`)
        })
        return res.status(200).json({
          TasksInDb: tasks,
          GoogleAgendaEvents: `Google Agenda Events from now on:${events.map((event, i) => {
            const start = event.start.dateTime || event.start.date
            return (` ${start} - ${event.summary}`)
          })}`,
        })
      })
    })
    // return res.status(200).json({ tasks })
  } catch (error) {
    return res.status(400).json({ error })
  }
}

task_routes.create_task = async (req, res) => {
  try {
    let new_task = req.body.task
    authorize().then(async (auth) => {
      const calendar = google.calendar({ version: 'v3', auth })
      await calendar.events.insert({
        auth: auth,
        calendarId: 'primary',
        resource: new_task,
      }, async function (err, event) {
        if (err) {
          console.log('There was an error contacting the Calendar service: ' + err)
          return res.status(400).json()
        }
        new_task.eventId = event.data.id
        new_task = await Task.create(new_task)
        console.log('Event created: %s', event.data.htmlLink)
        return res.status(200).json({ new_task: new_task, message: `'Event created: ${event.data.htmlLink}'` })
      })
    })

  } catch (error) {
    return res.status(400).json({ error })
  }
}

task_routes.put_task = async (req, res) => {
  try {
    let taskId = req.params.id
    let task = await Task.findOne({ _id: taskId })
    let bodyTask = req.body.task

    if (task) {
      let new_task = await Task.findByIdAndUpdate(task._id, bodyTask, { new: true })
      authorize().then(async (auth) => {
        const calendar = google.calendar({ version: 'v3', auth })
        await calendar.events.patch({
          auth: auth,
          calendarId: 'primary',
          eventId: new_task.eventId,
          resource: new_task,
        }, function (err, event) {
          if (err) {
            console.log('There was an error contacting the Calendar service: ' + err)
            return res.status(400).json()
          }
          console.log('Event updated: %s', event.data.htmlLink)
          return res.status(200).json({ new_task: new_task, message: `'Event updated: ${event.data.htmlLink}'` })
        })
      })

    } else {
      return res.status(400).json({ message: 'Task not found' })
    }

  } catch (error) {
    return res.status(400).json({ error })
  }
}

task_routes.patch_task = async (req, res) => {
  try {
    let taskId = req.params.id
    let task = await Task.findOne({ _id: taskId })

    if (task) {
      let new_task = await Task.findByIdAndUpdate(task._id, { isDone: true }, { new: true })
      return res.status(200).json({ task: new_task })
    } else {
      return res.status(400).json({ message: 'Task not found' })
    }

  } catch (error) {
    return res.status(400).json({ error })
  }
}

task_routes.delete_task = async (req, res) => {
  try {
    let task = await Task.findOne({ _id: req.params.id })
    authorize().then(async (auth) => {
      const calendar = google.calendar({ version: 'v3', auth })

      await calendar.events.delete({
        auth: auth,
        calendarId: 'primary',
        eventId: task.eventId,
      }, async function (err, event) {
        if (err) {
          console.log('There was an error contacting the Calendar service: ' + err)
          return res.status(400).json()
        }
        console.log('Event deleted!')
        await Task.deleteOne({ _id: req.params.id })
        return res.status(200).json({ message: 'Task deleted successfully!' })
      })
    })

  } catch (error) {
    return res.status(400).json({})
  }
}


export { task_routes }
