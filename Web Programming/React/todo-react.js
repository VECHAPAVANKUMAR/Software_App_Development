class Form extends React.Component {
    
    constructor(props) {
        super(props)
        this.state = {
            taskInput : "",
            dueDate : ""
        }
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    render() {

        return (
            
            <div>
                <form onSubmit = {this.handleSubmit}>

                    <label><b>Task</b></label>
                    <input onChange={this.handleChange} name="taskInput" type="text" placeholder="enter task" value={this.state.taskInput} required/>
                    
                    <label><b>Due Date</b></label>
                    <input onChange={this.handleChange} name="dueDate" type="date" value={this.state.dueDate} required/>
                    
                    <button>Add Task</button>

                </form>
            </div>

        )
    }

    handleChange = (event) => {

        this.setState({
            [event.target.name] : event.target.value
        });
    }

    handleSubmit = (event) => {

        event.preventDefault();

        const task = this.state.taskInput;
        const dueDate = this.state.dueDate;
        
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() - 1)

        if (currentDate > new Date(dueDate)) {
            alert("Due Date should not be less than Current Date")
            return;
        }

        this.setState({
            taskInput : "",
            dueDate : ""
        })

        this.props.addTask(task, dueDate)
    }
}

class Task extends React.Component {

    constructor(props) {
        super(props) 
        this.state =  {
            taskList : []
        }

        this.addTask = this.addTask.bind(this)
    }

    render() {

        return (

            <div>

                <h1>Tasks</h1>

                <ul>
                    {this.state.taskList.map((task, i) =>
                        <li key={i}>
                            {task.task} {task.dueDate}
                            <button data-index = {i} onClick={this.deleteTask}> Delete Task </button>
                        </li>
                    )}
                </ul>

                <Form addTask={this.addTask}/>
                
            </div>
        );
    }

    componentDidMount() {
        
        const tasks = localStorage.getItem("tasks");

        if (tasks !== null) {
            this.setState({
                taskList : JSON.parse(tasks)
            })
        }
        
        window.addEventListener("beforeunload", () => {
            localStorage.setItem("tasks", JSON.stringify(this.state.taskList));
        })
    }

    addTask = (task, dueDate) => {

        this.setState(state => ({
        taskList: [...state.taskList, {task : task, dueDate : dueDate}]
        }));
    }

    deleteTask = (event) => {

        const index = event.target.dataset.index;

        this.setState(state => {
            const tasks = [...state.taskList];
            tasks.splice(index, 1);
            return {
                taskList: tasks
            };
        });
    }   

}

class App extends React.Component {
    constructor(props) {
        super(props) 
    }

    render() {

        return (
            <Task/>
        )

    }
}


ReactDOM.render(<App />, document.querySelector("#root"));
