import React from 'react';
import { Provider } from 'react-redux';

import AddTodo from './AddTodo.jsx';
import TodoList from './TodoList.jsx';
import store from '../store';


const TodoApp = () => (
  <div>
    <AddTodo />
    <TodoList />
  </div>
);

export default (
  <Provider store={store}>
    <TodoApp />
  </Provider>
)
