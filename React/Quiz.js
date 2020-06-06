class Question extends React.Component {

    render() {

        return (

            <div>

                <h3>{this.props.question}</h3>

                {this.props.options.map((option, i) =>

                    <div key={i}>                                    
                        <input type="radio" name="options" value={option} onClick={this.props.handleChange}/>{option}
                    </div>  

                )}
                                                                              
                <br/>

                <button className="prev" onClick={this.props.previous} disabled={this.props.prevDisable}>Previous</button>
                <button className="next" onClick={this.props.next} disabled={this.props.nextDisable}>Next</button>

                <br/>
                <button onClick={this.props.submit}>Finish</button>

            </div>
        )
    }
}


class Quiz extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            data : [
                        {question: "First Question", options: ["A", "B", "C", "D"], answer: "C"},
                        {question: "Second Question", options: ["B", "C", "D", "A"], answer: "B"},
                        {question: "Third Question", options: ["A", "B", "C", "D"], answer: "A"}
                   ],

            questionNumber : 0,
            answers : [],
            prevDisable : false,
            nextDisable : false,
            submit : false
        }

        this.submit = this.submit.bind(this);
        this.previous = this.previous.bind(this);
        this.next = this.next.bind(this);
        this.handleChange = this.handleChange.bind(this);
    };

    componentDidMount() {

        this.state.data.forEach( e => {
            this.state.answers.push("")
        });

        this.previous()
    }

    render() {

        if (!this.state.submit) {

            return (
                
                <Question question={this.state.data[this.state.questionNumber].question} 
                          options={this.state.data[this.state.questionNumber].options} 
                          answer={this.state.data[this.state.questionNumber].answer} 
                          handleChange={this.handleChange} submit={this.submit}
                          previous={this.previous} next={this.next} 
                          prevDisable={this.state.prevDisable} nextDisable={this.state.nextDisable}/>
            )
        } else {

            let correctAnswers = 0;
            this.state.answers.map((option, i) => {
                
                if (option === this.state.data[i].answer) {
                    correctAnswers++;
                }
    
            });
            
            return (
                <h1>You have scored {correctAnswers} out of {this.state.answers.length}</h1>
            )
        }
    }

    handleChange(event) {

        this.state.answers[this.state.questionNumber] = event.target.value;
    }

    submit() { 
               
        this.setState({
            submit : true,
        });
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

ReactDOM.render(<Quiz/>, document.querySelector('#question'))
