// pages/signup/step1/index.js
Page({
    /**
     * 页面的初始数据
     */
    data: {
        hashtag: "",
    },
    onLoad(options) {
        this.setData({
            ...options,
        });
    },

    onHashtagChange(e) {
        this.setData({
            hashtag: e.detail,
        });
    },
    next(e) {
        if (this.data.hashtag) {
            wx.navigateTo({
                url:
                    "/pages/signup/step2/index?category=" +
                    this.data.category +
                    "&hashtag=" +
                    this.data.hashtag +
                    "&avatar=" +
                    this.data.avatar +
                    "&username=" +
                    this.data.username,
            });
        } else {
            wx.showToast({
                title: "请输入一个服务描述",
                icon: "none",
            });
        }
    },
});
