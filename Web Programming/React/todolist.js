if (localStorage.getItem("todoList") === null) {

    var todoList = [];

} else {
    
    todoList = JSON.parse(localStorage.getItem("todoList"));

    if (todoList.length === 0) {

        document.querySelector('#load').innerHTML = "<b>no tasks so far</b>"

    } else {

        document.querySelector('#load').innerHTML = "<b>Remaining Tasks</b>"

    }

    todoList.reverse().forEach((todo, index) => {

        index = todoList.length - index - 1;
        
        let content = `

            <div id="task-${index.toString()}">
                <input type="checkbox" id="c${index}" style="margin-left:5px; margin-right:5px;" onchange="markAsDone(${index})">
                ${todo}
                <input type="text" placeholder="update" id="e${index}" style="height:20px; visibility:hidden"
                aria-label="Username" aria-describedby="basic-addon1">
                <i class="fa fa-trash" aria-hidden="true" style="float : right" onclick="removeTask(${index})"></i>
                <i class="fas fa-edit" aria-hidden="true" style="float : right; margin-right:10px" onclick="editTask(${index})"></i>
            </div>
        `
        document.querySelector('#display').innerHTML += content;
    })
}

if (localStorage.getItem("markedTasks") === null) {

    var markedTasks = [];

} else {

    markedTasks = JSON.parse(localStorage.getItem("markedTasks"));

}

function addTask() {

    document.querySelector('#load').innerHTML = "<b>Remaining Tasks</b>"

    const todo = document.querySelector('#todo').value.trim().toString();

    document.querySelector('#todo').value = "";

    if (todo.length === 0) {
        return;
    }

    todoList.push(todo);

    localStorage.setItem("todoList", JSON.stringify(todoList));

    index = todoList.length - 1;
    
    let content = `

                <div id="task-${index.toString()}">
                    <input type="checkbox" style="margin-left:5px"; onchange="markAsDone(${index})">
                    ${todo}
                    <input type="text" placeholder="update" id="e${index}" style="height:20px; visibility:hidden"
                    aria-label="Username" aria-describedby="basic-addon1">
                    <i class="fa fa-trash" aria-hidden="true" style="float : right" onclick="removeTask(${index})"></i>
                    <i class="fas fa-edit" aria-hidden="true" style="float : right; margin-right:10px" onclick="editTask(${index})"></i>
                </div>

            `
    document.querySelector('#display').innerHTML = content + document.querySelector('#display').innerHTML;

}

function removeTask(index) {

    const elemment = document.querySelector("#task-" + (index));

    elemment.parentNode.removeChild(elemment);

    todoList.splice(index, 1)

    localStorage.setItem("todoList", JSON.stringify(todoList));

    if (todoList.length === 0) {
        document.querySelector('#load').innerHTML = "<b>no tasks so far</b>"
    }
}

function markAsDone(index) {

    todo = todoList[index];

    markedTasks.push(todo);

    localStorage.setItem("markedTasks", JSON.stringify(markedTasks));

    removeTask(index);
    
}

function editTask(index) {

    document.querySelector('#e' + index).style.visibility = "visible";

    document.querySelector('#e' + index).onchange = () => {

        const todo = document.querySelector('#e' + index).value;

        document.querySelector('#task-' + index).innerHTML = `

        <input type="checkbox" id="c${index}" style="margin-left:5px; margin-right:5px;" onchange="markAsDone(${index})">
        ${todo}
        <input type="text" placeholder="update" id="e${index}" style="height:20px; visibility:hidden;"
        aria-label="Username" aria-describedby="basic-addon1">
        <i class="fa fa-trash" aria-hidden="true" style="float : right" onclick="removeTask(${index})"></i>
        <i class="fas fa-edit" aria-hidden="true" style="float : right; margin-right:10px" onclick="editTask(${index})"></i>

    `
        todoList[index] = todo;

        localStorage.setItem("todoList", JSON.stringify(todoList));

    };
}