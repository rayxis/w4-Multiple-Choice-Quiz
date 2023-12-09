let quiz;

class Quiz {
	currentCount      = 0;
	currentQuestion   = null;
	currentTimerStart = 60;
	currentTimer      = 60;
	currentTimerID    = null;
	highScoreLimit    = 10;
	highScoreList     = [];
	questions         = [];
	score             = 0;
	timerPenalty      = -10;

	elements  = {
		answers: null,
		quiz:    document.getElementById("quiz"),
		score:   document.querySelector(".score"),
		timer:   document.querySelector(".timer")
	}
	templates = {
		highscore: document.getElementById("template_highscore").content,
		question:  document.getElementById("template_question").content,
		scorecard: document.getElementById("template_scorecard").content,
		start:     document.getElementById("template_start").content
	}


	constructor(questions) {
		//  Shuffle the questions, and then the responses for each question.
		this.questions = this.shuffle(questions);
		this.questions.forEach((question, questionIndex) => {
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

		this.elements.timer.textContent = this.currentTimer + " seconds";

		//  Begin with the start card.
		this.cardAdd("start");
	}

	answer(response) {
		if (this.currentQuestion.answer === response) {
			//  Correct answer
			this.score++;
			this.elements.score.textContent = `Score: ${this.score}`;
		} else {
			// Incorrect answer
			this.currentTimer += this.timerPenalty;
		}

		//  Go to the next card (or scorecard, if there are no more questions).
		this.nextQuestion();
	}

	cardAdd(cardType) {
		//  Remove any existing cards.
		this.cardRemove();

		//  Retrieve whichever card is being called.
		const card = (cardType === "question") ? this.currentQuestion.element : this.templates[cardType].cloneNode(true);
		let cardAction;

		if (cardType === "scorecard") {
			//  Add the score, and an action to the restart button.
			card.querySelector(".scorecard__text").textContent = this.score + "/" + this.questions.length;

			//  Restart action.
			cardAction = () => this.constructor(this.questions);
			//  Start action.
		} else if (cardType === "start") {
			const highScoreTree = card.querySelector(".highscores");

			this.highScores();
			this.highScoreList.forEach(highScore => {
				let highScoreItem                                                      = this.templates.highscore.cloneNode(true);
				highScoreItem.querySelector(".highscores__item__initials").textContent = highScore.initials;
				highScoreItem.querySelector(".highscores__item__score").textContent    = highScore.score;
				highScoreItem.querySelector(".highscores__item__time").textContent     = highScore.time;
				highScoreTree.appendChild(highScoreItem);
			});

			cardAction = () => this.start();
		}

		//  Add the action to the buttons (actions have already been added to question responses).
		if (cardType !== "question") card.querySelector(".card__button").addEventListener("click", cardAction);

		//  Append the card to the DOM.
		this.elements.quiz.appendChild(card);
	}

	cardRemove() {
		//  Remove the existing card, if there is one.
		this.elements.quiz.querySelector(".card")?.remove();
	}

	nextQuestion() {
		this.currentCount++;

		if (this.questions.length > this.currentCount) {
			//  Get the next question.
			this.currentQuestion = this.questions[this.currentCount];
			this.cardAdd("question");

			//  No more questions, get the scorecard.
		} else this.stop();
	}

	highScores(initials = null) {
		//  If initials are passed, add them to the high scores; otherwise, get the high scores.
		if (initials) {
			//  Only consider adding a high score if the value is greater than 0.
			if (this.score > 0) {
				//  If the high score list is full, and the new score is greater than the lowest high score, drop the lowest high score.
				if (this.highScoreList.length === this.highScoreLimit && this.highScoreList[this.highScoreList.length - 1].score < this.score)
					this.highScoreList.pop();
				//  Save the initials, the score and the timer value.
				this.highScoreList.push({
					                        initials: initials,
					                        score:    this.score,
					                        time:     (this.currentTimerStart - this.currentTimer)
				                        });
				//  Sort the high score list by score, and then by time.
				this.highScoreList = this.highScoreList.sort(
					(a, b) => (a.score !== b.score) ? b.score - a.score : a.time - b.time);
				//  Save the high score list to local storage.
				localStorage.setItem("highScores", JSON.stringify(this.highScoreList));
			}
		} else this.highScoreList = JSON.parse(localStorage.getItem("highScores")) || [];
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
		this.currentTimer   = this.currentTimerStart;
		this.score          = 0;
		//  Start the timer.
		this.currentTimerID = setInterval(() => {
			//  Decrement the visual timer by 1 second, and update the display field.
			this.currentTimer--;
			this.elements.timer.textContent = this.currentTimer + " second";
			//  If the timer is not 1 second, add an "s" to the display field,
			//  and if the timer is 0, go to the scorecard.
			if (this.currentTimer !== 1) this.elements.timer.textContent += "s";
			if (this.currentTimer <= 0) this.stop();
		}, 1000);

		//  Start with the first question.
		this.currentQuestion = this.questions[this.currentCount = 0];
		this.cardAdd("question");
	}

	stop() {
		//  Update timer display (in case the last question was a wrong answer).
		this.elements.timer.textContent = this.currentTimer + " second";
		//  If the timer is not 1 second, add an "s" to the display field,
		//  and if the timer is 0, go to the scorecard.
		if (this.currentTimer !== 1) this.elements.timer.textContent += "s";
		//  Stop the timer and pull up the scorecard.
		clearInterval(this.currentTimerID);
		this.highScores('RB');
		this.cardAdd("scorecard");
	}
}

quiz = new Quiz(questions);

/***
 TODO:
  Definitely work on the design next (start screen and scorecard), and overall container.
  Add initial entry method for highscores.
  Clean up code.
 ***/