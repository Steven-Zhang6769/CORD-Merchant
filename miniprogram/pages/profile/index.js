// pages/index/index.js
import { formatNumber, formatTimeWithHours } from "../../util";

const app = getApp();
Page({
    data: {
        merchantData: wx.getStorageSync("merchantData"),
        ownerData: wx.getStorageSync("ownerData"),
        db: app.globalData.db,
        loading: true,
        active: 4,
        pagePath: ["/pages/index/index", "/pages/request/index", "/pages/calendar/index", "/pages/messages/index", "/pages/profile/index"],
    },

    onLoad(options) {},
    onTabChange(event) {
        if (event.detail != this.data.active) {
            wx.switchTab({
                url: this.data.pagePath[event.detail],
            });
        }
    },
});
