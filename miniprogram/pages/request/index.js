// pages/index/index.js
import { formatNumber, formatTimeWithHours } from "../../util";

const app = getApp();
Page({
    data: {
        merchantData: wx.getStorageSync("merchantData"),
        ownerData: wx.getStorageSync("ownerData"),
        db: app.globalData.db,
        loading: true,
        active: 1,
        pagePath: ["/pages/index/index", "/pages/request/index", "/pages/calendar/index", "/pages/messages/index", "/pages/profile/index"],
        status: ["pending", "paid", "rejected", "complete"],
    },

    onLoad(options) {},

    async loadOrders(status) {
        try {
            const orders = await this.getOrders(this.data.merchantData._id, status);
            const processedOrders = await this.processOrders(orders);
            this.setData({
                orders: processedOrders,
                loading: false,
            });
        } catch (error) {
            console.error("Error loading orders:", error);
        }
    },

    async getOrders(merchantId, status) {
        const _ = this.data.db.database().command;
        const res = await this.fetchDataFromDB("orders", {
            merchant: merchantId,
            status: status,
        });
        return res;
    },

    async processOrders(orders) {
        const allOrderDataPromises = orders.map(async (v) => {
            const [serviceData, participantData, transactionData] = await Promise.all([
                this.fetchDataFromDB("service", null, v.service),
                this.fetchDataFromDB("user", null, v.participant),
                this.getTransactionData(v.transaction),
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
    onCategoryChange(e) {
        this.setData({ loading: true, orders: [] });
        this.loadOrders(this.data.status[e.detail.index]);
    },
});
