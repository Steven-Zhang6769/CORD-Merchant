// pages/index/index.js
import { formatNumber, formatTimeWithHours } from "../../util";

const app = getApp();
Page({
    data: {
        merchantData: app.globalData.merchantData,
        ownerData: wx.getStorageSync("ownerData"),
        friendList: wx.getStorageSync("ownerData").friendList,
        openid: wx.getStorageSync("openid"),
        db: app.globalData.db,
        loading: true,
        active: 3,
        pagePath: ["/pages/index/index", "/pages/request/index", "/pages/calendar/index", "/pages/messages/index", "/pages/profile/index"],
    },

    onLoad(options) {},
    chat(e) {
        console.log(e);
        let chatID = e.currentTarget.dataset.chatid;
        let name = e.currentTarget.dataset.name;
        let targetOpenID = e.currentTarget.dataset.openid;
        wx.navigateTo({
            url: "/pages/example/chatroom_example/room/room?id=" + chatID + "&name=" + name + "&haoyou_openid=" + targetOpenID,
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
