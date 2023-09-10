import { doRectanglesIntersect } from "./doRectanglesIntersect"

describe('doRectanglesIntersect', function(){
    it('should return true when two rectangles intersect', function(){
        let rectA = {
            top: 0,
            left: 0,
            width: 2,
            height: 5
        }
        let rectB = {
            top: 1,
            left: 1,
            width: 2,
            height: 2
        }
        const result = doRectanglesIntersect(rectA, rectB)
        expect(result).toBe(true)
    })
})
