const MerchantManager = require("./utils/MerchantManager");
const OrderManager = require("./utils/OrderManager");
const OwnerManager = require("./utils/OwnerManager");

import { fetchDataFromDB } from "./utils/dbUtils";
// app.js
App({
    globalData: {
        userInfo: null,
        friends: [],
        openid: null,
        ownerData: null,
        merchantData: null,
        loginStatus: "notLoggedIn",
    },

    onLaunch: function () {
        this.initializeApp();
    },

    // Main initialization function
    initializeApp: async function () {
        if (!wx.cloud) {
            return console.error("请使用 2.2.3 或以上的基础库以使用云能力");
        }
        this.autoUpdate();

        var c1 = new wx.cloud.Cloud({
            // 资源方 AppID
            resourceAppid: "wxd699b77b51adf6cb",
            // 资源方环境 ID
            resourceEnv: "cord-4gtkoygbac76dbeb",
        });
        await c1.init();
        this.globalData.cloud = c1;

        const merchantManager = new MerchantManager(c1);
        const orderManager = new OrderManager(c1);
        const ownerManager = new OwnerManager(c1);

        this.globalData.merchantManager = merchantManager;
        this.globalData.orderManager = orderManager;
        this.globalData.ownerManager = ownerManager;

        // Get or set openid
        const openid = await this.checkAndGetOpenid(c1);
        if (!openid) return; // Exit if there's no openid

        // Get owner info and subsequently merchant info
        const ownerData = await ownerManager.refreshOwnerData(openid, this);
        if (!ownerData) {
            this.globalData.loginStatus = "notRegistered";
            return;
        }

        console.log("ownerData", ownerData);
        const merchantData = await merchantManager.refreshMerchantData(ownerData._id, this);
        if (!merchantData) {
            this.globalData.loginStatus = "underReview";
            wx.navigateTo({ url: "/pages/pendingReview/index" });
            return;
        }

        this.globalData.loginStatus = "registered";
        wx.switchTab({
            url: "/pages/index/index",
        });
    },

    async checkAndGetOpenid(db) {
        let storedOpenid = wx.getStorageSync("openid");
        if (storedOpenid) {
            this.globalData.openid = storedOpenid;
            return storedOpenid;
        } else {
            try {
                const res = await db.callFunction({ name: "getOpenid" });
                let openid = res.result.event.userInfo.openId;
                wx.setStorageSync("openid", openid);
                this.globalData.openid = openid;
                return openid;
            } catch (err) {
                console.error("Failed to fetch openid:", err);
                wx.showToast({ title: "用户信息获取失败" });
            }
        }
    },

    autoUpdate: function () {
        var self = this;
        // 获取小程序更新机制兼容
        if (wx.canIUse("getUpdateManager")) {
            const updateManager = wx.getUpdateManager();
            //1. 检查小程序是否有新版本发布
            updateManager.onCheckForUpdate(function (res) {
                // 请求完新版本信息的回调
                if (res.hasUpdate) {
                    //检测到新版本，需要更新，给出提示
                    wx.showModal({
                        title: "更新提示",
                        content: "检测到新版本，是否下载新版本并重启小程序？",
                        success: function (res) {
                            if (res.confirm) {
                                //2. 用户确定下载更新小程序，小程序下载及更新静默进行
                                self.downLoadAndUpdate(updateManager);
                            } else if (res.cancel) {
                                //用户点击取消按钮的处理，如果需要强制更新，则给出二次弹窗，如果不需要，则这里的代码都可以删掉了
                                wx.showModal({
                                    title: "提示",
                                    content: "本次版本更新涉及到新的功能添加，旧版本无法正常访问",
                                    showCancel: false, //隐藏取消按钮
                                    confirmText: "确定更新", //只保留确定更新按钮
                                    success: function (res) {
                                        if (res.confirm) {
                                            //下载新版本，并重新应用
                                            self.downLoadAndUpdate(updateManager);
                                        }
                                    },
                                });
                            }
                        },
                    });
                }
            });
        } else {
            wx.showModal({
                title: "提示",
                content: "当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试",
            });
        }
    },
    downLoadAndUpdate: function (updateManager) {
        var self = this;
        wx.showLoading();
        //静默下载更新小程序新版本
        updateManager.onUpdateReady(function () {
            wx.hideLoading();
            //新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate();
        });
        updateManager.onUpdateFailed(function () {
            // 新的版本下载失败
            wx.showModal({
                title: "新版本存在",
                content: "新版本已经上线，请您删除当前小程序，重新搜索打开",
            });
        });
    },
});
