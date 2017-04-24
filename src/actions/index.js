import api from '../api'

let nextTodoId = 0;

export const addTodo = (text) => {
  return {
    type: 'ADD_TODO',
    id: nextTodoId++,
    text
  };
};

export const toggleTodo = (id) => {
  return {
    type: 'TOGGLE_TODO',
    id
  };
};



export function addTodoAsync(text) {
  return function (dispatch) {

    api.add(text)
        .then(data => dispatch(addTodo(text))
    //.catch(error => dispatch(testAsyncError(error)));
  };
}



export function testAsync() {
  return function (dispatch) {

    api.getAll()
        .then(data => console.log(data))
        //.catch(error => dispatch(testAsyncError(error)));
  };
}
