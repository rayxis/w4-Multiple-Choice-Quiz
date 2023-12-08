let quiz;

class Quiz {
	currentCount    = 0;
	currentQuestion = null;
	currentTimer    = 60;
	currentTimerID  = null;
	questions       = [];
	score           = 0;
	timerPenalty    = -10;

	elements  = {
		answers: null,
		quiz:    document.getElementById("quiz"),
		score:   document.querySelector(".score"),
		timer:   document.querySelector(".timer")
	}
	templates = {
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
			//  Stop the timer.
			this.stop();

			//  Add the score, and an action to the restart button.
			card.querySelector(".scorecard__text").textContent = this.score + "/" + this.questions.length;

			//  Restart action.
			cardAction = () => this.constructor(this.questions);
			//  Start action.
		} else if (cardType === "start") cardAction = () => this.start();

		//  Add the action to the buttons (actions have already been added to question responses).
		if (cardType !== "question") card.querySelector(".card__button").addEventListener("click", cardAction);

		//  Append the card to the DOM.
		this.elements.quiz.appendChild(card);
	}

	cardRemove() {
		//  Remove any existing cards.
		this.elements.quiz.querySelector(".card")?.remove();
	}

	nextQuestion() {
		this.currentCount++;

		if (this.questions.length > this.currentCount) {
			//  Get the next question.
			this.currentQuestion = this.questions[this.currentCount];
			this.cardAdd("question");

			//  No more questions, get the scorecard.
		} else this.cardAdd("scorecard");
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
		//  Reset the score.
		this.score          = 0;
		//  Start the timer.
		this.currentTimerID = setInterval(() => {
			this.currentTimer--;
			this.elements.timer.textContent = this.currentTimer + " second";
			if (this.currentTimer !== 1) this.elements.timer.textContent += "s";
			if (this.currentTimer === 0) this.cardAdd("scorecard");
		}, 1000);

		//  Start with the first question.
		this.currentCount    = 0;
		this.currentQuestion = this.questions[this.currentCount];
		this.cardAdd("question");
	}

	stop() {
		clearInterval(this.currentTimerID);
	}
}

quiz = new Quiz(questions);

/***
 TODO:
  Show fun fact when the card is answered.
  Maybe add a pause button.
  Separate Score functions?
  Definitely work on the design next (start screen and scorecard), and overall container.
  Consider adding all of the cards in the constructor and then just toggling a hidden class/style.
  Upon answering incorrectly (on the last question), consider reducing the timer by 10 even though it doesn't matter anymore.
 ***/