const expect = require('chai').expect
let chai = require('chai')
let chaiHttp = require('chai-http')
chai.use(chaiHttp)

describe('API', function () {
  let base_url = 'http://localhost:5001'
  let validTask
  let task =
    {
      "summary": "Google I/O 2015",
      "location": "800 Howard St., San Francisco, CA 94103",
      "description": "A chance to hear more about Google\"s developer products.",
      "start": {
        "dateTime": "2024-06-13T09:00:00-07:00",
        "timeZone": "America/Los_Angeles"
      },
      "end": {
        "dateTime": "2024-06-13T17:00:00-07:00",
        "timeZone": "America/Los_Angeles"
      }
    }

  let invalid_task =
    {
      'description': 'description invalid',
    }

  let edit_task =
    {
      'description': 'description edit',
    }

  it('should add a task to the db and google calendar', (done) => {
    chai.request(base_url).post('/tasks').send({ task: task }).end(async (err, res) => {
      validTask = res.body.new_task
      expect(err).to.be.null
      expect(res).to.have.status(200)
      done()
    })
  })

  it('should not add a task to the db', (done) => {
    chai.request(base_url).post('/tasks').send({ task: invalid_task }).end(async (err, res) => {
      expect(res).to.have.status(400)
      done()
    })
  })

  it('should return all the tasks in the db and google calendar', (done) => {
    chai.request(base_url).get('/tasks').end((err, res) => {
      expect(err).to.be.null
      expect(res).to.have.status(200)
      done()
    })

  })

  it('should edit a task in the db and google calendar', (done) => {
    chai.request(base_url).put('/tasks/' + validTask._id).send( { task: edit_task }).end((err, res) => {
      expect(err).to.be.null
      expect(res).to.have.status(200)
      done()
    })

  })

  it('should change task to completed', (done) => {
    chai.request(base_url).patch('/tasks/' + validTask._id + '/complete').end((err, res) => {
      expect(err).to.be.null
      expect(res).to.have.status(200)
      done()
    })

  })

  it('should delete a task in the db and google calendar', (done) => {
    chai.request(base_url).delete('/tasks/' + validTask._id).end((err, res) => {
      expect(err).to.be.null
      expect(res).to.have.status(200)
      done()
    })

  })

})


