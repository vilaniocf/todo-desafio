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
    return response.status(400).json({ error: 'User not found' })
  }

  request.user = user
  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const usernameAlreadyExists = users.some(user => user.username === username)
  if (usernameAlreadyExists) {
    return response.status(400).json({ error: 'Username already exists' })
  }

  users.push({ id: uuidv4(), name, username, todos: [] })

  return response.status(201).json(users)
})

app.get('/todos', checksExistsUserAccount, (request, response) => {
  return response.status(200).json(request.user.todos)
})

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body

  request.user.todos.push({
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  })

  response.status(201).json(request.user.todos)
})

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body

  const todoid = request.params.id
  const { todos } = request.user

  const todo_filter = todos.find(todo => todo.id === todoid)

  if (todo_filter) {
    todo_filter.title = title
    todo_filter.deadline = deadline

    return response.status(200).send(todo_filter)
  } else {
    return response.status(400).json({ error: 'Todo not found' })
  }
})

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const todoid = request.params.id
  const { todos } = request.user

  const todo_filter = todos.find(todo => todo.id === todoid)

  if (todo_filter) {
    todo_filter.done = true
    return response.send(todo_filter)
  } else {
    return response.status(400).json({ error: 'Todo not found' })
  }
})

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body

  const todoid = request.params.id
  const { todos } = request.user

  const todo_filter = todos.find(todo => todo.id === todoid)

  if (todo_filter) {
    todos.splice(todo_filter, 1)
    return response.status(204).send()
  } else {
    return response.status(400).json({ error: 'Todo not found' })
  }
})

module.exports = app
