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
        } else {
            wx.cloud.init({
                env: "merchants-6gv5wehc454a9c3a",
                traceUser: true,
            });
        }
        this.autoUpdate();

        var c1 = new wx.cloud.Cloud({
            // 资源方 AppID
            resourceAppid: "wxd699b77b51adf6cb",
            // 资源方环境 ID
            resourceEnv: "cord-4gtkoygbac76dbeb",
        });
        await c1.init();
        this.globalData.db = c1;

        // Get or set openid
        const openid = await this.checkAndGetOpenid();
        if (!openid) return; // Exit if there's no openid

        // Get owner info and subsequently merchant info
        const ownerData = await this.checkAndGetOwnerData(openid, c1);
        if (!ownerData) {
            this.globalData.loginStatus = "notRegistered";
            return;
        }

        const merchantData = await this.checkAndGetMerchantData(ownerData._id, c1);
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

    async checkAndGetOpenid() {
        const storedOpenid = wx.getStorageSync("openid");
        if (storedOpenid) return storedOpenid;

        try {
            const res = await wx.cloud.callFunction({
                name: "quickstartFunctions",
                config: { env: "merchants-6gv5wehc454a9c3a" },
                data: { type: "getOpenId" },
            });
            const openid = res.result.userInfo.openId;
            wx.setStorageSync("openid", openid);
            this.globalData.openid = openid;
            return openid;
        } catch (err) {
            console.error("Failed to fetch openid:", err);
            wx.showToast({ title: "用户信息获取失败" });
        }
    },

    async checkAndGetOwnerData(openid, db) {
        const storedOwnerData = wx.getStorageSync("ownerData");
        if (storedOwnerData) {
            this.globalData.ownerData = storedOwnerData;
            return storedOwnerData;
        }

        try {
            const res = await db.database().collection("owner").where({ openid: openid }).get();
            const ownerData = res.data[0];
            if (!ownerData) return null;

            wx.setStorageSync("ownerData", ownerData);
            this.globalData.ownerData = ownerData;
            return ownerData;
        } catch (err) {
            console.error("Failed to fetch owner info:", err);
        }
    },

    async checkAndGetMerchantData(ownerId, db) {
        const storedMerchantData = wx.getStorageSync("merchantData");
        if (storedMerchantData) {
            this.globalData.merchantData = storedMerchantData;
            return storedMerchantData;
        }
        try {
            const res = await db.database().collection("merchant").where({ owner: ownerId }).get();
            const merchantData = res.data[0];
            if (!merchantData) return null;
            wx.setStorageSync("merchantData", merchantData);
            this.globalData.merchantData = merchantData;
            return merchantData;
        } catch (e) {
            console.error(e);
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
