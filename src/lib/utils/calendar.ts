    export type CalendarEvent = {
    title: string;
    description?: string;
    location?: string;
    startTime: string;
    endTime?: string; 
    };

    const formatGoogleDate = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");

    export const generateGoogleCalendarUrl = (event: CalendarEvent) => {
    const start = new Date(event.startTime);
    const end = event.endTime ? new Date(event.endTime) : new Date(start.getTime() + 60 * 60 * 1000); // Default 1 hour

    const url = new URL("https://calendar.google.com/calendar/render");
    url.searchParams.append("action", "TEMPLATE");
    url.searchParams.append("text", event.title);
    url.searchParams.append("dates", `${formatGoogleDate(start)}/${formatGoogleDate(end)}`);
    if (event.description) url.searchParams.append("details", event.description);
    if (event.location) url.searchParams.append("location", event.location);

    return url.toString();
    };

    export const generateIcsFile = (event: CalendarEvent) => {
    const start = new Date(event.startTime).toISOString().replace(/-|:|\.\d\d\d/g, "");
    const end = event.endTime 
        ? new Date(event.endTime).toISOString().replace(/-|:|\.\d\d\d/g, "")
        : new Date(new Date(event.startTime).getTime() + 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "");

    const icsContent = `BEGIN:VCALENDAR
    VERSION:2.0
    PRODID:-//RiseHigh//Dashboard//EN
    BEGIN:VEVENT
    UID:${new Date().getTime()}@risehigh.com
    DTSTAMP:${start}
    DTSTART:${start}
    DTEND:${end}
    SUMMARY:${event.title}
    DESCRIPTION:${event.description || ''}
    LOCATION:${event.location || ''}
    END:VEVENT
    END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    return URL.createObjectURL(blob);
    };