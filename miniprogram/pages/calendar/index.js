// pages/index/index.js
import { formatNumber, formatTimeWithHours } from "../../util";

const app = getApp();
Page({
    data: {
        merchantData: app.globalData.merchantData,
        ownerData: wx.getStorageSync("ownerData"),
        db: app.globalData.db,
        loading: true,
        active: 2,
        pagePath: ["/pages/index/index", "/pages/request/index", "/pages/calendar/index", "/pages/messages/index", "/pages/profile/index"],
    },

    onLoad(options) {
        this.loadOrders();
    },

    async loadOrders() {
        try {
            const orders = await this.getOrders(this.data.merchantData._id, this.data.db);
            let pendingOrders = [];
            let paidOrders = [];
            let totalRating = 0;
            let recentRating = 0;
            let ratingCount = 0;
            orders.forEach((v) => {
                if (v.rating) {
                    if (ratingCount < 5) recentRating += v.rating;
                    totalRating += v.rating;
                    ratingCount++;
                }
                if (v.status === "pending") {
                    pendingOrders.push(v);
                }
                if (v.status == "paid") {
                    paidOrders.push(v);
                }
            });
            const processedOrders = await this.processOrders(pendingOrders);
            this.setData({
                pendingOrders: processedOrders,
                allOrders: orders,
                ratingCount: ratingCount,
                recentAvgRating: (recentRating / (ratingCount > 5 ? 5 : 3)).toFixed(1),
                avgRating: (totalRating / ratingCount).toFixed(1),
                loading: false,
            });
        } catch (error) {
            console.error("Error loading orders:", error);
        }
    },

    async getOrders(merchantId) {
        const _ = this.data.db.database().command;
        const res = await this.fetchDataFromDB("orders", {
            merchant: merchantId,
        });
        return res;
    },

    async processOrders(orders) {
        const allOrderDataPromises = orders.map(async (v) => {
            const [serviceData, participantData, transactionData] = await Promise.all([
                this.fetchDataFromDB("service", null, v.service),
                this.fetchDataFromDB("user", null, v.participant),
                this.fetchDataFromDB("transaction", null, v.transaction),
            ]);
            return {
                ...v,
                serviceData,
                participantData,
                transactionData,
                createTime: formatTimeWithHours(new Date(v.createTime)),
                reservationDate: formatTimeWithHours(new Date(v.date)),
            };
        });

        const allOrderData = await Promise.all(allOrderDataPromises);
        return allOrderData.sort((a, b) => new Date(a.reservationDate).getTime() - new Date(b.reservationDate).getTime());
    },

    fetchDataFromDB(collection, whereCondition = null, docId = null) {
        return new Promise((resolve, reject) => {
            let query = this.data.db.database().collection(collection);
            if (docId) {
                query
                    .doc(docId)
                    .get()
                    .then((res) => resolve(res.data))
                    .catch(reject);
            } else {
                if (whereCondition) query = query.where(whereCondition);
                query
                    .get()
                    .then((res) => resolve(res.data))
                    .catch(reject);
            }
        });
    },

    async getTransactionData(transactionID) {
        const transaction = await this.fetchDataFromDB("transaction", null, transactionID);
        transaction.createTime = formatTimeWithHours(new Date(transaction.createTime));
        return transaction;
    },
    onTabChange(event) {
        if (event.detail != this.data.active) {
            wx.switchTab({
                url: this.data.pagePath[event.detail],
            });
        }
    },
});
