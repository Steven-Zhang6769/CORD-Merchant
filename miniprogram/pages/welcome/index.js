// pages/welcome/index.js
Page({
	/**
	 * 页面的初始数据
	 */
	data: {},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {},

	signupNavigator(e) {
		wx.navigateTo({
			url: "/pages/signup/index",
		});
	},
});
