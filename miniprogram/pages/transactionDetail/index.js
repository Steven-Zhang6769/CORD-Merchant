import { getTransactionFromID } from "../../utils/transactionUtils";

Page({
    data: {
        loading: true,
        transactionID: "",
        cordID: wx.getStorageSync("CordID"),
    },

    // ========================
    // Lifecycle Methods
    // ========================

    async onLoad(options) {
        this.loadData(options.transactionid);
    },

    // ========================
    // Data Fetching
    // ========================

    async loadData(transactionId) {
        try {
            wx.showLoading({ title: "加载订单中" });
            const transaction = await getTransactionFromID(transactionId);
            this.setData({
                transactionData: transaction.transactionData,
                senderData: transaction.senderData,
                receiverData: transaction.receiverData,
                loading: false,
            });
        } catch (error) {
            wx.showToast({
                title: "加载失败",
                icon: "error",
            });
            console.error("Load data error:", error);
        } finally {
            wx.hideLoading();
        }
    },

    // ========================
    // UI Interactions
    // ========================

    enlarge(e) {
        const { url } = e.currentTarget.dataset;
        wx.previewImage({
            current: url,
            urls: [url],
        });
    },

    navigateToOrderDetail(e) {
        const { orderid } = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/orderDetail/index?orderid=${orderid}`,
        });
    },

    // ========================
    // Image Upload & Update
    // ========================

    async reUpload() {
        try {
            const uploadRes = await this.chooseImage();
            if (this.data.transactionData.screenshot) {
                await this.deleteScreenshotFromCloud(this.data.transactionData.screenshot);
            }
            const screenshotUrl = await this.uploadScreenshot(uploadRes.tempFiles[0].tempFilePath);
            await this.updateScreenshotInDatabase(screenshotUrl);
            this.onLoad({ transactionid: this.data.transactionData._id });
            wx.showToast({
                title: "更新成功",
                icon: "success",
            });
        } catch (error) {
            wx.showToast({
                title: "更新失败",
                icon: "error",
            });
            console.error("Re-upload error:", error);
        } finally {
            wx.hideLoading();
        }
    },
    async deleteScreenshotFromCloud(fileID) {
        try {
            await wx.cloud.deleteFile({
                fileList: [fileID],
            });
            console.log(`Screenshot deleted successfully: ${fileID}`);
        } catch (error) {
            console.error(`Failed to delete screenshot: ${fileID}`, error);
        }
    },

    async chooseImage() {
        return await wx.chooseMedia({
            media: ["image"],
            count: 1,
            sizeType: ["original", "compressed"],
            sourceType: ["album", "camera"],
        });
    },

    async uploadScreenshot(tempPath) {
        const screenshotID = `${Date.now()}Transaction.jpg`;
        wx.showLoading({ title: "更新中" });
        const res = await wx.cloud.uploadFile({
            cloudPath: screenshotID,
            filePath: tempPath,
        });
        return res.fileID;
    },

    async updateScreenshotInDatabase(url) {
        try {
            const res = await wx.cloud
                .database()
                .collection("transactions")
                .doc(this.data.transactionData._id)
                .update({
                    data: {
                        screenshot: url,
                    },
                });
            if (!res || res.errMsg !== "document.update:ok") {
                throw new Error(res.errMsg || "Update failed");
            }
            console.log("Screenshot updated successfully", res);
        } catch (err) {
            console.error("Failed to update screenshot in database:", err);
        }
    },
});
