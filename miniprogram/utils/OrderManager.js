const app = getApp();
class OrderManager {
    constructor(cloud) {
        this.cloud = cloud;
        this._ = cloud.database().command;
        this.$ = cloud.database().command.aggregate;
    }

    async getMerchantOrders(merchantId) {
        try {
            const res = await this.cloud.callFunction({
                name: "fetch",
                data: {
                    type: "order",
                    whereCondition: {
                        merchant: merchantId,
                    },
                },
            });
            return res.result.list;
        } catch (error) {
            console.error("Error fetching orders for merchant:", error);
            throw error;
        }
    }
    async getMerchantStatusOrders(merchantId, status) {
        try {
            const res = await this.cloud.callFunction({
                name: "fetch",
                data: {
                    type: "order",
                    whereCondition: {
                        merchant: merchantId,
                        status: { $eq: status },
                    },
                },
            });
            return res.result.list;
        } catch (error) {
            console.error("Error fetching orders for merchant:", error);
            throw error;
        }
    }
    async getMerchantOrderOnDay(merchantId, date) {
        try {
            const startOfDay = new Date(date.setHours(0, 0, 0, 0));
            const endOfDay = new Date(date.setHours(23, 59, 59, 999));

            const res = await this.cloud.callFunction({
                name: "fetch",
                data: {
                    type: "order",
                    startOfDay: startOfDay,
                    endOfDay: endOfDay,
                    whereCondition: {
                        merchant: merchantId,
                    },
                },
            });
            console.log("res", res);
            return res.result.list;
        } catch (error) {
            console.error("Error fetching orders for merchant:", error);
            throw error;
        }
    }

    async getUserActiveOrders(cordID) {
        try {
            const res = await this.cloud.callFunction({
                name: "fetch",
                data: {
                    type: "order",
                    whereCondition: {
                        participant: cordID,
                        status: { $ne: "complete" },
                    },
                    date: true,
                    limit: 3,
                },
            });
            return res.result.list;
        } catch (error) {
            console.error("Error fetching orders for merchant:", error);
            throw error;
        }
    }

    async filterFetchOrders(filter) {
        let whereCondition = {};
        if (filter.pending) {
            whereCondition.status = "pending";
        }
        if (filter.paid) {
            whereCondition.status = "paid";
        }
        if (filter.complete) {
            whereCondition.status = "complete";
        }
        if (filter.rejected) {
            whereCondition.status = "rejected";
        }

        let requestData = {
            type: "order",
            whereCondition: whereCondition,
        };

        if (filter.current) {
            requestData.date = true;
        }
        if (filter.history) {
            requestData.dateReverse = true;
        }

        try {
            const res = await this.cloud.callFunction({
                name: "fetch",
                data: requestData,
            });
            return res.result.list;
        } catch (error) {
            console.error("Error fetching orders:", error);
            throw error;
        }
    }

    async getOrderfromID(orderId) {
        try {
            const res = await this.cloud.callFunction({
                name: "fetch",
                data: {
                    type: "order",
                    whereCondition: {
                        _id: orderId,
                    },
                },
            });
            let order = res.result.list[0];
            return order;
        } catch (error) {
            console.error("Error fetching order:", error);
            throw error;
        }
    }
}

module.exports = OrderManager;
