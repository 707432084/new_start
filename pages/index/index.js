// pages/index/index.js
const app = getApp();

Page({
  data: {
    score: 0,
    lives: 0,
    highScore: 0,
    isGameOver: false,
    // Canvas related data
    canvasWidth: 375, // Default, will be updated
    canvasHeight: 600, // Default, will be updated
    // Game elements (simplified for now)
    mario: {
      x: 50,
      y: 200, // This will be ground level later
      width: 30,
      height: 40,
      vx: 0, // Velocity x
      vy: 0, // Velocity y
      jumpStrength: 10,
      isJumping: false,
      speed: 5,
      color: 'red'
    },
    groundHeight: 50, // Height of the ground from the bottom
    platforms: [ // Example platforms
      { x: 100, y: 150, width: 80, height: 20, color: 'green' },
      { x: 250, y: 100, width: 100, height: 20, color: 'green' }
    ],
    // Game loop
    gameInterval: null,
    lastFrameTime: 0,
    gravity: 0.5,
  },

  onLoad: function (options) {
    this.setData({
      highScore: app.globalData.highScore || 0,
      lives: app.globalData.lives,
      score: 0,
    });

    // Get system info for canvas dimensions
    wx.getSystemInfo({
      success: (res) => {
        this.data.canvasWidth = res.windowWidth;
        // Adjust canvas height, e.g. if there's a top bar or bottom controls
        // For a full screen game, it might be res.windowHeight
        this.data.canvasHeight = res.windowHeight - 50; // Assuming a 50px area for scores/controls
        this.data.mario.y = this.data.canvasHeight - this.data.groundHeight - this.data.mario.height; // Initial Y position on ground

        // Update platform positions relative to new canvas height if necessary
        // For simplicity, we'll assume fixed platform Ys are from top for now
        // Or better, define platform Y from bottom:
        this.data.platforms.forEach(p => {
            // Example: p.y = this.data.canvasHeight - p.yFromBottom - p.height;
        });

        this.setData({ // Update data for WXML if canvas dimensions are bound there
            canvasWidth: this.data.canvasWidth,
            canvasHeight: this.data.canvasHeight,
            mario: this.data.mario
        });

        this.ctx = wx.createCanvasContext('gameCanvas');
        this.startGame();
      }
    });
  },

  onUnload: function() {
    this.endGame(false); // Stop game loop when page is unloaded
  },

  onHide: function() {
    // Pause game or stop loop when page is hidden
    if (this.data.gameInterval) {
      clearInterval(this.data.gameInterval);
      this.data.gameInterval = null;
    }
  },

  onShow: function() {
    // Resume game if it was paused, or restart if needed
    // For simplicity, we might just restart or require user to press start again
    // If game was running and just hidden, could resume:
    // if (!this.data.isGameOver && !this.data.gameInterval) {
    //   this.data.lastFrameTime = Date.now();
    //   this.data.gameInterval = setInterval(this.gameLoop, 1000 / 60); // 60 FPS
    // }
     this.setData({ // Refresh score/lives from globalData in case they changed elsewhere
      highScore: app.globalData.highScore || 0,
      lives: app.globalData.lives,
    });
  },

  startGame: function() {
    console.log("Starting game...");
    this.setData({
      score: 0,
      lives: app.globalData.lives, // Reset lives from global
      isGameOver: false,
      'mario.x': 50,
      'mario.y': this.data.canvasHeight - this.data.groundHeight - this.data.mario.height,
      'mario.vx': 0,
      'mario.vy': 0,
      'mario.isJumping': false,
    });
    app.globalData.currentScore = 0;

    if (this.data.gameInterval) {
      clearInterval(this.data.gameInterval);
    }
    this.data.lastFrameTime = Date.now();
    this.data.gameInterval = setInterval(this.gameLoop, 1000 / 60); // Target 60 FPS
  },

  gameLoop: function() {
    const now = Date.now();
    const deltaTime = (now - this.data.lastFrameTime) / 1000; // Delta time in seconds
    this.data.lastFrameTime = now;

    this.update(deltaTime);
    this.render();

    if (this.data.isGameOver) {
      this.endGame(true);
    }
  },

  update: function(deltaTime) {
    let mario = this.data.mario;
    let canvasHeight = this.data.canvasHeight;
    let groundHeight = this.data.groundHeight;
    let gravity = this.data.gravity;

    // Apply gravity
    mario.vy += gravity;
    mario.y += mario.vy;

    // Horizontal movement (will be controlled by touch/buttons later)
    mario.x += mario.vx;

    // Collision with ground
    let groundLevel = canvasHeight - groundHeight - mario.height;
    if (mario.y >= groundLevel) {
      mario.y = groundLevel;
      mario.vy = 0;
      mario.isJumping = false;
    }

    // Collision with platforms (very basic)
    this.data.platforms.forEach(platform => {
      // Check if Mario is falling and was above the platform in the previous frame
      // And if Mario is horizontally aligned with the platform
      if (mario.vy > 0 && // Falling
          (mario.y + mario.height - mario.vy) <= platform.y && // Was above
          (mario.y + mario.height) >= platform.y && // Is now at or below top of platform
          mario.x < platform.x + platform.width &&
          mario.x + mario.width > platform.x) {
        mario.y = platform.y - mario.height;
        mario.vy = 0;
        mario.isJumping = false;
      }
    });

    // Screen boundaries (simple)
    if (mario.x < 0) mario.x = 0;
    if (mario.x + mario.width > this.data.canvasWidth) {
      mario.x = this.data.canvasWidth - mario.width;
    }

    // Check for game over conditions (e.g., falling off screen)
    if (mario.y > canvasHeight) { // Fell below screen
        this.setData({ lives: this.data.lives - 1 });
        app.globalData.lives = this.data.lives;
        if (this.data.lives <= 0) {
            this.data.isGameOver = true; // Set internal flag for gameLoop to catch
        } else {
            // Reset Mario's position for new life
            mario.x = 50;
            mario.y = groundLevel;
            mario.vy = 0;
        }
    }

    this.setData({ mario: mario, score: this.data.score }); // Update mario's state for rendering
    app.globalData.currentScore = this.data.score;
  },

  render: function() {
    const ctx = this.ctx;
    const canvasWidth = this.data.canvasWidth;
    const canvasHeight = this.data.canvasHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw background (could be an image later)
    ctx.fillStyle = '#70c5ce'; // Sky blue
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw ground
    ctx.fillStyle = '#E69A5C'; // Ground color
    ctx.fillRect(0, canvasHeight - this.data.groundHeight, canvasWidth, this.data.groundHeight);

    // Draw platforms
    this.data.platforms.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.width, p.height);
    });

    // Draw Mario
    const mario = this.data.mario;
    ctx.fillStyle = mario.color;
    ctx.fillRect(mario.x, mario.y, mario.width, mario.height);

    // Draw Score and Lives
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${this.data.score}`, 10, 30);
    ctx.fillText(`Lives: ${this.data.lives}`, canvasWidth - 80, 30);

    ctx.draw();
  },

  // --- Touch Controls ---
  touchStartX: 0,
  touchMoveX: 0,
  isMoving: false,

  handleTouchStart: function(e) {
    this.touchStartX = e.touches[0].clientX;
    this.isMoving = true;
  },

  handleTouchMove: function(e) {
    if (!this.isMoving) return;
    this.touchMoveX = e.touches[0].clientX;
    let diffX = this.touchMoveX - this.touchStartX;

    if (diffX > 10) { // Move right threshold
      this.data.mario.vx = this.data.mario.speed;
    } else if (diffX < -10) { // Move left threshold
      this.data.mario.vx = -this.data.mario.speed;
    } else {
      // this.data.mario.vx = 0; // Optional: stop if not moving enough
    }
    // For continuous movement while touch is held, we might not reset touchStartX here
    // Or, if we want swipe-like control:
    // this.touchStartX = this.touchMoveX; // Update start for next segment of movement
  },

  handleTouchEnd: function(e) {
    this.isMoving = false;
    this.data.mario.vx = 0; // Stop Mario when touch ends
  },

  // --- Button Controls (Alternative or Complementary) ---
  moveLeft: function() {
    this.data.mario.vx = -this.data.mario.speed;
  },
  moveRight: function() {
    this.data.mario.vx = this.data.mario.speed;
  },
  stopMove: function() {
      // This might be called on button up if using press-and-hold buttons
      this.data.mario.vx = 0;
  },
  jump: function() {
    if (!this.data.mario.isJumping) {
      this.data.mario.vy = -this.data.mario.jumpStrength;
      this.data.mario.isJumping = true;
    }
  },

  // Example: Add a coin
  addCoin: function() {
      this.setData({ score: this.data.score + 10 });
  },

  endGame: function(shouldNavigate) {
    console.log("Game Over");
    if (this.data.gameInterval) {
      clearInterval(this.data.gameInterval);
      this.data.gameInterval = null;
    }
    this.setData({ isGameOver: true });

    if (this.data.score > this.data.highScore) {
      this.setData({ highScore: this.data.score });
      app.globalData.highScore = this.data.score;
      wx.setStorageSync('highScore', this.data.score);
    }

    app.globalData.currentScore = this.data.score; // Ensure current score is updated globally

    if (shouldNavigate) {
        wx.redirectTo({
          url: `/pages/gameover/gameover?score=${this.data.score}&highScore=${this.data.highScore}`
        });
    }
  },

  // For WXML button bindings if not using canvas for buttons
  triggerJump: function() {
      this.jump();
  },
  triggerMoveLeft: function() {
      this.data.mario.vx = -this.data.mario.speed;
      // For continuous movement, you might need a loop or repeated calls,
      // or set a state and handle in gameLoop. For simplicity, this is an impulse.
      // To make it stop, you'd need a moveStop or handle touchEnd appropriately.
  },
  triggerMoveRight: function() {
      this.data.mario.vx = this.data.mario.speed;
  },
  triggerStopMove: function() {
      this.data.mario.vx = 0;
  }
});
