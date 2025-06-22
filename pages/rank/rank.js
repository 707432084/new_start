// pages/rank/rank.js
const app = getApp();

Page({
  data: {
    rankList: [], // Combined rank list
    myRank: null, // User's rank information
    isLoading: true,
    error: null,
    // For Open Data (Friend Rank)
    useOpenData: true, // Set to true to attempt loading friend ranks
    openDataCanvas: null,
    openDataContext: null,
    // For Server Rank
    serverRankList: [],
  },

  onLoad: function (options) {
    this.setData({ isLoading: true, error: null });
    if (this.data.useOpenData) {
      this.initOpenDataCanvas();
    } else {
      this.getServerRank(); // If not using open data, just get server rank
    }
  },

  onReady: function() {
    // If using open data, post message after canvas is ready
    if (this.data.useOpenData && this.data.openDataContext) {
        this.loadFriendRankings();
    }
  },

  initOpenDataCanvas: function() {
    // Initialize canvas for open data domain
    // This is a common pattern, but ensure your open data domain code handles drawing.
    const query = wx.createSelectorQuery().in(this);
    query.select('#rankCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (res[0] && res[0].node) {
          const canvas = res[0].node;
          const context = canvas.getContext('2d');
          const dpr = wx.getSystemInfoSync().pixelRatio;
          canvas.width = res[0].width * dpr;
          canvas.height = res[0].height * dpr;
          context.scale(dpr, dpr);

          this.data.openDataCanvas = canvas; // Save canvas node if needed by open data domain code
          this.data.openDataContext = wx.getOpenDataContext();
          console.log("Open Data Canvas initialized, context obtained.");

          // It's common to post a message to the open data domain to start drawing.
          // The open data domain will then use wx.onMessage to receive this.
           if (this.data.openDataContext) {
               this.loadFriendRankings(); // Call it here if canvas is ready
           }

        } else {
          console.error("Failed to get rankCanvas node for open data.");
          this.setData({ useOpenData: false }); // Fallback or show error
          this.getServerRank(); // Try server rank if open data canvas fails
        }
        this.setData({ isLoading: false });
      });
  },

  loadFriendRankings: function() {
    if (!this.data.openDataContext) {
        console.log("OpenDataContext not available.");
        this.getServerRank(); // Fallback
        return;
    }
    console.log("Posting message to Open Data Domain to load friend ranks.");
    this.data.openDataContext.postMessage({
      event: 'showFriendRank',
      // You can pass other parameters if your open data domain code needs them
      // e.g. currentHighScore: app.globalData.highScore
    });
     // After posting, the open data domain should handle drawing to its shared canvas.
     // The main domain doesn't directly get the list here, it just triggers display.
     // If you need the data itself, it's more complex (e.g. open data domain draws to shared canvas, then main domain saves it as image)
     // For simplicity, we assume open data draws directly.
     // We will also fetch server ranks to display below or as an alternative.
     this.getServerRank();
  },

  getServerRank: function() {
    this.setData({ isLoading: true });
    // Simulate fetching from server
    setTimeout(() => {
      const mockServerRank = [
        { openid: 'server_user_1', avatarUrl: '/images/avatar_placeholder.png', nickname: '服务器高手1', score: 2500 },
        { openid: 'server_user_2', avatarUrl: '/images/avatar_placeholder.png', nickname: '服务器高手2', score: 2200 },
        { openid: 'server_user_3', avatarUrl: '/images/avatar_placeholder.png', nickname: '路人甲', score: app.globalData.highScore || 50 }, // Include current player's score for context
        { openid: 'server_user_4', avatarUrl: '/images/avatar_placeholder.png', nickname: '服务器高手3', score: 1800 },
      ].sort((a, b) => b.score - a.score);

      this.setData({
        serverRankList: mockServerRank,
        isLoading: false,
        error: null
      });
    }, 1000);

    // Actual implementation:
    // wx.request({
    //   url: 'YOUR_RANK_API_ENDPOINT',
    //   method: 'GET',
    //   data: { userId: app.globalData.userId /* if available */ },
    //   success: (res) => {
    //     if (res.statusCode === 200 && res.data.success) {
    //       this.setData({ serverRankList: res.data.ranks, isLoading: false });
    //     } else {
    //       this.setData({ error: '无法加载排行榜数据', isLoading: false });
    //     }
    //   },
    //   fail: (err) => {
    //     this.setData({ error: '网络错误，请稍后再试', isLoading: false });
    //     console.error("Failed to fetch server rank:", err);
    //   }
    // });
  },

  goBack: function() {
    wx.navigateBack();
  },

  onShareAppMessage: function () {
    return {
      title: '快来看看马里奥闯关排行榜，谁是第一？',
      path: '/pages/rank/rank',
      //imageUrl: '/images/rank_share.png'
    };
  }
});
