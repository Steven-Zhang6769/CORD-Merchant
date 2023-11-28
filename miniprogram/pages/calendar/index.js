// pages/index/index.js
import { formatNumber, formatTimeWithHours } from "../../util";

const app = getApp();
Page({
    data: {
        merchantData: app.globalData.merchantData,
        ownerData: app.globalData.merchantData,
        merchantId: wx.getStorageSync("merchantData")._id,
        ownerId: wx.getStorageSync("ownerData")._id,
        db: app.globalData.db,
        loading: true,
        active: 2,
        pagePath: ["/pages/index/index", "/pages/request/index", "/pages/calendar/index", "/pages/messages/index", "/pages/profile/index"],
    },

    onLoad(options) {
        this.refreshOrders(new Date());
    },
    onPullDownRefresh: async function () {
        await this.refreshOrders(new Date());
        wx.stopPullDownRefresh();
    },

    async refreshOrders(date) {
        this.showLoading();
        const res = await app.globalData.orderManager.getMerchantOrderOnDay(this.data.merchantId, date);
        this.setData({
            orders: res,
        });
        this.hideLoading();
    },
    showLoading() {
        this.setData({ loading: true });
    },

    hideLoading() {
        this.setData({ loading: false });
    },
    async onConfirmDate(e) {
        this.refreshOrders(e.detail);
    },

    orderNavigator(e) {
        wx.navigateTo({
            url: "/pages/orderDetail/index?orderid=" + e.currentTarget.dataset.orderid,
        });
    },
    onTabChange(event) {
        if (event.detail != this.data.active) {
            wx.switchTab({
                url: this.data.pagePath[event.detail],
            });
        }
    },
});
