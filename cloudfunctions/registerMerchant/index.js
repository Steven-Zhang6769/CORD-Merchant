// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init({ env: "cord-4gtkoygbac76dbeb" });

// Create a Cloud instance outside the main function
const c1 = new cloud.Cloud({
    // 资源方 AppID
    resourceAppid: "wxd699b77b51adf6cb",
    // 资源方环境 ID
    resourceEnv: "cord-4gtkoygbac76dbeb",
});

// 云函数入口函数
exports.main = async (event, context) => {
    console.log(event);

    // Initialize the Cloud instance
    await c1.init();

    // Extract necessary fields from the event object
    const {
        storeName,
        detailDescription,
        coverpic,
        subpic,
        ownerid,
        ownerWechat,
        locationName,
        availableTimes,
        paymentMethod,
        category,
        locationDetail
    } = event;

    // Get the database reference
    const db = c1.database();

    // Add data to the database
    try {
        const res = await db.collection("merchant-application").add({
            data: {
                title: storeName,
                subTitle: detailDescription,
                coverPic: coverpic,
                subPic: subpic,
                owner: ownerid,
                ownerWechat: ownerWechat,
                locationName: locationName,
                availableTimes: availableTimes,
                paymentInfo: paymentMethod,
                category: category,
                locationDetail: locationDetail,
                approved: false
            },
        });
        return res;
    } catch (err) {
        throw err;
    }
};
