/**
 * Utilitários para scroll e centralização de elementos
 */

export const scrollToElement = (element: HTMLElement, options?: {
  behavior?: 'smooth' | 'instant';
  block?: 'start' | 'center' | 'end';
  inline?: 'start' | 'center' | 'end';
  offset?: number;
}) => {
  const {
    behavior = 'smooth',
    block = 'center',
    inline = 'nearest',
    offset = 0
  } = options || {};

  if (offset !== 0) {
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition + offset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior
    });
  } else {
    element.scrollIntoView({
      behavior,
      block,
      inline
    });
  }
};

export const scrollToElementById = (elementId: string, options?: {
  behavior?: 'smooth' | 'instant';
  block?: 'start' | 'center' | 'end';
  inline?: 'start' | 'center' | 'end';
  offset?: number;
}) => {
  const element = document.getElementById(elementId);
  if (element) {
    scrollToElement(element, options);
  }
};

export const scrollToElementWithDelay = (element: HTMLElement, delay: number = 300, options?: {
  behavior?: 'smooth' | 'instant';
  block?: 'start' | 'center' | 'end';
  inline?: 'start' | 'center' | 'end';
  offset?: number;
}) => {
  setTimeout(() => {
    scrollToElement(element, options);
  }, delay);
};