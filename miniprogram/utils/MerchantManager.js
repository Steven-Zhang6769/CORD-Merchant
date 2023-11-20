const app = getApp();
class MerchantManager {
    constructor(cloud) {
        this.cloud = cloud;
        this._ = cloud.database().command;
        this.$ = cloud.database().command.aggregate;
    }

    async refreshMerchantData(ownerId, app) {
        const merchantData = await this.fetchMerchantData({ owner: ownerId });
        if (!merchantData) return null;

        wx.setStorageSync("merchantData", merchantData);
        app.globalData.merchantData = merchantData;
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

    async getCurrentAppointments(merchantID) {
        try {
            const futureAppointments = await this.cloud
                .collection("orders")
                .where({
                    merchant: merchantID,
                    date: this.cloud.command.gt(new Date()),
                })
                .get();

            const appointments = futureAppointments.data;

            const appointmentTimes = appointments.flatMap((appointment) => {
                const startDate = new Date(appointment.date);
                const endDate = new Date(startDate);
                endDate.setMinutes(startDate.getMinutes() + 30);
                return [startDate, endDate];
            });

            return appointmentTimes;
        } catch (error) {
            console.error("Error fetching current appointments:", error);
            throw error;
        }
    }
}

module.exports = MerchantManager;
