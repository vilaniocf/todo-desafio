const express = require('express')
const cors = require('cors')

const { v4: uuidv4 } = require('uuid')

const app = express()

app.use(cors())
app.use(express.json())

const users = []

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers
  const user = users.find(user => user.username === username)

  if (!user) {
    return response.status(404).json({ error: 'User not found' })
  }

  request.user = user
  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const usernameAlreadyExists = users.find(user => user.username === username)

  if (usernameAlreadyExists) {
    return response.status(400).json({ error: 'Username already exists' })
  }

  const user = { id: uuidv4(), name, username, todos: [] }

  users.push(user)
  return response.status(201).json(user)
})

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  return response.json(user.todos)
})

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body

  const todo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo)

  response.status(201).json(todo)
})

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body

  const todoid = request.params.id
  const { todos } = request.user

  const todo_filter = todos.find(todo => todo.id === todoid)

  if (!todo_filter) {
    return response.status(404).json({ error: 'Todo not found' })
  }

  todo_filter.title = title
  todo_filter.deadline = new Date(deadline)

  return response.json(todo_filter)
})

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params

  const { user } = request

  const todo_filter = user.todos.find(todo => todo.id === id)

  if (!todo_filter) {
    return response.status(404).json({ error: 'Todo not found' })
  }
  todo_filter.done = true
  return response.json(todo_filter)
})

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request

  const { todoid } = request.params

  const todo_filter = user.todos.findIndex(todo => todo.id === todoid)

  if (todo_filter === -1) {
    return response.status(404).json({ error: 'Todo not found' })
  }

  user.todos.splice(todo_filter, 1)

  return response.status(204).send()
})

module.exports = app
