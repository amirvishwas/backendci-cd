const express = require('express');
const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());

let todos = [];
let nextId = 1;

const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Todo App</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
    body { 
      font-family: 'Inter', sans-serif; 
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); 
      min-height: 100vh; 
      margin: 0; 
      display: flex; 
      justify-content: center; 
      align-items: center; 
    }
    .container { 
      background: white; 
      width: 100%; 
      max-width: 450px; 
      border-radius: 16px; 
      box-shadow: 0 10px 30px rgba(0,0,0,0.1); 
      padding: 2.5rem; 
      box-sizing: border-box; 
    }
    h1 { 
      margin-top: 0; 
      color: #2d3748; 
      font-size: 2rem; 
      text-align: center; 
      margin-bottom: 2rem; 
      font-weight: 600;
    }
    form { 
      display: flex; 
      gap: 12px; 
      margin-bottom: 2rem; 
    }
    input[type="text"] { 
      flex: 1; 
      padding: 12px 16px; 
      border: 2px solid #e2e8f0; 
      border-radius: 10px; 
      font-size: 1rem; 
      outline: none; 
      transition: border-color 0.2s; 
    }
    input[type="text"]:focus { 
      border-color: #667eea; 
    }
    button[type="submit"] { 
      background: #667eea; 
      color: white; 
      border: none; 
      padding: 12px 24px; 
      border-radius: 10px; 
      cursor: pointer; 
      font-size: 1rem; 
      font-weight: 600; 
      transition: background 0.2s, transform 0.1s; 
    }
    button[type="submit"]:hover { 
      background: #5a67d8; 
    }
    button[type="submit"]:active { 
      transform: scale(0.96);
    }
    ul { 
      list-style: none; 
      padding: 0; 
      margin: 0; 
    }
    li { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      padding: 14px 18px; 
      background: #f7fafc; 
      border-radius: 10px; 
      margin-bottom: 12px; 
      transition: transform 0.2s, box-shadow 0.2s; 
      border: 1px solid #edf2f7;
    }
    li:hover { 
      transform: translateY(-2px); 
      box-shadow: 0 4px 12px rgba(0,0,0,0.05); 
    }
    .todo-content { 
      flex: 1; 
      cursor: pointer; 
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }
    .todo-text {
      color: #4a5568; 
      font-size: 1.05rem; 
      font-weight: 500;
      transition: color 0.2s; 
    }
    .date-text {
      font-size: 0.75rem;
      color: #a0aec0;
      margin-top: 4px;
    }
    .done .todo-text { 
      text-decoration: line-through; 
      color: #a0aec0; 
    }
    .delete-btn { 
      background: transparent; 
      color: #e53e3e; 
      border: 1px solid #e53e3e; 
      padding: 6px 12px; 
      border-radius: 6px; 
      cursor: pointer; 
      font-size: 0.85rem; 
      font-weight: 600;
      transition: all 0.2s; 
    }
    .delete-btn:hover { 
      background: #e53e3e; 
      color: white;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>My Tasks</h1>
    <form id="form" onsubmit="addTodo(event)">
      <input type="text" id="input" placeholder="What needs to be done?" required>
      <button type="submit">Add</button>
    </form>
    <ul id="list"></ul>
  </div>
  <script>
    async function load() {
      const res = await fetch('/api/todos');
      const todos = await res.json();
      const list = document.getElementById('list');
      list.innerHTML = todos.map(t => 
        \`<li class="\${t.done ? 'done' : ''}">
          <div class="todo-content" onclick="toggle(\${t.id})">
            <span class="todo-text">\${t.text}</span>
            <span class="date-text">\${t.createdAt ? new Date(t.createdAt).toLocaleString() : ''}</span>
          </div>
          <button class="delete-btn" onclick="del(\${t.id})">Delete</button>
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
  const todo = { id: nextId++, text: req.body.text, done: false, createdAt: new Date().toISOString() };
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
