const app = getApp();

Page({
    data: {
        avatarUrl: "./user-unlogin.png",
        userInfo: null,
        logged: false,
        chatRoomEnvId: "cord-4gtkoygbac76dbeb",
        chatRoomCollection: "chats",
        chatRoomGroupId: "",
        chatRoomGroupName: "",
        haoyou_openid: "none",
        onGetUserInfo: null,
        getOpenID: null,
        containerStyle: "",
    },

    onLoad: function (options) {
        this.initializeUserInfo();
        this.setupChatRoom(options);
        this.setupPageHeader(options);
        this.setupUIComponents();
    },

    initializeUserInfo: function () {
        const user = wx.getStorageSync("ownerData");
        const userInfo = {
            nickName: user.username,
            avatarUrl: user.profilePic,
        };

        this.setData({
            avatarUrl: userInfo.profilePic,
            userInfo,
        });
    },

    setupChatRoom: function (options) {
        const { id, name, haoyou_openid = this.data.haoyou_openid } = options;

        this.setData({
            chatRoomGroupId: id,
            chatRoomGroupName: name,
            haoyou_openid,
            options,
        });
    },

    setupPageHeader: function (options) {
        wx.setNavigationBarTitle({
            title: options.name,
        });
    },

    setupUIComponents: function () {
        this.setData({
            onGetUserInfo: this.onGetUserInfo,
            getOpenID: this.getOpenID,
        });

        wx.getSystemInfo({
            success: (res) => {
                if (res.safeArea) {
                    const { top, bottom } = res.safeArea;
                    this.setData({
                        containerStyle: `padding-top: ${/ios/i.test(res.system) ? 1 : 2}px; padding-bottom: ${40 + res.windowHeight - bottom}px`,
                    });
                }
            },
        });
    },

    getOpenID: function () {
        return wx.getStorageSync("openid");
    },

    onGetUserInfo: function (e) {
        if (!this.data.logged && e.detail.userInfo) {
            const { avatarUrl, userInfo } = e.detail;
            this.setData({
                logged: true,
                avatarUrl,
                userInfo,
            });
        }
    },
});
