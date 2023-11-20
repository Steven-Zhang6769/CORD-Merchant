// pages/index/index.js
import { formatNumber, formatTimeWithHours } from "../../util";

const app = getApp();
Page({
    data: {
        merchantData: wx.getStorageSync("merchantData"),
        ownerData: wx.getStorageSync("ownerData"),
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
    error(e) {
        wx.navigateTo({
            url: "/pages/error/index",
        });
    },
    suggestion(e) {
        wx.navigateTo({
            url: "/pages/suggestion/index",
        });
    },
    developer(e) {
        wx.navigateTo({
            url: "/pages/developer/index?",
        });
    },
    updateMerchantNavigator(e) {
        wx.navigateTo({
            url: "/pages/updateMerchant/index",
        });
    },
});
