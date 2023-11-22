const app = getApp();
const cloud = app.globalData.cloud;
Page({
    data: {
        merchantData: app.globalData.merchantData,
        ownerData: app.globalData.ownerData,
        addedCover: [],
        addedSubPic: [],
        deletedFiles: [],
    },

    async onLoad(options) {
        const merchantData = await app.globalData.merchantManager.getMerchantData(this.data.ownerData._id, app, true);
        let coverFilelist = [{ url: merchantData.coverPic, filePath: merchantData.coverPicID }];
        let subPicFileList = merchantData.subPic.map((image) => ({ url: image }));
        for (let i = 0; i < subPicFileList.length; i++) {
            subPicFileList[i].filePath = merchantData.subPicIDs[i];
        }
        this.setData({
            coverFilelist,
            subPicFileList,
            merchantData,
        });
    },
    onChange(e) {
        const {
            detail,
            currentTarget: {
                dataset: { field },
            },
        } = e;

        const merchantDataKey = `merchantData.${field}`;
        this.setData({
            [merchantDataKey]: detail,
        });
    },

    onClickCategory(e) {
        const {
            currentTarget: {
                dataset: { name },
            },
        } = e;

        this.setData({
            "merchantData.category": name,
        });
    },

    addCover(event) {
        this.handleFileList(event, "add", "coverFilelist", "addedCover");
    },

    deleteCover(event) {
        this.handleFileList(event, "delete", "coverFilelist");
    },

    addDetail(event) {
        this.handleFileList(event, "add", "subPicFileList", "addedSubPic");
    },

    deleteDetail(event) {
        this.handleFileList(event, "delete", "subPicFileList");
    },
    handleFileList(event, operation, localListName, cloudListName) {
        let localFileList = [...this.data[localListName]];
        let cloudFileList = [];
        if (cloudListName) {
            cloudFileList = [...this.data[cloudListName]];
        }
        let merchantData = this.data.merchantData;
        let deletedFiles = this.data.deletedFiles;

        const { file, index } = event.detail;

        if (operation === "add") {
            localFileList.push({ file, url: file.url });
            cloudFileList.push(file);
        } else if (operation === "delete") {
            localFileList.splice(index, 1);
            deletedFiles.push(file);
            if (localFileList == "coverFilelist") {
                merchantData.coverPic = "";
                merchantData.coverPicID = "";
            } else {
                merchantData.subPic.splice(index, 1);
                merchantData.subPicIDs.splice(index, 1);
            }
        }

        this.setData({ [localListName]: localFileList, [cloudListName]: cloudFileList, deletedFiles, merchantData });
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

    async removeFiles(files) {
        if (!files.length) return [];

        return cloud.deleteFile({
            fileList: files,
        });
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
    async updatePictures(addedCover, addedSubPic) {
        let merchantData = this.data.merchantData;
        if (addedCover && addedCover.length) {
            const [ids, https] = await this.uploadAndGetHttpPaths(addedCover);
            merchantData.coverPic = https[0];
            merchantData.coverPicID = ids[0];
        }
        if (addedSubPic && addedSubPic.length) {
            const [ids, https] = await this.uploadAndGetHttpPaths(addedSubPic);
            merchantData.subPic.push(...https);
            merchantData.subPicIDs.push(...ids);
        }
        this.setData({
            merchantData,
        });
    },

    async submitForm() {
        wx.showLoading({ title: "提交中" });

        let { title, subTitle, ownerName, paymentInfo, locationDetail, availableTimes } = this.data.merchantData;
        let { addedCover, addedSubPic, deletedFiles } = this.data;

        let requiredInfo = [title, subTitle, ownerName, paymentInfo, availableTimes, locationDetail];

        if (this.validateRequiredInfo(requiredInfo)) {
            return this.showErrorMessage("请填完所有必填信息(*号)");
        }

        try {
            this.removeFiles(deletedFiles.map((file) => file.filePath));
            await this.updatePictures(addedCover, addedSubPic);

            const res = await cloud.callFunction({
                name: "update",
                data: {
                    type: "merchant",
                    data: this.data.merchantData,
                },
            });

            wx.hideLoading();
            wx.showToast({ title: "更新成功", icon: "success" });
            await app.globalData.merchantManager.getMerchantData(this.data.ownerData._id, app, true);
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
            title: "更新确认",
            content: "确定更新这些信息么？",
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
