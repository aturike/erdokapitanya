import { Head } from "@inertiajs/react";
import Calendar from "../Components/Calendar.jsx";

export default function Home() {
    return (
        <>
            <Head title="Welcome" />
            <h1>Welcome</h1>
            <div className="flex justify-center">
                <Calendar />
            </div>
        </>
    );
}
