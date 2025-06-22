const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

// Simple debounce function
const debounce = (func, delay) => {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
}

// Simple throttle function
const throttle = (func, limit) => {
  let inThrottle;
  let lastFunc;
  let lastRan;
  return function(...args) {
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      lastRan = Date.now();
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
        if (lastFunc) {
          lastFunc.apply(context, args); // Call the last invocation if any
          lastRan = Date.now();
          lastFunc = null; // Clear it
        }
      }, limit);
    } else {
      // If called again within the limit, store it to run after timeout
      lastFunc = func;
    }
  };
}


// Check for collision between two rectangular objects
// Assumes objects have x, y, width, height properties
const checkCollision = (obj1, obj2) => {
  return obj1.x < obj2.x + obj2.width &&
         obj1.x + obj1.width > obj2.x &&
         obj1.y < obj2.y + obj2.height &&
         obj1.y + obj1.height > obj2.y;
}

// Generate a random integer within a range (min and max inclusive)
const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


module.exports = {
  formatTime,
  debounce,
  throttle,
  checkCollision,
  getRandomInt
}
