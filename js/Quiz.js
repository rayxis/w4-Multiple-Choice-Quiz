class Quiz {
	questions = {
		current:  null, //  The current question object
		limit:    10,   //  The maximum number of questions
		list:     [],   //  The list of questions
		position: -1,   //  The current array index of the question
	};
	quiz      = document.getElementById("quiz");   //  The quiz container
	timer     = {
		countdown: 0,       //  Current countdown in seconds
		display:   document.querySelector(".timer"),   //  The timer display
		id:        null,    //  Timer ID
		penalty:   -10,     //  Penalty for the timer for a wrong answer
		start:     60       //  Starting time of the timer
	};
	score     = {
		display:         document.querySelector(".score"),  //  The score display
		points:          0,     //  Current score
		highScores:      [],    //  High score array
		highScoresLimit: 10     //  Limit of high scores to save
	};
	templates = {
		highScore:      document.getElementById("template_high_score_entry").content,    //  The high score template
		highScoreTable: document.getElementById("template_high_score_list").content, //  The high score list template
		new_score:      document.getElementById("template_new_score").content,           //  The new score template
		question:       document.getElementById("template_question").content,            //  The question card template
		scorecard:      document.getElementById("template_scorecard").content,           //  The scorecard template
		start:          document.getElementById("template_start").content                //  The start card template
	};


	constructor(questions) {
		//  If settings are present, use them (otherwise use defaults).
		if (this.questions.hasOwnProperty('settings')) {
			this.questions.limit       = this.questions.settings.questionsLimit;
			this.score.highScoresLimit = this.questions.settings.highScoresLimit;
			this.timer.penalty         = this.questions.settings.timerPenalty;
			this.timer.start           = this.questions.settings.timerStart;
		}
		//  Shuffle the questions, and then the responses for each question.
		this.questions.list = this.shuffle(questions.list);
		this.questions.list.forEach((question, questionIndex) => {
			const questionCard = this.templates.question.cloneNode(true);

			//  Set the question title (number), and text content.
			questionCard.querySelector(".card__title").textContent = "Question " + (questionIndex + 1);
			questionCard.querySelector(".card__text").textContent  = question.query;

			//  Shuffle the answers.
			question.responses = this.shuffle([question.answer, ...question.responses]);

			// Build the buttons for each response.
			question.responses.forEach(response => {
				const button = this.buttonMake(response, () => this.answer(response));
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
			//  Correct answer, increase the score and update the display.
			this.score.points++;
			this.score.display.textContent = `Score: ${this.score.points}`;
		} else {
			// Incorrect answer
			this.timer.countdown += this.timer.penalty;
		}

		//  Go to the next card (or scorecard, if there are no more questions).
		this.nextQuestion();
	}

	buttonMake(text, action) {
		//  Create a new button element. Add the button class, text content, and add an event listener.
		const button = document.createElement("button");
		button.classList.add("card__button");
		button.textContent = text;
		button.addEventListener("click", action);

		//  Return the button element
		return button;
	}

	cardGet(cardType) {
		let cardAction;
		let cardButtonText;

		//  Remove the existing card, if there is one.
		this.quiz.querySelector(".card")?.remove();

		//  Retrieve the element for whichever card is being called.
		const card = (cardType === "question") ? this.questions.current.element : this.templates[cardType].cloneNode(true).querySelector(".card");

		if (cardType === "new_score") {
			//  Add the score, button action and text for input.
			card.querySelector(".new_score__score").textContent += this.score.points;
			cardAction     = () => this.highScoreAdd(this.quiz.querySelector(".new_score__initials").value);
			cardButtonText = "Submit";
		} else if (cardType === "scorecard") {
			//  Add the score, and an action to the restart button.
			card.querySelector(".scorecard__text").textContent = `You scored ${this.score.points} points in ${this.timer.start - this.timer.countdown} seconds!`;

			//  Restart action and text.
			cardAction     = () => this.constructor(this.questions.list);
			cardButtonText = "Start Over?";
		} else if (cardType === "start") {
			//  Restart action.Start action.
			cardAction     = () => this.start();
			cardButtonText = "Start";
		}

		//  Load the high scores.
		if (cardType === "start" || cardType === "scorecard") card.appendChild(this.highScoresGet());

		//  Add the action to the buttons (actions have already been added to question responses).
		if (cardType !== "question") card.appendChild(this.buttonMake(cardButtonText, cardAction));

		//  Append the card to the DOM.
		this.quiz.appendChild(card);
	}

	highScoreAdd(initials) {
		//  If the user has a high score, and they've entered their initials, save the high score.
		if (this.highScoreCheck() && initials.length > 0) {
			this.score.highScores.push({
				                           initials: initials.substring(0,3).toUpperCase(),
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

		//  Clone the high score table template, and get the high scores table element.
		const highScoresTable = this.templates.highScoreTable.cloneNode(true).querySelector(".high_scores");

		//  If there are no high scores, add a message to the table
		if (this.score.highScores.length === 0) {
			//  Remove the heading row.
			highScoresTable.children[0].remove();

			//  Create a new list item letting the user know there are no high scores yet.
			const highScoreItem = document.createElement("li");
			highScoreItem.classList.add("high_scores__item");
			highScoreItem.textContent = "No high scores yet.";
			highScoresTable.appendChild(highScoreItem);
		} else
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
		//  Return the element.
		return highScoresTable;
	}

	nextQuestion() {
		//  Increase the question position.
		this.questions.position++;

		//  Get the next question if there are more (and the limit has not been reached), otherwise stop the quiz.
		if (this.questions.list.length > this.questions.position && this.questions.position < this.questions.limit) {
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
		this.questions.position = -1;
		this.nextQuestion();
	}

	stop() {
		//  Update timer display (in case the last question was a wrong answer), and zero out negative numbers.
		this.timerDisplayUpdate((this.timer.countdown >= 0) ? this.timer.countdown : 0);
		//  Stop the timer and pull up the scorecard.
		clearInterval(this.timer.id);

		//  If there is a new high score, let the user enter their initials, otherwise show the scorecard.
		if (this.highScoreCheck()) this.cardGet("new_score");
		else this.cardGet("scorecard");
	}

	timerDisplayUpdate(time) {
		//  Update the timer display.
		this.timer.display.textContent = `${time} second${time !== 1 ? "s" : ""}`;
	}
}
