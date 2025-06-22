// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        console.log('登录成功：', res.code)
        // Example: this.globalData.openid = res.code // Placeholder
      }
    })

    // 初始化游戏相关的全局数据
    this.globalData.highScore = wx.getStorageSync('highScore') || 0;
    // lives is already defined in globalData with a default,
    // so no need to set it here unless fetching from storage too.
    // this.globalData.lives = wx.getStorageSync('lives') || 3; // If you want to store lives
  },
  globalData: {
    userInfo: null,
    highScore: 0, // 全局最高分, 会在onLaunch中从storage加载
    currentScore: 0, // 当前游戏得分
    lives: 3, // 初始生命值
    // openid: null // 可以在登录成功后设置
  }
})
