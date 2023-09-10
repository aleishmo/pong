export function doRectanglesIntersect(rect1, rect2) {
    // Check if one rectangle is to the left of the other
    if (
      rect1.x + rect1.width < rect2.x ||
      rect2.x + rect2.width < rect1.x
    ) {
      return false;
    }
  
    // Check if one rectangle is above the other
    if (
      rect1.y + rect1.height < rect2.y ||
      rect2.y + rect2.height < rect1.y
    ) {
      return false;
    }
  
    // If none of the above conditions are met, the rectangles intersect
    return true;
  }
