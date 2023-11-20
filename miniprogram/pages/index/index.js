// pages/index/index.js
import { formatNumber, formatTimeWithHours } from "../../util";
const app = getApp();
Page({
    data: {
        merchantData: app.globalData.merchantData,
        ownerData: wx.getStorageSync("ownerData"),
        db: app.globalData.db,
        loading: true,
        active: 0,
        pagePath: ["/pages/index/index", "/pages/request/index", "/pages/calendar/index", "/pages/messages/index", "/pages/profile/index"],
    },

    onLoad(options) {
        this.loadOrders();
    },

    async loadOrders() {
        this.showLoading();
        try {
            const pendingOrders = await app.globalData.orderManager.getMerchantStatusOrders(this.data.merchantData._id, "pending");
            const paidOrders = await app.globalData.orderManager.getMerchantStatusOrders(this.data.merchantData._id, "paid");
            this.setData({
                pendingOrders,
                paidOrders,
                loading: false,
            });
            this.hideLoading();
        } catch (error) {
            console.error("Error loading orders:", error);
        }
    },

    onTabChange(event) {
        if (event.detail != this.data.active) {
            wx.switchTab({
                url: this.data.pagePath[event.detail],
            });
        }
    },
    orderNavigator(e) {
        wx.navigateTo({
            url: "/pages/orderDetail/index?orderid=" + e.currentTarget.dataset.orderid,
        });
    },
    showLoading() {
        this.setData({ loading: true });
    },
    hideLoading() {
        this.setData({ loading: false });
    },
});
