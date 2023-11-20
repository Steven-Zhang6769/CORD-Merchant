import { fetchDataFromDB } from "./dbUtils";
class OwnerManager {
    constructor(cloud) {
        this.cloud = cloud;
        this._ = cloud.database().command;
        this.$ = cloud.database().command.aggregate;
    }

    async refreshOwnerData(id, app) {
        let ownerData = await fetchDataFromDB("owners", { openid: id }, null, this.cloud);
        ownerData = ownerData[0];
        if (!ownerData) return null;

        wx.setStorageSync("ownerData", ownerData);
        app.globalData.ownerData = ownerData;
        return ownerData;
    }
}

module.exports = OwnerManager;
