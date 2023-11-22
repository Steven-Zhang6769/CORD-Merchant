class MerchantManager {
    constructor(cloud) {
        this.cloud = cloud;
        this._ = cloud.database().command;
        this.$ = cloud.database().command.aggregate;
    }

    async getMerchantData(ownerId, app, refresh = false) {
        let merchantData = refresh ? null : wx.getStorageSync("merchantData");

        if (!merchantData) {
            merchantData = await this.fetchMerchantData({ owner: ownerId });
        }

        if (merchantData) {
            app.globalData.merchantData = merchantData;
            wx.setStorageSync("merchantData", merchantData);
        }

        return merchantData;
    }

    async getAllMerchantData() {
        return await this.fetchMerchantData();
    }

    async getMerchantDataWithID(id) {
        return await this.fetchMerchantData({ _id: id });
    }

    async fetchMerchantData(whereCondition = {}) {
        try {
            const res = await this.cloud.callFunction({
                name: "fetch",
                data: {
                    type: "merchant",
                    whereCondition: whereCondition,
                },
            });
            return res.result.list[0];
        } catch (error) {
            console.error("Error fetching merchant data:", error);
            return null;
        }
    }

    async getPreviousAppointmentTime(merchantID) {
        try {
            const res = await this.cloud.callFunction({
                name: "fetch",
                data: {
                    type: "prevAppointments",
                    merchantID: merchantID,
                },
            });
            console.log("prev appointments", res.result.list);
            return res.result.list;
        } catch (err) {
            console.error("Error fetching previous appointments:", err);
            wx.showToast({
                title: "获取档期失败",
                icon: "error",
            });
        }
    }
}

module.exports = MerchantManager;
