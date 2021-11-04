const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).json({ error: "User not found" });
  }

  request.user = user;
  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((users) => users.username === username);
  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists" });
  }

  users.push({ id: uuidv4(), name, username, todos: [] });

  return response.status(201).send({ user: users });
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  return response.status(200).send({ todos: request.user.todos });
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  var todo = "";
  const { title, deadline } = request.body;

  request.user.todos.push({
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  });

  response.status(201).json({ todo: request.user.todos });
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  var todos = request.user.todos;
  const { title, deadline } = request.body;

  if (todos.id) {
    var todo = todos.findIndex((todo) => todo.id === request.params.id);
    if (todos[todo].id === request.params.id) {
      todos[todo].title = title;
      todos[todo].deadline = deadline;

      response.status(201).json({ todos });
    }
  } else {
    response.status(400).json({ error: "Todo not found" });
  }
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  var todos = request.user.todos;
  const { done } = request.body;

  var todo = todos.findIndex((todo) => todo.id === request.params.id);
  if (todo !== -1) {
    if (todos[todo].id === request.params.id) {
      todos[todo].done = done;

      response.status(201).json({ todos: todos });
    }
  }
  response.status(400).json({ error: "Todo not found" });
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  var todos = request.user.todos;
  const { done } = request.body;

  var todo = todos.findIndex((todo) => todo.id === request.params.id);

  if (todo !== -1) {
    if (todos[todo].id === request.params.id) {
      todos.splice(todo, 1);

      response.status(201).json({ todos: todos });
    }
  }
  response.status(400).json({ error: "Todo not found" });
});

module.exports = app;
