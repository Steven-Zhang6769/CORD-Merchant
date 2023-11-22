const app = getApp();

const TEMPLATE_ID = "b0cVrk0vEvthUKTmqt7xV-31wgxUcC-beFDI5N4kkXc";

Page({
    data: {
        loading: true,
        showMerchantDetail: false,
        showServiceDetail: false,
    },

    onLoad(options) {
        this.refreshData();
    },
    onPullDownRefresh(options) {
        this.refreshData();
    },

    // ========================
    // Data Fetching
    // ========================
    async refreshData() {
        wx.showLoading({ title: "加载商家中" });
        try {
            const merchantData = await app.globalData.merchantManager.getMerchantData(app.globalData.ownerData._id, app, true);
            this.setData({
                merchantData,
                serviceData: merchantData.serviceData,
                avgRating: merchantData.avgRating ? merchantData.avgRating.toFixed(1) : "0.0",
                loading: false,
            });
        } catch (error) {
            console.error("Error loading merchant data:", error);
        }
        wx.hideLoading();
    },

    // ========================
    // UI Actions
    // ========================
    openLocation() {
        const { longitude, latitude, locationName, locationDetail } = this.data.merchantData;
        if (!longitude || !latitude) {
            return wx.showToast({
                title: "商家未提供具体地址",
                icon: "none",
            });
        }
        wx.openLocation({
            latitude,
            longitude,
            name: locationName,
            address: locationDetail,
        });
    },

    enlarge(e) {
        const url = e.currentTarget.dataset.url;
        wx.previewImage({
            current: url,
            urls: this.data.merchantData.subPic,
        });
    },

    showMerchantDetail() {
        this.setData({ showMerchantDetail: true });
    },
    closeMerchantDetail() {
        this.setData({ showMerchantDetail: false });
    },
    showServiceDetail(e) {
        this.setData({
            showServiceDetail: true,
            selectedServiceData: e.currentTarget.dataset.data,
        });
    },
    closeServiceDetail() {
        this.setData({ showServiceDetail: false });
    },
    showCartDetail() {
        this.setData({ showCartDetail: true });
    },
    closeCartDetail() {
        this.setData({ showCartDetail: false });
    },

    cancelOrder() {
        const serviceData = this.data.serviceData.map((v) => ({ ...v, num: v.num ? 0 : v.num }));
        this.setData({
            showCart: false,
            serviceData,
            total: 0,
            totalOrder: 0,
        });
    },

    // ========================
    // Cart Operations
    // ========================
    addServiceToCart(e) {
        if (!this.data.showCart) {
            this.setData({ showCart: true });
        }
        const updatedData = this.updateCartData(e.currentTarget.dataset.id);
        this.setData(updatedData);
    },

    onStepperChange(e) {
        const updatedData = this.updateCartData(e.currentTarget.dataset.id, e.detail);
        this.setData(updatedData);
    },

    updateCartData(id, quantity = 1) {
        const serviceData = [...this.data.serviceData];
        const index = serviceData.findIndex((v) => v._id == id);
        serviceData[index].num = quantity;

        const total = serviceData.reduce((acc, v) => acc + (v.num ? v.USDPrice * v.num : 0), 0);
        const totalOrder = serviceData.reduce((acc, v) => acc + (v.num || 0), 0);

        return { serviceData, total, totalOrder };
    },
    submitOrder(e) {
        if (!this.data.loginStatus) {
            wx.showToast({
                title: "请先去主页注册/登陆",
                icon: "none",
            });
            return;
        }
        if (this.data.total == 0) {
            wx.showToast({
                title: "还未选择任何菜品",
                icon: "none",
            });
            return;
        }
        let order = this.data.serviceData.filter((v) => v.num && v.num > 0);
        app.globalData.currentMerchant = this.data.merchantData;
        app.globalData.currentOrder = order;
        wx.navigateTo({
            url: "/pages/paymentConfirmation/index?total=" + this.data.total + "&merchantid=" + this.data.merchantData._id,
        });
    },

    // ========================
    // Navigation Helpers
    // ========================
    navigateBack() {
        wx.navigateBack({ delta: 1 });
    },
});
