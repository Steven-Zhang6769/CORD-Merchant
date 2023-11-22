const app = getApp();
const cloud = app.globalData.cloud;
Page({
    data: {
        addedFiles: [],
        deletedFiles: [],
    },

    async onLoad(options) {
        const serviceData = await app.globalData.serviceManager.getServiceData(options.id);
        let fileList = [{ url: serviceData.picture, filePath: serviceData.pictureID }];
        this.setData({
            fileList,
            serviceData,
        });
    },
    onChange(e) {
        const {
            detail,
            currentTarget: {
                dataset: { field },
            },
        } = e;
        const serviceDataKey = `serviceData.${field}`;
        this.setData({ [serviceDataKey]: detail });
    },

    addPic(event) {
        const { file } = event.detail;
        this.setData({ fileList: [file], addedFiles: [file] });
    },
    deletePic(event) {
        const { file, index } = event.detail;
        let fileList = this.data.fileList;
        fileList.splice(index, 1);
        let serviceData = this.data.serviceData;
        serviceData.picture = "";
        serviceData.pictureID = "";

        let deletedFiles = this.data.deletedFiles;
        deletedFiles.push(file);

        this.setData({ fileList, serviceData, deletedFiles });
    },

    validateRequiredInfo(requiredInfo) {
        return requiredInfo.some((info) => !info);
    },
    uploadSingleFile(filename, url) {
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

    async getHttpPath(fileIds) {
        const { fileList } = await cloud.getTempFileURL({ fileList: fileIds });
        return fileList.map((file) => file.tempFileURL);
    },

    async uploadAndGetHttpPaths(files) {
        const uploadResults = await this.uploadFiles(files);
        const fileIds = uploadResults.map((item) => item.fileID);
        return [fileIds, await this.getHttpPath(fileIds)];
    },
    async removeFiles(files) {
        if (!files.length) return [];

        return cloud.deleteFile({
            fileList: files,
        });
    },
    async updatePictures(addedPic) {
        let serviceData = this.data.serviceData;
        if (addedPic && addedPic.length) {
            const [ids, https] = await this.uploadAndGetHttpPaths(addedPic);
            console.log(ids, https);
            serviceData.picture = https[0];
            serviceData.pictureID = ids[0];
        }
        this.setData({
            serviceData,
        });
    },

    async submitForm() {
        wx.showLoading({ title: "提交中" });

        const { serviceName, serviceSubtitle, serviceDescription, USDPrice } = this.data.serviceData;
        const { addedFiles, deletedFiles } = this.data;

        let requiredInfo = [serviceName, serviceSubtitle, serviceDescription, USDPrice];

        if (this.validateRequiredInfo(requiredInfo)) {
            return this.showErrorMessage("请填完所有必填信息(*号)");
        }

        try {
            if (deletedFiles.length) {
                this.removeFiles(deletedFiles.map((file) => file.filePath));
            }
            await this.updatePictures(addedFiles);
            console.log("serviceData", this.data.serviceData);

            const res = await cloud.callFunction({
                name: "update",
                data: {
                    type: "service",
                    data: this.data.serviceData,
                },
            });
            wx.hideLoading();
            wx.showToast({ title: "更新成功", icon: "success" });
            await app.globalData.merchantManager.getMerchantData(app.globalData.ownerData._id, app, true);
            wx.navigateBack({ delta: 1 });
        } catch (error) {
            this.showErrorMessage("更新失败");
            console.error(error);
        }
    },

    showErrorMessage(message) {
        wx.hideLoading();
        wx.showToast({ title: message, icon: "error" });
    },

    submit() {
        wx.showModal({
            title: "确认更新",
            content: "确定更新服务信息么？",
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
