import { fetchDataFromDB } from "./dbUtils";
class OwnerManager {
    constructor(cloud) {
        this.cloud = cloud;
        this._ = cloud.database().command;
        this.$ = cloud.database().command.aggregate;
    }

    async getOwnerData(id, app, refresh = false) {
        let ownerData = refresh ? null : wx.getStorageSync("ownerData");

        if (!ownerData) {
            try {
                const fetchedData = await fetchDataFromDB("owners", { openid: id }, null, this.cloud);
                ownerData = fetchedData[0];
            } catch (error) {
                console.error("Error fetching owner data:", error);
                return null;
            }
        }

        if (ownerData) {
            wx.setStorageSync("ownerData", ownerData);
            app.globalData.ownerData = ownerData;
        }

        return ownerData;
    }
}

module.exports = OwnerManager;
