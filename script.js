/* all HTMLElements have a '$' at the beginning */
'use strict';
let tasks = [];

const $form = document.getElementById('form'),
    $taskInput = document.getElementById('taskInput'),
    $formCheckbox = document.getElementById('formCheckbox'),
    $tasks = document.getElementById('tasks'),
    $itemsLeft = document.getElementById('itemsLeft'),
    $filter = document.getElementById('filter'),
    $clearCompleted = document.getElementById('clearCompleted'),
    $themeSwitcher = document.getElementById('themeSwitcher');

/*create new Element, append them and return them*/
const newNode = ({ HTMLTag = 'div', parent, txtContent = '', classes = [] }) => {
    const $node = document.createElement(HTMLTag);
    /* add textContent if it is defined */
    if (txtContent !== undefined)
        $node.textContent = txtContent;
    /* ADD CLASS IF IT IS DEFINED */
    if (classes.length > 0)
        classes.forEach((E) => $node.classList.add(E));
    /* APPEND THE NODE IN THE PARENT NODE (PARAMETER)*/
    parent.append($node)
    return $node;
}

const newTask = (name, isFinished = false) => ({
    name: name,
    isFinished: isFinished,
});

const renderTasks = () => {
    const fragment = document.createDocumentFragment();
    tasks.forEach((task) => {
        const $task = newNode({ parent: fragment, classes: ['task'] });
        $task.setAttribute('draggable', true);
        $task.task = task;
        const $checkbox = newNode({ HTMLTag: 'span', parent: $task, classes: ['task__checkbox', 'checkbox'] });

        if (task.isFinished)
            $checkbox.setAttribute('checked', '');

        newNode({ HTMLTag: 'p', parent: $task, txtContent: task.name, classes: ['task__name'] });

        const removeBTN = newNode({ HTMLTag: 'button', parent: $task, classes: ['task__remove-btn'] });
        removeBTN.setAttribute('aria-label', `remove "${task.name}" from tasks`);
    });
    $tasks.textContent = '';
    $tasks.appendChild(fragment);
    refreshLS();
    $itemsLeft.textContent = tasks.filter((E) => !E.isFinished).length;
}

const removeTask = (e) => {
    const $E = e.target;
    if ($E.classList.contains('task__remove-btn')) {
        const taskName = $E.parentElement.task.name;
        tasks = tasks.filter((task) => task.name !== taskName);
        renderTasks();
    }
}

const refreshLS = () => {
    if (tasks.length > 0)
        localStorage.setItem('tasks', JSON.stringify(tasks));
    else
        localStorage.removeItem('tasks');

}

/* events */

$clearCompleted.addEventListener('click', () => {
    tasks = tasks.filter((task) => !task.isFinished);
    renderTasks();
});

$filter.addEventListener('change', (e) => {
    document.querySelectorAll('.task--hidden').forEach((E) => {
        E.classList.remove('task--hidden', 'task--no-visible');
    });

    const $E = e.target;

    if ($E.value === 'active') {
        document.querySelectorAll('.task').forEach((E) => {
            /* console.log(!E.task.isFinished) */
            if (E.task.isFinished) {
                E.classList.add('task--hidden');
                setTimeout(() => E.classList.add('task--no-visible'), 500);
            }
        });
    } else if ($E.value === 'completed') {

        document.querySelectorAll('.task').forEach((E) => {
            if (!E.task.isFinished) {
                E.classList.add('task--hidden');
                setTimeout(() => E.classList.add('task--no-visible'), 500);
            }
        });
    }
});

$tasks.addEventListener('click', removeTask);

$form.addEventListener('submit', (e) => {
    e.preventDefault();
    if ($taskInput.value.trim().length > 0 &&
        tasks.filter((E) => $taskInput.value.trim() === E).length === 0) {
        const task = newTask($taskInput.value.trim(), $formCheckbox.hasAttribute('checked'));
        tasks.unshift(task);
        renderTasks();
    }
    $taskInput.value = '';
});

/* End task event */
document.body.addEventListener('click', (e) => {
    const $E = e.target;
    if ($E.classList.contains('checkbox')) {
        $E.toggleAttribute('checked');

        if ($E.classList.contains('task__checkbox')) {
            const task = $E.parentElement.task;
            task.isFinished = (task.isFinished) ? false : true;
            $itemsLeft.textContent = tasks.filter((E) => !E.isFinished).length;
            refreshLS();
        }
    }
});

$themeSwitcher.addEventListener('click', () => {
    document.documentElement.toggleAttribute('light-theme');

    if (document.documentElement.hasAttribute('light-theme')) {
        localStorage.setItem('light', true);
    } else {
        localStorage.removeItem('light');
    }

});

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('tasks') !== null) {
        tasks = JSON.parse(localStorage.getItem('tasks'));
        renderTasks();
    }
    if (localStorage.getItem('light') !== null) {
        $themeSwitcher.click();
    }
});

/* Drag and drop */
$tasks.addEventListener('dragstart', (e) => e.dataTransfer.setData('text/plain', JSON.stringify(e.target.task)));

$tasks.addEventListener('dragover', (e) => {
    e.preventDefault();
});

$tasks.addEventListener('drop', (e) => {
    const $E = e.target;
    if ($E.classList.contains('task')) {
        const taskIndex = tasks.indexOf($E.task);
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        const dataIndex = tasks.findIndex((task) => task.name === data.name);
        [tasks[dataIndex], tasks[taskIndex]] = [tasks[taskIndex], tasks[dataIndex]];
        renderTasks();
        refreshLS();
    }
});