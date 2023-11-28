// pages/index/index.js

const app = getApp();
Page({
    data: {
        merchantData: wx.getStorageSync("merchantData"),
        ownerData: wx.getStorageSync("ownerData"),
        loading: true,
        active: 1,
        pagePath: ["/pages/index/index", "/pages/request/index", "/pages/calendar/index", "/pages/messages/index", "/pages/profile/index"],
        status: ["pending", "paid", "rejected", "complete"],
    },

    onLoad(options) {},
    onPullDownRefresh: async function () {
        await this.loadOrders(this.data.status[this.data.active]);
        wx.stopPullDownRefresh();
    },
    async loadOrders(status) {
        this.showLoading();
        const orders = await app.globalData.orderManager.getMerchantStatusOrders(this.data.merchantData._id, status);
        console.log(orders);
        this.setData({
            orders,
        });
        this.hideLoading();
    },
    showLoading() {
        this.setData({ loading: true });
    },
    hideLoading() {
        this.setData({ loading: false });
    },
    onTabChange(event) {
        if (event.detail != this.data.active) {
            wx.switchTab({
                url: this.data.pagePath[event.detail],
            });
        }
    },
    onCategoryChange(e) {
        this.setData({ loading: true, orders: [] });
        this.loadOrders(this.data.status[e.detail.index]);
    },
    orderNavigator(e) {
        wx.navigateTo({
            url: "/pages/orderDetail/index?orderid=" + e.currentTarget.dataset.orderid,
        });
    },
});
