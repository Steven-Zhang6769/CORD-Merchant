class ServiceManager {
    constructor(cloud) {
        this.cloud = cloud;
        this._ = cloud.database().command;
        this.$ = cloud.database().command.aggregate;
    }
    async getServiceData(serviceId) {
        try {
            const res = await this.cloud.database().collection("services").doc(serviceId).get();
            return res.data;
        } catch (error) {
            console.error("Error fetching services:", error);
            throw error;
        }
    }

    async addService(service) {
        try {
            const res = await this.cloud.database().collection("services").add({
                data: service,
            });
        } catch (error) {
            console.error("Error adding service:", error);
            throw error;
        }
    }
    async deleteService(serviceId) {
        try {
            const res = await this.cloud.database().collection("services").doc(serviceId).remove();
            return res;
        } catch (error) {
            console.error("Error deleting service:", error);
            throw error;
        }
    }
}

module.exports = ServiceManager;
