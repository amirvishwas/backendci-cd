const express = require('express');
const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());

let todos = [];
let nextId = 1;

const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Todo App</title>
  <style>
    body { font-family: sans-serif; max-width: 600px; margin: 2rem auto; }
    ul { list-style: none; padding: 0; }
    li { display: flex; justify-content: space-between; margin-bottom: 0.5rem; padding: 0.5rem; border: 1px solid #ccc; }
    .done { text-decoration: line-through; color: #888; cursor: pointer; }
    span { cursor: pointer; }
  </style>
</head>
<body>
  <h1>Todos</h1>
  <form id="form" onsubmit="addTodo(event)">
    <input type="text" id="input" placeholder="New todo..." required>
    <button type="submit">Add</button>
  </form>
  <ul id="list"></ul>
  <script>
    async function load() {
      const res = await fetch('/api/todos');
      const todos = await res.json();
      const list = document.getElementById('list');
      list.innerHTML = todos.map(t => 
        \`<li>
          <span class="\${t.done ? 'done' : ''}" onclick="toggle(\${t.id})">\${t.text}</span>
          <button onclick="del(\${t.id})">Delete</button>
        </li>\`
      ).join('');
    }
    async function addTodo(e) {
      e.preventDefault();
      const input = document.getElementById('input');
      await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input.value })
      });
      input.value = '';
      load();
    }
    async function toggle(id) {
      await fetch(\`/api/todos/\${id}/toggle\`, { method: 'POST' });
      load();
    }
    async function del(id) {
      await fetch(\`/api/todos/\${id}\`, { method: 'DELETE' });
      load();
    }
    load();
  </script>
</body>
</html>
`;

app.get('/', (req, res) => {
  res.send(html);
});

app.get('/api/todos', (req, res) => {
  res.json(todos);
});

app.post('/api/todos', (req, res) => {
  const todo = { id: nextId++, text: req.body.text, done: false };
  todos.push(todo);
  res.json(todo);
});

app.post('/api/todos/:id/toggle', (req, res) => {
  const todo = todos.find(t => t.id === parseInt(req.params.id));
  if (todo) {
    todo.done = !todo.done;
    res.json(todo);
  } else {
    res.status(404).send('Not found');
  }
});

app.delete('/api/todos/:id', (req, res) => {
  todos = todos.filter(t => t.id !== parseInt(req.params.id));
  res.json({ success: true });
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
