
/**
 * Adds an interactive animation class to elements
 * @param selector CSS selector for elements to animate
 */
export function addInteractiveClass(selector: string): void {
  try {
    // Find all elements matching the selector
    const elements = document.querySelectorAll(selector);
    
    // Add event listeners to each element
    elements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        element.classList.add('hover-animation');
      });
      
      element.addEventListener('mouseleave', () => {
        element.classList.remove('hover-animation');
        element.classList.add('hover-animation-out');
        
        // Remove the out animation class after it completes
        setTimeout(() => {
          element.classList.remove('hover-animation-out');
        }, 300);
      });
    });
  } catch (error) {
    console.error('Error adding interactive classes:', error);
  }
}

/**
 * Applies a staggered animation to a list of elements
 * @param selector CSS selector for container
 * @param childSelector CSS selector for child elements to animate
 * @param delay Delay between each animation in milliseconds
 */
export function applyStaggeredAnimation(
  selector: string, 
  childSelector: string,
  delay: number = 50
): void {
  try {
    const container = document.querySelector(selector);
    if (!container) return;
    
    const children = container.querySelectorAll(childSelector);
    
    children.forEach((child, index) => {
      setTimeout(() => {
        child.classList.add('fade-in-animation');
      }, index * delay);
    });
  } catch (error) {
    console.error('Error applying staggered animation:', error);
  }
}
