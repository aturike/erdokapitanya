import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import dayjs from "dayjs";
import huLocale from "@fullcalendar/core/locales/hu";
import { useState } from "react";

const events = [
    {
        title: "Workshop",
        start: dayjs().toDate(),
        end: dayjs().add(3, "days").toDate(),
    },
    {
        title: "Conference",
        start: dayjs().add(1, "week").toDate(),
        end: dayjs().add(1, "week").add(7, "days").toDate(),
    },
];

const renderEventContent = (eventInfo) => {
    return (
        <div className="bg-slate-400">
            {eventInfo.event.end && (
                <span className="text-red-500">&#9679;</span>
            )}
            <b>Foglalt</b>
        </div>
    );
};

export default function DemoApp() {
    const [selectedStart, setSelectedStart] = useState(null);
    const [selectedEnd, setSelectedEnd] = useState(null);

    const handleSelect = (selectInfo) => {
        console.log("Selected range:", selectInfo.start, selectInfo.end);
        setSelectedStart(selectInfo.start);
        setSelectedEnd(selectInfo.end);
    };

    return (
        <div className="min-w-[80dvw]">
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                locales={[huLocale]}
                initialView="dayGridMonth"
                weekends={true}
                events={events}
                eventContent={renderEventContent}
                selectable={true}
                select={handleSelect}
                selectOverlap={false}
            />
        </div>
    );
}
