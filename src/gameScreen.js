import { getElementById } from "./getElementById.js"
import { centerVertically } from "./centerVertically.js"
import { randomRange } from "./randomRange.js"

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
        this.ballAngle = 0
        this.ballPosition = [0, 0] // An array representing the horizontal and vertical position of the ball in pixels.
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

    newRound() {
        // Centers ball vertically and horizontally on the game screen.
        centerVertically(this.elements.ball)
        this.elements.ball.style.left = `${(document.body.clientWidth / 2) - (this.elements.ball.offsetWidth / 2)}px`

        // Sets the initial position of the ball in the ballPosition array.
        this.ballPosition[0] = this.elements.ball.offsetLeft
        this.ballPosition[1] = this.elements.ball.offsetTop

        this.ballVelocity = document.body.clientWidth / 10

        this.ballAngle = randomRange(Math.PI * -0.25, Math.PI * 0.25)
        this.ballAngle += Math.random() < 0.5 ? 0 : Math.PI
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

        // let newPosition = getNewBallPosition(this.ballPosition, this.ballAngle, this.ballVelocity, elapsedSeconds)
        const velocityXY = getXYFromAngleAndVelocity(this.ballAngle, this.ballVelocity)
        let newPosition = getNewBallPosition(this.ballPosition, this.ballAngle, this.ballVelocity, elapsedSeconds)
        if ((newPosition[1] <= 0 && velocityXY[1] < 0) || (newPosition[1] + this.elements.ball.offsetHeight >= document.body.clientHeight && velocityXY[1] > 0)) {
            velocityXY[1] *= -1
            const newAngleAndVelocity = getAngleAndVelocityFromXY(velocityXY[0], velocityXY[1])
            this.ballAngle = newAngleAndVelocity[0]
            this.ballVelocity = newAngleAndVelocity[1]
            newPosition = getNewBallPosition(this.ballPosition, this.ballAngle, this.ballVelocity, elapsedSeconds)
        }
        this.ballPosition = newPosition

        if (newPosition[0] <= 0) {
            this.scores[1] += 1
            this.elements.scoreboard2.innerText = this.scores[1]
            this.newRound()
        }
        if (newPosition[0] >= document.body.clientWidth) {
            this.scores[0] += 1
            this.elements.scoreboard1.innerText = this.scores[0]
            this.newRound()
        }

        // Updates the HTML element representing the ball on the screen to reflect its new position 
        this.elements.ball.style.left = `${Math.floor(this.ballPosition[0])}px`
        this.elements.ball.style.top = `${Math.floor(this.ballPosition[1])}px`

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

function getNewBallPosition(ballPosition, angle, velocity, elapsedSeconds) {
    const offset = [velocity * elapsedSeconds * Math.cos(angle), velocity * elapsedSeconds * Math.sin(angle)]
    return [ballPosition[0] + offset[0], ballPosition[1] + offset[1]]
}

function getXYFromAngleAndVelocity(angle, velocity) {
    return [velocity * Math.cos(angle), velocity * Math.sin(angle)]
}

function getAngleAndVelocityFromXY(x, y) {
    return [Math.atan2(y, x), Math.sqrt(x * x + y * y)]
}

