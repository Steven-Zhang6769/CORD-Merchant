const app = getApp();

Page({
    data: {
        coverFilelist: [],
        detailFilelist: [],
        openid: wx.getStorageSync("openid"),
        db: app.globalData.db,
    },

    onLoad(options) {
        this.setData({ ...options });
    },

    onChange(e) {
        const {
            detail,
            currentTarget: {
                dataset: { field },
            },
        } = e;
        this.setData({ [field]: detail });
    },

    handleFileList(event, operation, listName) {
        const fileList = this.data[listName];
        const { file } = event.detail;

        if (operation === "add") {
            fileList.push({ file, url: file.url });
        } else if (operation === "delete") {
            fileList.splice(event.detail.index, 1);
        }

        this.setData({ [listName]: fileList });
    },

    addCover(event) {
        this.handleFileList(event, "add", "coverFilelist");
    },

    deleteCover(event) {
        this.handleFileList(event, "delete", "coverFilelist");
    },

    addDetail(event) {
        this.handleFileList(event, "add", "detailFilelist");
    },

    deleteDetail(event) {
        this.handleFileList(event, "delete", "detailFilelist");
    },

    async uploadFiles(files) {
        if (!files.length) return [];

        const uploadTasks = files.map((file) => this.uploadSingleFile(`${this.data.openid}-pic-${Date.now()}.png`, file.url));
        const results = await Promise.all(uploadTasks);

        return results.map((item) => item.fileID);
    },

    uploadSingleFile(filename, url) {
        return wx.cloud.uploadFile({
            cloudPath: filename,
            filePath: url,
        });
    },

    async registerOwner() {
        const avatarPath = await this.uploadSingleFile(`${this.data.openid}_profilePic.jpg`, this.data.avatar);
        const httpPath = await wx.cloud.getTempFileURL({
            fileList: [avatarPath.fileID],
        });
        const avatarFileId = httpPath.fileList[0].tempFileURL;
        const { username, openid } = this.data;
        const res = await this.data.db
            .database()
            .collection("owner")
            .add({
                data: {
                    profilePic: avatarFileId,
                    username: username,
                    openid: openid,
                },
            });
        if (res.errMsg !== "collection.add:ok") throw new Error("owner registration failed");
        return res;
    },

    async submitForm() {
        wx.showLoading({ title: "提交中" });
        const {
            category,
            title,
            subTitle,
            ownerName,
            ownerWechat,
            paymentInfo,
            locationName,
            locationDetail,
            availableTimes,
            coverFilelist,
            detailFilelist,
        } = this.data;

        const requiredInfo = [title, subTitle, ownerName, ownerWechat, paymentInfo, locationDetail];
        if (requiredInfo.some((info) => !info)) {
            return this.showErrorMessage("请填完所有必填信息(*号)");
        }

        try {
            const registerOwnerRes = await this.registerOwner();
            const ownerid = registerOwnerRes._id;
            const combinedFiles = [...coverFilelist, ...detailFilelist];
            const fileIds = await this.uploadFiles(combinedFiles);
            const picRes = await wx.cloud.getTempFileURL({ fileList: fileIds });
            console.log(picRes);

            const res = await this.data.db
                .database()
                .collection("merchant-application")
                .add({
                    data: {
                        title: title,
                        subTitle: subTitle,
                        coverPic: picRes.fileList[0].tempFileURL,
                        subPic: picRes.fileList.slice(1).map((v) => v.tempFileURL),
                        owner: ownerid,
                        ownerName: ownerName,
                        ownerWechat: ownerWechat,
                        locationName: locationName,
                        locationDetail: locationDetail,
                        availableTimes: availableTimes,
                        paymentInfo: paymentInfo,
                        category: category,
                        approved: false,
                    },
                });

            if (res.errMsg !== "collection.add:ok") throw new Error("registration failed");

            wx.hideLoading();
            wx.showToast({ title: "申请成功", icon: "success" });
            setTimeout(() => wx.navigateTo({ url: "/pages/pendingReview/index" }), 1500);
        } catch (error) {
            this.showErrorMessage("申请失败");
            console.error(error);
        }
    },

    showErrorMessage(message) {
        wx.hideLoading();
        wx.showToast({ title: message, icon: "error" });
    },

    submit() {
        wx.showModal({
            title: "申请确认",
            content: "确定提交申请么？",
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
