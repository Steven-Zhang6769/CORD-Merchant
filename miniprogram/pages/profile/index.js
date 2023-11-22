// pages/index/index.js
import { formatNumber, formatTimeWithHours } from "../../util";

const app = getApp();
Page({
    data: {
        merchantData: wx.getStorageSync("merchantData"),
        ownerData: wx.getStorageSync("ownerData"),
        loading: false,
        active: 4,
        pagePath: ["/pages/index/index", "/pages/request/index", "/pages/calendar/index", "/pages/messages/index", "/pages/profile/index"],
    },

    async onLoad(options) {
        this.showLoading();
        const merchantData = await app.globalData.merchantManager.getMerchantData(this.data.ownerData._id, app, true);
        const ownerData = await app.globalData.ownerManager.getOwnerData(this.data.ownerData._id, app, true);
        this.setData({
            merchantData,
            ownerData,
        });
        this.hideLoading();
    },
    onShow() {
        this.setData({
            merchantData: app.globalData.merchantData,
        });
    },
    onPullDownRefresh: async function () {
        this.onLoad();
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
    onSwipeCellClick(event) {
        console.log(event);
    },
    async onSwipeCellClose(event) {
        const { position, instance, name } = event.detail;
        switch (position) {
            case "left":
                wx.navigateTo({
                    url: "/pages/updateService/index?id=" + name,
                });
                instance.close();
                break;
            case "cell":
                instance.close();
                break;
            case "right":
                const res = await wx.showModal({
                    title: "确认服务删除",
                    content: "确定要删除该服务吗？",
                    confirmText: "删除",
                });

                if (res.confirm) {
                    wx.showLoading({ title: "删除中" });
                    const res = await app.globalData.serviceManager.deleteService(name);
                    if (res) {
                        await app.globalData.merchantManager.getMerchantData(this.data.ownerData._id, app, true);
                        wx.showToast({
                            title: "删除成功",
                            icon: "success",
                        });
                        this.loadServices();
                    } else {
                        wx.showToast({
                            title: "删除失败",
                            icon: "error",
                        });
                    }
                }
                wx.hideLoading();
                instance.close();
                break;
        }
    },
    addServiceNavigator(e) {
        wx.navigateTo({
            url: "/pages/addService/index",
        });
    },
    merchantDetailNavigator(e) {
        wx.navigateTo({
            url: "/pages/merchantDetail/index",
        });
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
