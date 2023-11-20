const app = getApp();
Page({
    data: {
        content: "",
    },
    onLoad: function (options) {},
    contentChange(e) {
        this.setData({
            content: e.detail.value,
        });
    },
    //提交用户信息
    submit(e) {
        wx.showLoading({
            title: "提交中",
        });
        if (this.data.content == "") {
            wx.hideLoading({});
            wx.showToast({
                title: "内容不能为空",
                icon: "error",
            });
        } else {
            app.cloud
                .callFunction({
                    name: "uploadBugReport",
                    data: {
                        content: this.data.content,
                        type: "bugReport",
                    },
                })
                .then((res) => {
                    wx.hideLoading({});
                    wx.showToast({
                        title: "感谢您的反馈",
                        icon: "success",
                        duration: 1500,
                    }).then((res) => {
                        setTimeout(function () {
                            wx.navigateBack({
                                delta: 1,
                            });
                        }, 1000);
                    });
                    console.log("successfully uploaded bug report", res);
                })
                .catch((err) => {
                    wx.hideLoading({});
                    wx.showToast({
                        title: "提交失败",
                        icon: "error",
                    });
                    console.log("error creating a bug report", err);
                });
        }
    },
});
