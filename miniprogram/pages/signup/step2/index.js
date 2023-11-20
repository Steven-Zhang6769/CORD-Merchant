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
        const fileList = [...this.data[listName]];
        const { file, index } = event.detail;

        if (operation === "add") {
            fileList.push({ file, url: file.url });
        } else if (operation === "delete") {
            fileList.splice(index, 1);
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

    uploadSingleFile(filename, url) {
        return this.data.db.uploadFile({
            cloudPath: filename,
            filePath: url,
        });
    },

    async uploadFiles(files) {
        if (!files.length) return [];

        const uploadTasks = files.map((file) => this.uploadSingleFile(`${this.data.openid}-pic-${Date.now()}.png`, file.url));
        return await Promise.all(uploadTasks);
    },

    async getHttpPath(fileIds) {
        const { fileList } = await this.data.db.getTempFileURL({ fileList: fileIds });
        return fileList.map((file) => file.tempFileURL);
    },

    async registerOwner() {
        const avatarPath = await this.uploadSingleFile(`${this.data.openid}_profilePic.jpg`, this.data.avatar);
        const [avatarFileId] = await this.getHttpPath([avatarPath.fileID]);
        const { username, openid } = this.data;

        const res = await this.data.db
            .database()
            .collection("owner")
            .add({
                data: {
                    profilePic: avatarFileId,
                    username,
                    openid,
                    friends: [],
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
            const fileResults = await this.uploadFiles(combinedFiles);
            const fileIds = fileResults.map((item) => item.fileID);
            const httpPaths = await this.getHttpPath(fileIds);

            const res = await this.data.db
                .database()
                .collection("merchant-application")
                .add({
                    data: {
                        title,
                        subTitle,
                        coverPic: httpPaths[0],
                        subPic: httpPaths.slice(1),
                        owner: ownerid,
                        ownerName,
                        ownerWechat,
                        locationName,
                        locationDetail,
                        availableTimes,
                        paymentInfo,
                        category,
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
