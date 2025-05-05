import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import dayjs from "dayjs";
import huLocale from "@fullcalendar/core/locales/hu";
import { useForm } from "@inertiajs/react";

const renderEventContent = (bookingInfo) => {
    const { isBooked, isConfirmed } = bookingInfo.event.extendedProps;

    if (isBooked) {
        return (
            <div className={`${isConfirmed ? "bg-slate-600" : "bg-slate-400"}`}>
                <span
                    className={`mr-1 ${
                        isConfirmed ? "text-red-500" : "text-amber-400"
                    }`}
                >
                    &#9679;
                </span>

                <i>{isConfirmed ? "Foglalt" : "Ideiglenes foglalas"}</i>
            </div>
        );
    }
    return (
        <div className="bg-green-600 text-white">
            <b>{bookingInfo.event.title}</b>
        </div>
    );
};

export default function CalendarComponent({ bookings, bookingErrors }) {
    const bookingsDisplay = bookings.map((booking) => {
        return {
            start: booking.start_date,
            end: booking.end_date,
            isBooked: true,
            isConfirmed: booking.is_confirmed,
        };
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

        return bookingsDisplay.some((booking) => {
            const bookingStart = dayjs(booking.start);
            const bookingEnd = dayjs(booking.end);
            if (!booking.isConfirmed) {
                return false;
            }
            return (
                (startDate.isBefore(bookingEnd) &&
                    endDate.isAfter(bookingStart)) ||
                (bookingStart.isBefore(endDate) &&
                    bookingEnd.isAfter(startDate))
            );
        });
    }

    function handleSelect(selectInfo) {
        const isOverlapping = checkOverlap(selectInfo.start, selectInfo.end);
        if (isOverlapping) {
            return;
        }

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
        const isOverlapping = checkOverlap(
            data.selectedStart,
            data.selectedEnd
        );
        const isOverlap2 = checkOverlap(info.date, info.date);

        if (isOverlapping || isOverlap2) {
            return;
        }

        if (!data.selectedStart) {
            setData("selectedStart", date.toDate());
            return;
        }

        if (date.isBefore(dayjs(data.selectedStart))) {
            setData("selectedStart", date.toDate());
            setData("selectedEnd", null);
            return;
        }

        if (data.selectedStart && data.selectedEnd) {
            setData("selectedStart", date.toDate());
            setData("selectedEnd", null);
        } else {
            setData("selectedEnd", date.hour(23).minute(59).toDate());
        }
    }

    function handleSubmit(e) {
        e.preventDefault();

        transform((data) => ({
            ...data,
            //ISO issue
            selectedStart: dayjs(data.selectedStart).add(1, "day").toDate(),
        }));
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
