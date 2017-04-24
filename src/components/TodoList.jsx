import React from 'react';
import { connect } from 'react-redux';

import { toggleTodo } from '../actions';

const Todo = ({
    onClick,
    completed,
    text
    }) => (
    <li
        onClick={onClick}
        style={{
      textDecoration:
        completed ?
          'line-through' :
          'none'
    }}
        className={
        completed ?
          'completed' :
          ''
    }
    >
        {text}
    </li>
);

const TodoList = ({
    todos,
    onTodoClick,
    dispatch
    }) => (
    <ul>
        {todos.map(todo =>
            <Todo
                key={todo.id}
                {...todo}
                onClick={() => onTodoClick(todo.id)}
            />
        )}
    </ul>
);


const mapStateToProps = (state) => {
    return {
        todos: state.todos
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        onTodoClick: (id) => {
            dispatch(toggleTodo(id));
        }
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TodoList);