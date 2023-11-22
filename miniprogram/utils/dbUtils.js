const app = getApp();

async function fetchDataFromDB(collection, whereCondition = null, docId = null, cloud) {
    try {
        let query = cloud.database().collection(collection);
        if (docId) {
            const res = await query.doc(docId).get();
            return res.data;
        } else {
            if (whereCondition) query = query.where(whereCondition);
            const res = await query.get();
            return res.data;
        }
    } catch (error) {
        console.error(`Error fetching data from ${collection}:`, error);
        throw error;
    }
}

async function getHttpPath(fileIds, cloud) {
    const { fileList } = await cloud.getTempFileURL({ fileList: fileIds });
    return fileList.map((file) => file.tempFileURL);
}

module.exports = {
    fetchDataFromDB,
    getHttpPath,
};
