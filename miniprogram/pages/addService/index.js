const app = getApp();
const cloud = app.globalData.cloud;
Page({
    data: {
        merchantData: app.globalData.merchantData,
        ownerData: app.globalData.ownerData,
        picture: [],
    },

    async onLoad(options) {},
    onChange(e) {
        const {
            detail,
            currentTarget: {
                dataset: { field },
            },
        } = e;
        this.setData({ [field]: detail });
    },

    uploadSingleFile(filename, url) {
        console.log(cloud);
        return cloud.uploadFile({
            cloudPath: filename,
            filePath: url,
            name: `${Math.floor(Math.random() * 10000)}`,
        });
    },
    async uploadFiles(files) {
        if (!files.length) return [];

        const uploadTasks = files.map((file) => {
            const extension = file.url.split(".").pop();
            return this.uploadSingleFile(`${Math.floor(Math.random() * 100000)}.${extension}`, file.url);
        });
        return await Promise.all(uploadTasks);
    },

    addPic(event) {
        const { file } = event.detail;
        this.setData({ picture: [file] });
    },
    deletePic(event) {
        this.setData({ picture: [] });
    },

    async getHttpPath(fileIds) {
        const { fileList } = await cloud.getTempFileURL({ fileList: fileIds });
        return fileList.map((file) => file.tempFileURL);
    },

    validateRequiredInfo(requiredInfo) {
        return requiredInfo.some((info) => !info);
    },

    async uploadAndGetHttpPaths(files) {
        const uploadResults = await this.uploadFiles(files);
        const fileIds = uploadResults.map((item) => item.fileID);
        return [fileIds, await this.getHttpPath(fileIds)];
    },

    async submitForm() {
        wx.showLoading({ title: "提交中" });

        const { serviceName, serviceSubtitle, serviceDescription, USDPrice, picture } = this.data;
        let requiredInfo = [serviceName, serviceSubtitle, serviceDescription, USDPrice, picture];

        if (this.validateRequiredInfo(requiredInfo)) {
            return this.showErrorMessage("请填完所有必填信息(*号)");
        }

        try {
            const [ids, https] = await this.uploadAndGetHttpPaths(this.data.picture);

            const res = await cloud
                .database()
                .collection("services")
                .add({
                    data: {
                        serviceName: serviceName,
                        serviceSubtitle: serviceSubtitle,
                        serviceDescription: serviceDescription,
                        USDPrice: USDPrice,
                        picture: https[0],
                        pictureID: ids[0],
                        merchant: this.data.merchantData._id,
                    },
                });

            if (res.errMsg !== "collection.add:ok") throw new Error("service registration failed");
            wx.hideLoading();
            wx.showToast({ title: "创建成功", icon: "success" });
            await app.globalData.merchantManager.getMerchantData(this.data.ownerData._id, app, true);
            wx.navigateBack({ delta: 1 });
        } catch (error) {
            this.showErrorMessage("创建失败");
            console.error(error);
        }
    },

    showErrorMessage(message) {
        wx.hideLoading();
        wx.showToast({ title: message, icon: "error" });
    },

    submit() {
        wx.showModal({
            title: "创建确认",
            content: "确定创建这个服务么？",
            success: (res) => {
                if (res.confirm) {
                    this.submitForm();
                } else {
                    console.log("用户点击取消");
                    wx.showToast({ title: "已取消", icon: "none" });
                }
            },
        });
    },
});
