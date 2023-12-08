let quiz;

class Quiz {
	currentCount    = 0;
	currentQuestion = null;
	currentTimer    = 60;
	currentTimerID  = null;
	questions       = [];
	score           = 0;

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
		this.questions.forEach(
			question => question.responses = this.shuffle([question.answer, ...question.responses]));

		this.cardStart();
	}

	answer(response) {
		if (this.currentQuestion.answer === response) {
			//  Correct answer
			this.score++;
			this.elements.score.textContent = `Score: ${this.score}`;
		} else {
			// Incorrect answer
		}

		//  Go to the next card (or scorecard, if there are no more questions).
		this.nextQuestion();
	}

	cardQuestion() {
		//  Remove any existing cards.
		this.cardRemove();

		let questionCard = this.templates.question.cloneNode(true);

		questionCard.querySelector(".card__title").textContent = "Question " + (this.currentCount + 1);
		questionCard.querySelector(".card__text").textContent  = this.currentQuestion.query;

		//  Append the card to the DOM.
		this.elements.quiz.appendChild(questionCard);

		questionCard = this.elements.quiz.querySelector(".question");

		this.currentQuestion.responses.forEach(response => {
			const button = document.createElement("button");
			button.classList.add("card__button");
			button.textContent = response;
			button.value       = response;
			button.addEventListener("click", () => this.answer(response));
			questionCard.appendChild(button);
		});
	}

	cardRemove() {
		const card = this.elements.quiz.querySelector(".card");
		if (card) card.remove();
	}
	cardStart() {
		//  Remove any existing cards.
		this.cardRemove();
		this.score = 0;

        //  Clone the start card and attach the start function to it.
        const startCard = this.templates.start.cloneNode(true);
        this.elements.quiz.appendChild(startCard);
        this.elements.quiz.querySelector(".card__button").addEventListener("click", () => this.start());
	}

	cardScore() {
		//  Remove any existing cards.
		this.cardRemove();

		this.stop();
		let scoreCard = this.templates.scorecard.cloneNode(true);

		scoreCard.querySelector(".scorecard__text").textContent = this.score + "/" + this.questions.length;

		//  Append the card to the DOM.
		this.elements.quiz.appendChild(scoreCard);
		this.elements.quiz.querySelector(".card__button").addEventListener("click", () => this.cardStart());
	}

	nextQuestion() {
		this.currentCount++;

		if (this.questions.length > this.currentCount) {
			//  Get the next question.
			this.currentQuestion = this.questions[this.currentCount];
			this.cardQuestion();

			//  No more questions, get the scorecard.
		} else this.cardScore();
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
		//  Start the timer.
		this.currentTimerID = setInterval(() => {
			this.currentTimer--;
			this.elements.timer.textContent = this.currentTimer;
			if (this.currentTimer === 0) this.cardScore();
		}, 1000);

		this.currentCount    = 0;
		this.currentQuestion = this.questions[this.currentCount];
		this.cardQuestion();
	}

	stop() {
		clearInterval(this.currentTimerID);
	}
}

quiz = new Quiz(questions);

/***
 TODO:
  Card container isn't really being used yet.
  Show fun fact when the card is answered.
  Maybe add a pause button.
  Separate Score functions?
  Definitely work on the design next (start screen and scorecard), and overall container.
 ***/