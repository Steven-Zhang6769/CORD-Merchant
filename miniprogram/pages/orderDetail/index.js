const app = getApp();
const cloud = app.globalData.cloud;
import { formatMonthDay, createFullDateTime, formatFullDateTime } from "../../utils/util";
Page({
    data: {
        cloud: app.globalData.cloud,
        showStatusSelector: false,
        statusLoading: false,
        dateStatusLoading: false,
        timeSelectorShow: false,
        statusActions: [
            {
                name: "已拒绝",
                subname: "关闭订单",
            },
            {
                name: "待审核",
                subname: "订单未确定",
            },
            {
                name: "已确定",
                subname: "订单已付款确定",
            },
            {
                name: "已完成",
                subname: "订单已执行完毕",
            },
        ],
        statusMap: {
            pending: "待审核",
            paid: "已确定",
            rejected: "已拒绝",
            complete: "已完成",
        },
        selectedDateObject: "",
        calendarShow: false,
        timeShow: false,
        minHour: 10,
        maxHour: 20,
        minDate: new Date().getTime(),
        maxDate: new Date(new Date().getFullYear() + 1, new Date().getMonth(), new Date().getDate()).getTime(),
        selectedDate: "",
        selectedTime: "",
        selectedDateTime: "",
        shownTime: "",
        ifTime: false,
        timePickerFilter(type, options) {
            if (type === "minute") {
                return options.filter((option) => option % 30 === 0);
            }

            return options;
        },
    },

    onLoad: async function (options) {
        this.setData({
            orderID: options.orderid,
        });
        await this.getOrderData(options.orderid);
    },

    // ========================
    // Data Fetching Code
    // ========================

    async getOrderData(orderID) {
        try {
            const orderData = await app.globalData.orderManager.getOrderfromID(orderID);
            const { transactionData, merchantData, participantData } = orderData;
            const currentAppointments = await app.globalData.merchantManager.getPreviousAppointmentTime(merchantData._id);
            this.setData({
                transactionData,
                merchantData,
                participantData,
                orderData,
                currentAppointments,
            });
        } catch (error) {
            console.error("Error fetching order data:", error);
        }
    },
    refreshOrderData() {
        this.getOrderData(this.data.orderID);
        this.setData({ statusLoading: false });
    },
    // ========================
    // Calendar Code
    // ========================
    onOpenCalendar() {
        this.setData({ calendarShow: true });
    },
    onCloseCalendar() {
        this.setData({ calendarShow: false });
    },
    onConfirmDate(e) {
        const selectedDateObject = new Date(e.detail);
        const { startTime, endTime } = this.getAvailableTimesForSelectedDay(selectedDateObject);
        console.log(startTime, endTime);
        if (startTime == 0 || endTime == 0) {
            wx.showToast({
                title: "当日无档期，请重选日期",
                icon: "none",
            });
            return;
        }
        this.setData({
            calendarShow: false,
            selectedDate: formatMonthDay(e.detail),
            selectedYear: selectedDateObject.getFullYear(),
            selectedTime: "",
            shownTime: "",
            minHour: startTime,
            maxHour: endTime,
        });
    },

    getAvailableTimesForSelectedDay(selectedDateObject) {
        const merchantAvailableTimes = this.data.merchantData.availableTimesJson;
        const selectedWeekday = selectedDateObject.getDay();

        let startTime = 0;
        let endTime = 0;

        merchantAvailableTimes.forEach((timeSlot) => {
            if (timeSlot.day == selectedWeekday) {
                startTime = timeSlot.startTime;
                endTime = timeSlot.endTime;
            }
        });

        return { startTime, endTime };
    },

    // ========================
    // Time Selector Code
    // ========================

    onTimeSelectorOpen(e) {
        this.setData({
            timeSelectorShow: true,
        });
    },
    onTimeSelectorClose() {
        this.setData({
            timeSelectorShow: false,
        });
    },

    onOpenTimePicker(e) {
        if (this.data.selectedDate == "") {
            wx.showToast({
                title: "请先选择日期",
                icon: "none",
            });
        } else {
            this.setData({
                timeShow: true,
            });
        }
    },

    onConfirmTime(e) {
        this.setData({
            selectedTime: e.detail,
        });
    },

    onTimeClose(e) {
        this.setData({
            timeShow: false,
            shownTime: e.detail,
        });
    },

    async onConfirmDateTime(e) {
        const { selectedYear, selectedDate, selectedTime, orderID } = this.data;
        const selectedDateTime = createFullDateTime(selectedYear, selectedDate, selectedTime);

        if (this.isTimeSlotFull(selectedDateTime)) {
            wx.showToast({
                title: "该档期已满，请重选",
                icon: "none",
            });
            return;
        }

        try {
            const confirmResult = await this.showConfirmationModal(selectedDate, selectedTime);
            if (confirmResult.confirm) {
                await this.attemptToUpdateReservationTime(selectedDateTime, orderID);
                this.setData({
                    timeSelectorShow: false,
                    dateStatusLoading: true,
                });
            } else {
                wx.showToast({
                    title: "已取消",
                    icon: "none",
                });
            }
        } catch (error) {
            console.error("Error in onConfirmDateTime:", error);
            wx.showToast({
                title: "时间更新失败",
                icon: "error",
            });
        } finally {
            this.setData({
                dateStatusLoading: false,
            });
        }
    },

    async showConfirmationModal(selectedDate, selectedTime) {
        return wx.showModal({
            title: "确定更改时间?",
            content: `${new Date().getFullYear()}/${selectedDate} ${selectedTime}`,
            cancelColor: "cancelColor",
        });
    },

    async attemptToUpdateReservationTime(selectedDateTime, orderID) {
        const updateResult = await cloud.callFunction({
            name: "update",
            data: {
                type: "order",
                orderid: orderID,
                data: { date: selectedDateTime },
            },
        });
        if (updateResult.result.stats.updated > 0) {
            wx.showToast({
                title: "时间更新成功",
                icon: "success",
            });
            setTimeout(async () => {
                await this.getOrderData(orderID);
            }, 1500);
        } else {
            wx.showToast({
                title: "时间更新失败",
                icon: "error",
            });
        }
    },

    isTimeSlotFull(selectedDateTime) {
        return this.data.currentAppointments.some(
            (appointment) =>
                new Date(appointment.date).getTime() === selectedDateTime.getTime() ||
                new Date(appointment.endDate).getTime() === selectedDateTime.getTime()
        );
    },
    // ========================
    // Status Selector Code
    // ========================
    onOpenStatusSelector(e) {
        this.setData({ showStatusSelector: true });
    },

    onCloseStatusSelector() {
        this.setData({ showStatusSelector: false });
    },

    // Refactored onSelectStatus
    async onSelectStatus(event) {
        this.setData({ statusLoading: true });

        const statusMap = {
            已拒绝: "rejected",
            待审核: "pending",
            已确定: "paid",
            已完成: "complete",
        };

        const newStatus = statusMap[event.detail.name];
        if (newStatus) {
            await this.updateOrderStatus(newStatus);
        }

        this.onCloseStatusSelector();
        setTimeout(() => this.refreshOrderData(), 1500);
    },

    async updateOrderStatus(status) {
        try {
            const res = await cloud.callFunction({
                name: "update",
                data: {
                    type: "order",
                    orderid: this.data.orderData._id,
                    data: { status: status },
                },
            });
            console.log(res);
        } catch (error) {
            console.error("Error updating order status:", error);
            wx.showToast({
                title: "订单状态更新失败",
                icon: "error",
            });
        }
    },

    // ========================
    // Navigators
    // ========================
    enlarge(e) {
        wx.previewImage({
            current: e.currentTarget.dataset.url,
            urls: [e.currentTarget.dataset.url],
        });
    },
    transactionNavigator(e) {
        wx.navigateTo({
            url: "/pages/transactionDetail/index?transactionid=" + e.currentTarget.dataset.transactionid,
        });
    },
});
