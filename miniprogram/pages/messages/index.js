// pages/index/index.js

const app = getApp();
Page({
    data: {
        merchantData: app.globalData.merchantData,
        ownerData: app.globalData.merchantData,
        friendList: app.globalData.merchantData.friendList,
        openid: wx.getStorageSync("openid"),
        db: app.globalData.db,
        loading: true,
        active: 3,
        pagePath: ["/pages/index/index", "/pages/request/index", "/pages/calendar/index", "/pages/messages/index", "/pages/profile/index"],
    },

    async onLoad(options) {
        const res = await app.globalData.ownerManager.refreshOwnerData(this.data.ownerData.openid, app);
        this.setData({
            ownerData: res,
        });
    },
    chat(e) {
        let chatID = e.currentTarget.dataset.chatid;
        let name = e.currentTarget.dataset.name;
        let targetOpenID = e.currentTarget.dataset.openid;
        wx.navigateTo({
            url: "/pages/messaging/room/room?id=" + chatID + "&name=" + name + "&haoyou_openid=" + targetOpenID,
        })
            .then((res) => {
                console.log(res);
            })
            .catch((err) => {
                console.log(err);
            });
    },
    onTabChange(event) {
        if (event.detail != this.data.active) {
            wx.switchTab({
                url: this.data.pagePath[event.detail],
            })
                .then((res) => {
                    console.log(res);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    },
});
