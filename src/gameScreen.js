import { getElementById } from "./getElementById.js"
import { centerVertically } from "./centerVertically.js"
import { randomRange } from "./randomRange.js"
import { doRectanglesIntersect } from "./doRectanglesIntersect.js"

export class GameScreen {
    constructor() {
        this.elements = {
            paddle1: getElementById('paddle1'),
            paddle2: getElementById('paddle2'),
            ball: getElementById('ball'),
            scoreboard1: getElementById('scoreboard1'),
            scoreboard2: getElementById('scoreboard2'),
        }
        this.updateTimerId = undefined // Stores the ID of the interval used to update the game state continuously.
        this.ballVelocity = 0 // The velocity of the ball
        this.ballPosition = {
            x: 0,
            y: 0
        }
        this.ballDirection = {
            x: 0,
            y: 0
        }
        this.scores = [0, 0]
        this.lastUpdateTime = undefined // Stores the timestamp of the last game update to calculate the time elapsed between updates.
        this.fps = 30 // The desired frames per second for the game. It's set to 30, meaning the game aims to update the screen 30 times per second.
    }

    start() {
        this.newRound()

        // Centers paddles vertically on the game screen.
        centerVertically(this.elements.paddle1)
        centerVertically(this.elements.paddle2)

        // Sets the initial scores on the scoreboards to zero.
        this.elements.scoreboard1.innerText = '0'
        this.elements.scoreboard2.innerText = '0'

        // Starts the game loop by setting an interval with a frequency of 1000 / this.fps (which is approximately 33.33 ms for a target of 30 FPS). The interval triggers the update method repeatedly to update the game state.
        this.updateTimerId = setInterval(() => this.update(), 1000 / this.fps)

        // Add event listener to handle keyboard input
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    stop() {
        if (this.updateTimerId) clearInterval(this.updateTimerId)
    }

    updateBallPosition(x, y) {
        this.ballPosition = { x, y }
        this.elements.ball.style.left = `${Math.floor(this.ballPosition.x)}px`
        this.elements.ball.style.top = `${Math.floor(this.ballPosition.y)}px`
    }

    newRound() {
        this.ballVelocity = document.body.clientWidth / 5

        let ballAngle = randomRange(Math.PI * -0.25, Math.PI * 0.25)
        ballAngle += Math.random() < 0.5 ? 0 : Math.PI

        this.ballDirection = {
            x: Math.cos(ballAngle),
            y: Math.sin(ballAngle)
        }

        this.updateBallPosition(
            (document.body.clientWidth / 2) - (this.elements.ball.offsetWidth / 2),
            (document.body.clientHeight / 2) - (this.elements.ball.offsetHeight / 2)
        )
    }

    // The update method is the heart of the game loop and is called repeatedly based on the set interval. 
    update() {
        // Initializes the lastUpdateTime property when it is not already set.
        if (!this.lastUpdateTime) {
            this.lastUpdateTime = Date.now()
            return
        }

        // Calculates the time elapsed since the last update by subtracting the timestamp of the last update from the current timestamp.
        const elapsedMs = Date.now() - this.lastUpdateTime
        const elapsedSeconds = elapsedMs / 1000

        let newBallPosition = {
            x: this.ballPosition.x + this.ballDirection.x * this.ballVelocity * elapsedSeconds,
            y: this.ballPosition.y + this.ballDirection.y * this.ballVelocity * elapsedSeconds
        }

        const isBallHeadingAboveScreen = newBallPosition.y <= 0 && this.ballDirection.y < 0
        const isBallHeadingBelowScreen = newBallPosition.y + this.elements.ball.offsetHeight >= document.body.clientHeight && this.ballDirection.y > 0

        if (isBallHeadingAboveScreen || isBallHeadingBelowScreen) {
            this.ballDirection.y *= -1
        }

        const ballRect = {
            x: this.elements.ball.offsetLeft,
            y: this.elements.ball.offsetTop,
            width: this.elements.ball.offsetWidth,
            height: this.elements.ball.offsetHeight
        }

        const paddle1Rect = {
            x: this.elements.paddle1.offsetLeft,
            y: this.elements.paddle1.offsetTop,
            width: this.elements.paddle1.offsetWidth,
            height: this.elements.paddle1.offsetHeight
        }

        const paddle2Rect = {
            x: this.elements.paddle2.offsetLeft,
            y: this.elements.paddle2.offsetTop,
            width: this.elements.paddle2.offsetWidth,
            height: this.elements.paddle2.offsetHeight
        }

        const didHitPaddle1 = doRectanglesIntersect(ballRect, paddle1Rect) && this.ballDirection.x < 0
        const didHitPaddle2 = doRectanglesIntersect(ballRect, paddle2Rect) && this.ballDirection.x > 0

        if (didHitPaddle1 || didHitPaddle2) {
            this.ballDirection.x *= -1
        }

        this.updateBallPosition(newBallPosition.x, newBallPosition.y)

        if (newBallPosition.x <= 0) {
            this.scores[1] += 1
            this.elements.scoreboard2.innerText = this.scores[1]
            this.newRound()
        }
        if (newBallPosition.x >= document.body.clientWidth) {
            this.scores[0] += 1
            this.elements.scoreboard1.innerText = this.scores[0]
            this.newRound()
        }

        // Updates the lastUpdateTime.
        this.lastUpdateTime = Date.now()
    }

    // Moves paddles up and down
    handleKeyDown(event) {
        if (event.key === 'w') {
            // Move the first paddle up
            this.elements.paddle1.style.top = `${this.elements.paddle1.offsetTop - document.body.clientHeight / 20}px`
        } else if (event.key === 's') {
            // Move the first paddle down
            this.elements.paddle1.style.top = `${this.elements.paddle1.offsetTop + document.body.clientHeight / 20}px`
        }

        if (event.key === 'ArrowUp') {
            // Move the second paddle up
            this.elements.paddle2.style.top = `${this.elements.paddle2.offsetTop - document.body.clientHeight / 20}px`
        } else if (event.key === 'ArrowDown') {
            // Move the second paddle down
            this.elements.paddle2.style.top = `${this.elements.paddle2.offsetTop + document.body.clientHeight / 20}px`
        }
    }
}
