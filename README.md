# Multiple Choice Quiz

## Description

I used the sort code with compare subfunction
(https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort), as a starting point 
for the high-score sorting function.

## Installation

Installation is simple. Place these files in the root folder of your website directory (ex. /var/www/html), and visit in
your web browser. The screenshots folder and this readme are not necessary for the operation of the quiz and can be
omitted from the website directory.

As long as your webserver is running and properly configured, no additional setup is required.

## Usage

The live version of the quiz can be found here: A live version of this can be viewed
here: https://rayxis.github.io/w2-Multiple-Choice-Quiz/

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