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
        this.updateTimerId = undefined
        this.ballVelocity = [0, 0]
        this.ballPosition = [0, 0]
        this.lastUpdateTime = undefined
        this.fps = 30
    }

    start() {
        this.newRound()

        centerVertically(this.elements.paddle1)
        centerVertically(this.elements.paddle2)

        this.elements.scoreboard1.innerText = '0'
        this.elements.scoreboard2.innerText = '0'

        this.updateTimerId = setInterval(() => this.update(), 1000 / this.fps)
    }

    stop() {
        if (this.updateTimerId) clearInterval(this.updateTimerId)
    }

    newRound() {
        centerVertically(this.elements.ball)
        this.elements.ball.style.left = `${(document.body.clientWidth / 2) - (this.elements.ball.offsetWidth / 2)}px`

        this.ballPosition[0] = this.elements.ball.offsetLeft
        this.ballPosition[1] = this.elements.ball.offsetTop

        this.ballVelocity = [
            randomRange(document.body.clientWidth / 6, document.body.clientWidth / 4), 
            randomRange(document.body.clientHeight / 6, document.body.clientHeight / 4)
        ]

        console.log(this.ballVelocity)
    }

    update() {
        if (!this.lastUpdateTime) {
            this.lastUpdateTime = Date.now()
            return
        }
        const elapsedMs = Date.now() - this.lastUpdateTime
        const elapsedSeconds = elapsedMs / 1000

        const offset = [this.ballVelocity[0] * elapsedSeconds, this.ballVelocity[1] * elapsedSeconds]

        this.ballPosition[0] += offset[0]
        this.ballPosition[1] += offset[1]

        this.elements.ball.style.left = `${Math.floor(this.ballPosition[0])}px`
        this.elements.ball.style.top = `${Math.floor(this.ballPosition[1])}px`
        
        this.lastUpdateTime = Date.now()
    }

    // make paddles move
    // make ball move to left side of screen 

}
