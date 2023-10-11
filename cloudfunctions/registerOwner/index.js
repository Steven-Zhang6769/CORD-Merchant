// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init({ env: "cord-4gtkoygbac76dbeb" });

// 云函数入口函数
exports.main = async (event, context) => {
    console.log(event);
    var c1 = new cloud.Cloud({
        // 资源方 AppID
        resourceAppid: "wxd699b77b51adf6cb",
        // 资源方环境 ID
        resourceEnv: "cord-4gtkoygbac76dbeb",
    });
    await c1.init();

    return new Promise(async (resolve, reject) => {
        const { avatarFileID, username, openid } = event;
        const db = c1.database();
        await db
            .collection("owner")
            .add({
                data: {
                    profilePic: avatarFileID,
                    username: username,
                    openid: openid,
                },
            })
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(err);
            });
    });
};
