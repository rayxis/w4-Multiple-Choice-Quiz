# Multiple Choice Quiz

## Description

This is a multi-choice question quiz that pulls from a pool of questions and displays a limited amount (default: 10).
The default questions are on fun facts that cover a variety of topics. The questions can easily be swapped out for
another selection of questions.

I used the sort code with compare sub-function
(https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort), as a starting point
for the high-score sorting function.

## Installation

Installation is simple. Place these files in the root folder of your website directory (ex. /var/www/html), and visit in
your web browser. The screenshots folder and this readme are not necessary for the operation of the quiz and can be
omitted from the website directory.

Any changes to the questions can be done in Quiz-questions.js. This is done so that they can easily be swapped out
without disturbing the functionality of the quiz by accidentally deleting or modifying the code. The structure for
this file should remain the same, and all questions placed within the quizQuestions.list array. Each object in the
array has a question (query), a solution (answer), and multiple responses. I've provided 1 correct answer and 4
incorrect answers, for a total of 5; however, any amount of answers may be provided. Additionally, any number of
questions may also be provided. I've included 15.

All numerical amounts are easily configurable in the variable object "settings" at the start of the Quiz-questions.js
file, including (in alphabetical order):

* highScoresLimit - The maximum number of high scores to save.
* questionsLimit - The limit of questions to display per session.
* timerPenalty - The timer penalty for a wrong answer.
* timerStart - The amount of time (in seconds) to start the quiz with.

These settings are optional to change and can remain at the default settings, and will if the settings variable 
object is omitted from the Quiz-questions.js file. No changes should be done to Quiz.js.

As long as your webserver is running and properly configured, no additional setup is required.

## Usage

When the user clicks start the questions are shuffled in a random order, as are the answers to each question. For
every correct answer, the user progresses to the next question. If the user answers incorrectly, the timer is
reduced by 10 seconds (default), and they'll progress to the next question. This will happen until either all questions
are answered, or the timer runs out (default: 60 seconds).

At the conclusion of the quiz, if the user has answered at least one question correctly, and their score is higher
than the lowest high score (default limit: 10), they will be prompted to enter their initials. Regardless of the
outcome, they'll be prompted if they would like to go again.

The live version of the quiz can be found here: A live version of this can be viewed
here: https://rayxis.github.io/w4-Multiple-Choice-Quiz/

## Screenshots

## User Story

```
AS A coding boot camp student
I WANT to take a timed quiz on JavaScript fundamentals that stores high scores
SO THAT I can gauge my progress compared to my peers
```

## Acceptance Criteria

```
GIVEN I am taking a code quiz
WHEN I click the start button
THEN a timer starts and I am presented with a question
WHEN I answer a question
THEN I am presented with another question
WHEN I answer a question incorrectly
THEN time is subtracted from the clock
WHEN all quizQuestions are answered or the timer reaches 0
THEN the game is over
WHEN the game is over
THEN I can save my initials and score
```