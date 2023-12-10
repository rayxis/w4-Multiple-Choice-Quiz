class Quiz {
	questions = {
		position: 0,    //  The current array index of the question
		current:  null, //  The current question object
		list:     []    //  The list of questions
	}
	quiz      = document.getElementById("quiz");   //  The quiz container
	timer     = {
		countdown: 0,       //  Current countdown in seconds
		display:   document.querySelector(".timer"),   //  The timer display
		id:        null,    //  Timer ID
		penalty:   -10,     //  Penalty for the timer for a wrong answer
		start:     60       //  Starting time of the timer
	}
	score     = {
		display:         document.querySelector(".score"),  //  The score display
		points:          0,     //  Current score
		highScores:      [],    //  High score array
		highScoresLimit: 10     //  Limit of high scores to save
	}
	templates = {
		highScore: document.getElementById("template_high_score").content,  //  The high score template
		new_score: document.getElementById("template_new_score").content,   //  The new score template
		question:  document.getElementById("template_question").content,    //  The question card template
		scorecard: document.getElementById("template_scorecard").content,   //  The scorecard template
		start:     document.getElementById("template_start").content        //  The start card template
	}


	constructor(questions) {
		//  Shuffle the questions, and then the responses for each question.
		this.questions.list = this.shuffle(questions);
		this.questions.list.forEach((question, questionIndex) => {
			const questionCard = this.templates.question.cloneNode(true);

			//  Set the question title (number), and text content.
			questionCard.querySelector(".card__title").textContent = "Question " + (questionIndex + 1);
			questionCard.querySelector(".card__text").textContent  = question.query;

			//  Shuffle the answers.
			question.responses = this.shuffle([question.answer, ...question.responses]);

			// Build the buttons for each response.
			question.responses.forEach(response => {
				const button = document.createElement("button");
				button.classList.add("card__button");
				button.textContent = response;
				button.addEventListener("click", () => this.answer(response));
				questionCard.querySelector('.card__button-container').appendChild(button);
			});

			//  Save the element to the question.
			question.element = questionCard;
		});

		//  Set the display timer.
		this.timerDisplayUpdate(this.timer.start);

		//  Begin with the start card.
		this.cardGet("start");
		// this.cardGet("new_score");
	}

	answer(response) {
		if (this.questions.current.answer === response) {
			//  Correct answer
			this.score.points++;
			this.score.display.textContent = `Score: ${this.score.points}`;
		} else {
			// Incorrect answer
			this.timer.countdown += this.timer.penalty;
		}

		//  Go to the next card (or scorecard, if there are no more questions).
		this.nextQuestion();
	}

	cardGet(cardType) {
		//  Remove the existing card, if there is one.
		this.quiz.querySelector(".card")?.remove();

		//  Retrieve whichever card is being called.
		const card = (cardType === "question") ? this.questions.current.element : this.templates[cardType].cloneNode(true);
		let cardAction;

		if (cardType === "new_score") {
			//  Add the score, and button action for input.
			card.querySelector(".new_score__score").textContent += this.score.points;
			cardAction = () => this.highScoreAdd(this.quiz.querySelector(".new_score__initials").value);
		} else if (cardType === "scorecard") {
			//  Add the score, and an action to the restart button.
			card.querySelector(".scorecard__text").textContent += `${this.score.points} points!`;

			//  Restart action.
			cardAction = () => this.constructor(this.questions.list);
		} else if (cardType === "start") {
			//  Restart action.Start action.
			cardAction = () => this.start();
		}

		//  Add the action to the buttons (actions have already been added to question responses).
		if (cardType !== "question") card.querySelector(".card__button").addEventListener("click", cardAction);

		//  Append the card to the DOM.
		this.quiz.appendChild(card);

		//  Load the high scores.
		if (cardType === "start" || cardType === "scorecard") this.highScoresGet();
	}

	highScoreAdd(initials) {
		//  If the user has a high score, and they've entered their initials, save the high score.
		if (this.highScoreCheck() && initials.length > 0) {
			this.score.highScores.push({
				                           initials: initials,
				                           score:    this.score.points,
				                           time:     (this.timer.start - this.timer.countdown)
			                           });
			//  Sort the high score list by score, and then by time. Limit list of high scores to maximum limit.
			this.score.highScores = this.score.highScores
			                            .sort((a, b) => (a.score !== b.score) ? b.score - a.score : a.time - b.time)
			                            .slice(0, this.score.highScoresLimit);
			//  Save the high score list to local storage.
			localStorage.setItem("highScores", JSON.stringify(this.score.highScores));
		}
		this.cardGet("scorecard");
	}

	highScoreCheck() {
		//  Return true if the current score is greater than zero,
		//   and if the number of high scores is at its limit then it must be greater than the lowest high score.
		return (this.score.points > 0
		        && (this.score.highScores.length < this.score.highScoresLimit
		            || this.score.points > this.score.highScores[this.score.highScores.length - 1]?.score));
	}

	highScoresGet() {
		this.score.highScores = JSON.parse(localStorage.getItem("highScores")) || [];

		//  Update the high score table, if it's being displayed.
		const highScoresTable = this.quiz.querySelector(".high_scores");

		//  If the high score element exists, update it.
		if (highScoresTable) {
			//  Loop through the high score list and remove all the children.
			highScoresTable.childNodes.forEach(child => child.remove());

			//  Loop through the high score list, and add each item to the table.
			this.score.highScores.forEach(highScore => {
				//  Clone the high score row item
				const highScoreItem = this.templates.highScore.cloneNode(true);
				//  Populate initials, score, and time fields; then add it to the DOM.
				highScoreItem.querySelector(".high_scores__item__initials").textContent = highScore.initials;
				highScoreItem.querySelector(".high_scores__item__score").textContent    = highScore.score;
				highScoreItem.querySelector(".high_scores__item__time").textContent     = highScore.time;
				highScoresTable.appendChild(highScoreItem);
			});
		}
	}

	nextQuestion() {
		//  Increase the question position.
		this.questions.position++;


		//  Get the next question if there are more, otherwise stop the quiz.
		if (this.questions.list.length > this.questions.position) {
			this.questions.current = this.questions.list[this.questions.position];
			this.cardGet("question");
		} else this.stop();
	}

	shuffle(list) {
		let result = [];

		//  Loop through the array, randomly selecting the order.
		while (list.length > 0)
			result.push(list.splice(
				Math.floor(Math.random() * list.length), 1)[0]);

		//  Return the result.
		return result;
	}

	start() {
		//  Reset the timer and score.
		this.timer.countdown = this.timer.start;
		this.score.points    = 0;
		//  Start the timer.
		this.timer.id        = setInterval(() => {
			//  Decrement the visual timer by 1 second, and update the display field.
			this.timer.countdown--;
			this.timerDisplayUpdate(this.timer.countdown);
			//  If the timer is 0, go to the scorecard.
			if (this.timer.countdown <= 0) this.stop();
		}, 1000);

		//  Start with the first question.
		this.questions.current = this.questions.list[this.questions.position = 0];
		this.cardGet("question");
	}

	stop() {
		//  Update timer display (in case the last question was a wrong answer), and zero out negative numbers.
		this.timerDisplayUpdate((this.timer.countdown >= 0) ? this.timer.countdown : 0);
		//  Stop the timer and pull up the scorecard.
		clearInterval(this.timer.id);

		//  If there is a new high score, let the user enter their initials, otherwise show the score card.
		if (this.highScoreCheck()) this.cardGet("new_score");
		else this.cardGet("scorecard");
	}

	timerDisplayUpdate(time) {
		//  Update the timer display.
		this.timer.display.textContent = `${time} second${time !== 1 ? "s" : ""}`;
	}
}

/***
 TODO:
  Go over CSS and design (make size adaptable).
  Clean up code.

 ***/