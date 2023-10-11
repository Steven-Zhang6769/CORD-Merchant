// pages/signup/index.js
Page({
    /**
     * 页面的初始数据
     */
    data: {
        category: null,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.setData({
            ...options,
        });
    },

    selectCategory(e) {
        this.setData({
            category: e.currentTarget.dataset.category,
        });
    },
    next(e) {
        if (this.data.category) {
            wx.navigateTo({
                url: "/pages/signup/step1/index?category=" + this.data.category + "&avatar=" + this.data.avatar + "&username=" + this.data.username,
            });
        } else {
            wx.showToast({
                title: "请选择一个分类",
                icon: "none",
            });
        }
    },
});
