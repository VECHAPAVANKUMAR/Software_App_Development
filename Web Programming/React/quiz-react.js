class Question extends React.Component {

    render() {

        return (

            <div>

                <h3>{this.props.question}</h3>

                {this.props.options.map((option, i) =>
                    
                    <div key={i}>
                        <input type="radio" name="options" checked={this.props.choosedOptionIdx == i}
                        onChange={this.props.handleChange} data-index = {i}/>{option}
                    </div>  
                )}
                
            </div>
        )
    }
}


let timer = ""

class Quiz extends React.Component {
    constructor(props) {
        super(props)
        this.state = {

            data : [
                        {question: "First Question", options: ["A", "B", "C", "D"], correctOptionIdx: 2, choosedOptionIdx : -1},
                        {question: "Second Question", options: ["B", "C", "D", "A"], correctOptionIdx: 0, choosedOptionIdx : -1},
                        {question: "Third Question", options: ["A", "B", "C", "D"], correctOptionIdx: 0, choosedOptionIdx : -1}
                   ],

            questionNumber : 0,
            prevDisable : false,
            nextDisable : false,
            start : false,
            end : false,
            endTime : "00:30:00"
        }

        this.startQuiz = this.startQuiz.bind(this)
        this.endQuiz = this.endQuiz.bind(this);
        this.previous = this.previous.bind(this);
        this.next = this.next.bind(this);
        this.handleChange = this.handleChange.bind(this);
    };

    componentDidMount() {

        this.previous()
    }

    render() {

        if (!this.state.start) {
            
            return (

                <div>
                    <Instructions/>
                    <button onClick={this.startQuiz}>Start Quiz</button>
                </div>

            )

        } else if (!this.state.end && this.state.endTime !== "00:00:00") {
            
            return (
                
                <div>

                    <h2 className="timer">{this.state.endTime}</h2>

                    <Question question={this.state.data[this.state.questionNumber].question} 
                            options={this.state.data[this.state.questionNumber].options} 
                            choosedOptionIdx = {this.state.data[this.state.questionNumber].choosedOptionIdx}
                            handleChange={this.handleChange}/>
                    
                    <br/><button className="prev" onClick={this.previous} disabled={this.state.prevDisable}>Previous</button>
                    <button className="next" onClick={this.next} disabled={this.state.nextDisable}>Next</button><br/>
                    <button onClick={this.endQuiz}>Finish</button>

                </div>
          
            )
        } else {

            clearInterval(timer)

            let score = 0;

            for (let index = 0; index < this.state.data.length; index++) {

                if (this.state.data[index].correctOptionIdx == this.state.data[index].choosedOptionIdx) {
                    score++;
                }
            }

            return (

                <div>

                    {this.state.data.map((ques, index) => {

                        return (

                            <div>

                                <p> {index + 1}. {ques.question} </p>

                                <p>
                                    {ques.options.map((opt, idx) => {
                                        return (<span> <b> {idx + 1} </b> : {opt} </span>)
                                    })}
                                </p>

                                <p> Correct Option : {parseInt(ques.correctOptionIdx) + 1} </p>

                                <p> Option Choosed : {ques.choosedOptionIdx == -1 ? "No": parseInt(ques.choosedOptionIdx) + 1} </p>

                            </div>

                        )
                    })}

                    <h1>You have scored {score} out of {this.state.data.length}</h1>

                </div>
            )
        }
    }

    handleChange(event) {

        const choosedOption = event.target.dataset.index;
        
        if (choosedOption == this.state.data[this.state.questionNumber].choosedOptionIdx) {
            return
        }
        
        this.state.data[this.state.questionNumber].choosedOptionIdx = choosedOption

        this.setState({
            questionNumber : this.state.questionNumber
        })
    }

    endQuiz() { 
             
       this.setState({
            end : true,
        });
    }

    startQuiz() {
        
        let end = new Date(0, 0, 0, 0, 30, 0, 0, 0)
        
        timer = setInterval(() => {
            this.setState({
                endTime : new Date(end.setTime(end.getTime() - 1000)).toString().slice(16, 24)
            })
        },1000)

        this.setState({
            start : true
        })
    }

    previous() {

        if (this.state.questionNumber === 0) {
            this.setState({
                prevDisable : true
            })
        } else if (this.state.questionNumber === 1) {
            this.setState((state) => ({
                prevDisable : true,
                questionNumber : state.questionNumber - 1,
            }));
        } else {
            this.setState((state) => ({
                questionNumber : state.questionNumber - 1,
                prevDisable : false,
                nextDisable : false,
            }));
        }
    }

    next() {

        if (this.state.questionNumber < this.state.data.length - 2) {
            this.setState((state) => ({
                questionNumber : state.questionNumber + 1,
                nextDisable : false,
                prevDisable : false
            }));
        } else if (this.state.questionNumber < this.state.data.length - 1) {
            this.setState((state) => ({
                questionNumber : state.questionNumber + 1,
                nextDisable : true
            }));
        } else {
            this.setState({
                nextDisable : true
            })
        }
    }
}

class Instructions extends React.Component {

    render() {

        return (

            <div>
                <p>Instruction 1 Instruction 1 Instruction 1 Instruction 1</p>
                <p>Instruction 2 Instruction 2 Instruction 2 Instruction 2</p>
                <p>Instruction 3 Instruction 3 Instruction 3 Instruction 3</p>
                <p>Instruction 4 Instruction 4 Instruction 4 Instruction 4</p>
                <p>Instruction 5 Instruction 5 Instruction 5 Instruction 5</p>
                <p>Instruction 6 Instruction 6 Instruction 6 Instruction 6</p>
                <p>Instruction 7 Instruction 7 Instruction 7 Instruction 7</p>
                <p>Instruction 8 Instruction 8 Instruction 8 Instruction 8</p>
                <p>Instruction 9 Instruction 9 Instruction 9 Instruction 9</p>
                <p>Instruction 10 Instruction 10 Instruction 10 Instruction 10</p>
            </div>

        )
    }
}

ReactDOM.render(<Quiz/>, document.querySelector('#question'))