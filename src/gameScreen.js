import { getElementById } from "./getElementById.js"
import { centerVertically } from "./centerVertically.js"
import { randomRange } from "./randomRange.js"
import { doRectanglesIntersect } from "./doRectanglesIntersect.js"
import { getIntersectionBetweenLines } from "./getIntersectionBetweenLines.js"

const WINNING_SCORE = 2

export class GameScreen {
    constructor() {
        this.elements = {
            paddles: [getElementById('paddle1'), getElementById('paddle2')],
            ball: getElementById('ball'),
            scoreboard: [getElementById('scoreboard1'), getElementById('scoreboard2')],
            gameOverOverlay: getElementById('gameOverOverlay'),
            gameOverMessage: getElementById('gameOverMessage'),
            restartButton: getElementById('restartButton')
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
        this.isGameOver = false

        this.elements.restartButton.addEventListener('click', () => this.start())

        this.pressedKeys = {};
        document.addEventListener('keydown', (event) => {
            this.pressedKeys[event.key] = true;
        });
        document.addEventListener('keyup', (event) => {
            this.pressedKeys[event.key] = false;
        });
    }

    start() {
        this.isGameOver = false
        this.elements.gameOverOverlay.style.visibility = 'hidden'

        this.newRound()

        // Centers paddles vertically on the game screen.
        centerVertically(this.elements.paddles[0])
        centerVertically(this.elements.paddles[1])

        // Sets the initial scores on the scoreboards to zero.
        this.scores = [0, 0]
        this.elements.scoreboard.forEach(scoreboard => scoreboard.innerText = '0')

        // Starts the game loop by setting an interval with a frequency of 1000 / this.fps (which is approximately 33.33 ms for a target of 30 FPS). The interval triggers the update method repeatedly to update the game state.
        this.updateTimerId = setInterval(() => this.update(), 1000 / this.fps)
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

        try {
            if (this.isGameOver) return

            this.handleKeyDown(elapsedSeconds)

            const paddleRects = [
                {
                    x: this.elements.paddles[0].offsetLeft,
                    y: this.elements.paddles[0].offsetTop,
                    width: this.elements.paddles[0].offsetWidth,
                    height: this.elements.paddles[0].offsetHeight
                }, {
                    x: this.elements.paddles[1].offsetLeft,
                    y: this.elements.paddles[1].offsetTop,
                    width: this.elements.paddles[1].offsetWidth,
                    height: this.elements.paddles[1].offsetHeight
                }
            ]

            const maxBallMovement = paddleRects[0].width

            let newBallPosition = {
                x: this.ballPosition.x + this.ballDirection.x * this.ballVelocity * elapsedSeconds,
                y: this.ballPosition.y + this.ballDirection.y * this.ballVelocity * elapsedSeconds
            }

            const isBallHeadingAboveScreen = newBallPosition.y <= 0 && this.ballDirection.y < 0
            const isBallHeadingBelowScreen = newBallPosition.y + this.elements.ball.offsetHeight >= document.body.clientHeight && this.ballDirection.y > 0

            if (isBallHeadingAboveScreen || isBallHeadingBelowScreen) {
                this.ballDirection.y *= -1
            }

            const ballWidth = this.elements.ball.offsetWidth
            const ballHeight = this.elements.ball.offsetHeight
            const halfBallWidth = ballWidth * 0.5
            const halfBallHeight = ballHeight * 0.5

            for (let paddleIndex = 0; paddleIndex <= 1; paddleIndex++) {
                if (paddleIndex === 0 && this.ballDirection.x > 0) continue
                if (paddleIndex === 1 && this.ballDirection.x < 0) continue

                const paddleRect = paddleRects[paddleIndex]
                const collisionCentre = getIntersectionBetweenLines({
                    x1: this.ballPosition.x + halfBallWidth,
                    y1: this.ballPosition.y + halfBallHeight,
                    x2: newBallPosition.x + halfBallWidth,
                    y2: newBallPosition.y + halfBallHeight,
                }, {
                    x1: paddleRect.x + (paddleIndex === 0 ? paddleRect.width : 0),
                    y1: paddleRect.y,
                    x2: paddleRect.x + (paddleIndex === 0 ? paddleRect.width : 0),
                    y2: paddleRect.y + paddleRect.height,
                })
                if (collisionCentre) {
                    newBallPosition = {
                        x: collisionCentre.x - (paddleIndex * ballWidth),
                        y: collisionCentre.y - halfBallHeight,
                    }
                    this.ballDirection.x *= -1
                    this.ballVelocity = Math.min(this.ballVelocity * 1.2, document.body.clientWidth)
                    break
                }
            }

            this.updateBallPosition(newBallPosition.x, newBallPosition.y)

            if (newBallPosition.x <= 0) {
                this.increaseScore(1)
            }
            if (newBallPosition.x >= document.body.clientWidth) {
                this.increaseScore(0)
            }
        } finally {
            // Updates the lastUpdateTime.
            this.lastUpdateTime = Date.now()
        }
    }

    increaseScore(playerIndex) {
        this.scores[playerIndex]++

        this.elements.scoreboard[playerIndex].innerText = this.scores[playerIndex]

        const winningIndex = this.scores.findIndex(score => score === WINNING_SCORE)
        if (winningIndex > -1) {
            gameOverMessage.innerText = `Player ${winningIndex + 1} wins!`
            this.isGameOver = true
            this.elements.gameOverOverlay.style.visibility = 'visible'
        } else {
            this.newRound()
        }
    }

    // Moves paddles up and down
    handleKeyDown(elapsedSeconds) {
        const distance = document.body.clientHeight / 2 * elapsedSeconds

        if (this.pressedKeys['w']) {
            this.movePaddle(0, -distance)
        }

        if (this.pressedKeys['s']) {
            this.movePaddle(0, distance)
        }

        if (this.pressedKeys['ArrowUp']) {
            this.movePaddle(1, -distance)
        }

        if (this.pressedKeys['ArrowDown']) {
            this.movePaddle(1, distance)
        }
    }

    movePaddle(paddleIndex, distance) {
        const paddle = this.elements.paddles[paddleIndex]

        let top = paddle.offsetTop
        const height = paddle.offsetHeight

        top += distance

        if (top < 0) {
            top = 0
        }

        if (top + height > document.body.clientHeight) {
            top = document.body.clientHeight - height
        }

        paddle.style.top = `${top}px`
    }
}
