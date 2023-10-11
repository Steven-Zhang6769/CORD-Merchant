const defaultAvatarUrl = "../../images/signup/defaultAvatar.png";
const picAddIconUrl =
    "https://6d65-merchants-6gv5wehc454a9c3a-1306413881.tcb.qcloud.la/assets/add.png?sign=579a01c99dc2a140d93e5ae7db195543&t=1697005645";
Page({
    data: {
        avatar: defaultAvatarUrl,
        username: "",
        openid: wx.getStorageSync("openid"),
        changed: false,
    },
    onLoad: function (options) {},
    nameChanged(e) {
        this.setData({ username: e.detail.value });
    },
    onChooseNickname(e) {
        console.log(e);
    },
    onChooseAvatar(e) {
        this.setData({
            changed: true,
            avatar: e.detail.avatarUrl,
        });
    },
    next(e) {
        const { avatar, username } = this.data;
        if (avatar && avatar != defaultAvatarUrl && username) {
            wx.navigateTo({
                url: "/pages/signup/step0/index?avatar=" + avatar + "&username=" + username,
            });
        } else {
            wx.showToast({
                title: "请输入用户名并选择头像",
                icon: "none",
            });
        }
    },
});
