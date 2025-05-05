import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import dayjs from "dayjs";
import huLocale from "@fullcalendar/core/locales/hu";
import { useForm } from "@inertiajs/react";
import { useEffect } from "react";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

const renderEventContent = (bookingInfo) => {
    const { isBooked, isConfirmed, isEnd, isStart, isOneNightStay } =
        bookingInfo.event.extendedProps;

    if ((isStart && !isOneNightStay) || isEnd) {
        return <div className=" text-slate-600 py-2 px-1 rounded-sm"></div>;
    }

    if (isBooked) {
        if (isConfirmed) {
            return (
                <div className=" text-slate-600 py-2 px-1 rounded-sm">
                    <span className="mr-1 text-red-500">&#9679;</span>
                    <b>Foglalt</b>
                </div>
            );
        } else {
            return (
                <div className=" text-slate-600 py-2 px-1 rounded-sm">
                    <span className="mr-1 text-amber-200">&#9679;</span>
                    <b>Ideiglenes</b>
                </div>
            );
        }
    }

    return (
        <div className="bg-green-600 text-white rounded-sm py-2 justify-center items-center flex">
            <b>{bookingInfo.event.title}</b>
        </div>
    );
};

export default function CalendarComponent({ bookings, bookingErrors }) {
    const bookingsDisplay = bookings
        .filter((booking) => booking.is_confirmed)
        .flatMap((booking) => {
            const start = dayjs(booking.start_date).startOf("day");
            const end = dayjs(booking.end_date).startOf("day");
            const duration = end.diff(start, "day");
            const isOneNightStay = duration === 1;

            const days = [];
            let current = start;

            while (!current.isAfter(end, "day")) {
                const isEnd = current.isSame(end, "day");
                const isStart = current.isSame(start, "day");

                const date = isEnd
                    ? current.hour(12).toDate()
                    : current.hour(18).toDate();
                days.push({
                    title: "",
                    start: date,
                    allDay: true,
                    isBooked: true,
                    isConfirmed: booking.is_confirmed,
                    isEnd,
                    isStart,
                    isOneNightStay,
                });
                current = current.add(1, "day");
            }

            return days;
        });

    const { data, setData, post, processing, reset, errors, transform } =
        useForm({
            email: "",
            selectedStart: "",
            selectedEnd: "",
        });

    const isDisabled =
        !data.selectedStart || !data.selectedEnd || processing || !data.email;

    const selectedEvent = data.selectedStart
        ? {
              title: data.selectedEnd ? "Kivalasztott foglalas" : "Start",
              start: data.selectedStart,
              end: data.selectedEnd || data.selectedStart,
          }
        : null;

    const eventsToDisplay = selectedEvent
        ? [...bookingsDisplay, selectedEvent]
        : bookingsDisplay;

    function checkOverlap(start, end) {
        const startDate = dayjs(start);
        const endDate = dayjs(end);

        const overlappingBooking = bookingsDisplay.find((booking) => {
            const bookingStart = dayjs(booking.start);

            return bookingStart.isBetween(startDate, endDate, null, "[]");
        });

        if (overlappingBooking) {
            return true;
        }

        return null;
    }

    useEffect(() => {
        if (data.selectedStart && data.selectedEnd) {
            const isOverlapping = checkOverlap(
                data.selectedStart,
                data.selectedEnd
            );
            if (isOverlapping) {
                setData("selectedStart", null);
                setData("selectedEnd", null);
            }
        }
    }, [data.selectedStart, data.selectedEnd]);

    function handleSelect(selectInfo) {
        if (dayjs(selectInfo.start).diff(dayjs(selectInfo.end), "day") < -1) {
            setData("selectedStart", selectInfo.start);
            setData(
                "selectedEnd",
                dayjs(selectInfo.end).subtract(1, "minute").toDate()
            );
            return;
        }
    }

    function handleDateClick(info) {
        const date = dayjs(info.date);

        if (!data.selectedStart) {
            setData("selectedStart", date.hour(18).toDate());
            return;
        }

        if (date.isBefore(dayjs(data.selectedStart))) {
            setData("selectedStart", date.hour(18).toDate());
            setData("selectedEnd", null);
            return;
        }

        if (data.selectedStart && data.selectedEnd) {
            setData("selectedStart", date.hour(18).toDate());
            setData("selectedEnd", null);
        } else {
            setData("selectedEnd", date.hour(12).toDate());
        }
    }

    function handleSubmit(e) {
        e.preventDefault();

        post("/booking", {
            onSuccess: () => {
                reset("email", "selectedStart", "selectedEnd");
            },
        });
    }

    return (
        <div className="min-w-[80dvw]">
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                locales={[huLocale]}
                initialView="dayGridMonth"
                weekends={true}
                events={eventsToDisplay}
                eventContent={renderEventContent}
                eventBackgroundColor="transparent"
                eventBorderColor="transparent"
                selectable={true}
                select={handleSelect}
                dateClick={handleDateClick}
            />
            <form
                className="flex flex-col gap-2 items-center py-4"
                onSubmit={handleSubmit}
            >
                <div className="flex gap-2 items-center">
                    <label htmlFor="email">Email:</label>
                    <input
                        required
                        className="border p-3 rounded-md"
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData("email", e.target.value)}
                    />
                </div>

                <button
                    className={`p-3 rounded-md ${
                        isDisabled
                            ? "bg-slate-200 cursor-default"
                            : "bg-amber-300 hover:bg-amber-400 cursor-pointer"
                    }`}
                    disabled={isDisabled}
                >
                    Foglalas kivalasztasa
                </button>
            </form>
        </div>
    );
}
