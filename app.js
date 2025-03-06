// We will store our tasks in this array.
const tasks = [];

/**
 * Task object structure:
 * {
 *   title: string,
 *   priority: "low-priority" | "medium-priority" | "high-priority",
 *   status: "pending" | "completed"
 * }
 */
const taskForm = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');
// Register the 'submit' event on the form
taskForm.addEventListener('submit', function (event) {
event.preventDefault();
  // Read form values
  const title = document.getElementById('taskTitle').value;
  const priority = document.getElementById('taskPriority').value;
  // Get the selected status from the radio buttons
  const status = document.querySelector('input[name="taskStatus"]:checked').value;
  const newTask = {
    title: title,
    priority: priority,
    status: status
  };

  // Add it to our task array
  tasks.push(newTask);

  // Append the task to the DOM
  addTaskToDOM(newTask, tasks.length - 1);

  // Clear the form fields
  taskForm.reset();
});

/**
 * Append a single task to the task list in the DOM
 * @param {object} task - The task object
 * @param {number} index - The position of the task in the tasks array
 */
function addTaskToDOM(task, index) {
  const li = document.createElement('li');
  li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
  li.id = `task-${index}`;

  const textContainer = document.createElement('div');
  const taskText = document.createElement('span');
  taskText.textContent = `${task.title} [${task.priority}] [${task.status}]`;
  taskText.classList.add(task.priority);

  if (task.status === 'completed') {
    taskText.style.textDecoration = 'line-through';
  }

  textContainer.appendChild(taskText);

  const buttonContainer = document.createElement('div');
  const completeButton = document.createElement('button');
  completeButton.textContent = 'Mark As Complete';
  completeButton.classList.add('btn', 'btn-success', 'btn-sm', 'me-2');
  completeButton.addEventListener('click', function () {
    markAsComplete(index);
  });

  const removeButton = document.createElement('button');
  removeButton.textContent = 'Remove';
  removeButton.classList.add('btn', 'btn-danger', 'btn-sm');
  removeButton.addEventListener('click', function () {
    removeTask(index);
  });

  buttonContainer.appendChild(completeButton);
  buttonContainer.appendChild(removeButton);

  li.appendChild(textContainer);
  li.appendChild(buttonContainer);

  taskList.appendChild(li);
}

/**
 * Mark a task as complete in both the array and the DOM
 * @param {number} index - Index of the task in the tasks array
 */
function markAsComplete(index) {
  // Update the task in the array
  tasks[index].status = 'completed';

  // Update the display
  const listItem = document.getElementById(`task-${index}`);
  if (listItem) {
    const spanElement = listItem.querySelector('span');
    spanElement.style.textDecoration = 'line-through';
    spanElement.textContent = `${tasks[index].title} [${tasks[index].priority}] [completed]`;
  }
}

/**
 * Remove a task from the array and from the DOM
 * @param {number} index - Index of the task in the tasks array
 */
function removeTask(index) {
tasks.splice(index, 1);
const listItem = document.getElementById(`task-${index}`);
  if (listItem) {
    listItem.remove();
  }
  reIndexDOM();
}


function reIndexDOM() {
  const allListItems = document.querySelectorAll('#taskList li');
  allListItems.forEach((li, newIndex) => {
    li.id = `task-${newIndex}`;
    const completeButton = li.querySelector('.btn-success');
    const removeButton = li.querySelector('.btn-danger');
    completeButton.onclick = () => markAsComplete(newIndex);
    removeButton.onclick = () => removeTask(newIndex);
  });
}
