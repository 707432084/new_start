// pages/gameover/gameover.js
const app = getApp();

Page({
  data: {
    score: 0,
    highScore: 0,
    message: "" // e.g., "You fell into a pit!" or "Time's up!"
  },

  onLoad: function (options) {
    const score = parseInt(options.score) || 0;
    const highScore = parseInt(options.highScore) || app.globalData.highScore || 0; // Ensure highScore is also fetched from global if not in options

    this.setData({
      score: score,
      highScore: highScore,
      // You could pass a reason for game over via options too
      // message: options.message || "Keep trying!"
    });

    // Reset lives for next game session in globalData
    // This assumes a new game starts with full lives
    app.globalData.lives = 3; // Or your default number of lives
  },

  restartGame: function() {
    // Navigate back to the game page. Using reLaunch to ensure a fresh start.
    wx.reLaunch({
      url: '/pages/index/index'
    });
  },

  backToHome: function() {
    // In this simple structure, index IS the home.
    // If you had a dedicated main menu page, you'd navigate there.
    wx.reLaunch({ // reLaunch to clear page stack and go to index
      url: '/pages/index/index' // Or your main menu page if you have one
    });
  },

  viewRank: function() {
    wx.navigateTo({
      url: '/pages/rank/rank'
    });
  },

  onShareAppMessage: function () {
    // Customize share message
    let shareTitle = `我在马里奥闯关中获得了${this.data.score}分！你也来试试？`;
    if (this.data.score > 0 && this.data.score === this.data.highScore) {
      shareTitle = `新纪录！我在马里奥闯关中获得了${this.data.score}分！快来挑战我！`;
    }

    return {
      title: shareTitle,
      path: '/pages/index/index', // Path to the game's main page
      //imageUrl: '/images/mario_share_icon.png' // Optional: path to a custom share image
    };
  },

  onShareTimeline: function() {
    // Optional: For sharing to Moments (朋友圈)
    return {
      title: `我在马里奥闯关中获得了${this.data.score}分！你也来试试？`,
      query: '', // Custom query parameters for the shared page
      // imageUrl: '/images/mario_share_icon.png'
    }
  }
});
