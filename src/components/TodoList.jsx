import React from 'react';
import { connect } from 'react-redux';

import { toggleTodo, testAsync } from '../actions';

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
    onTodoClick
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
            dispatch( testAsync());
            //dispatch(toggleTodo(id));

        },
        test : ()=>{
            testAsync()
        }
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TodoList);
