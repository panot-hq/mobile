export function formatCreatedAt(isoString: string | null | undefined): string {
  let date: Date;

  if (!isoString) {
    date = new Date();
  } else {
    date = new Date(isoString);
    if (isNaN(date.getTime())) {
      date = new Date();
    }
  }

  const now = new Date();

  const timeString = date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  const diffTime = today.getTime() - targetDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Today at ${timeString}`;
  } else if (diffDays === 1) {
    return `Yesterday at ${timeString}`;
  } else if (diffDays <= 7) {
    const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" });
    return `Last ${dayOfWeek} at ${timeString}`;
  } else {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year} at ${timeString}`;
  }
}

export function formatCreatedAtDate(
  isoString: string | null | undefined
): string {
  let date: Date;

  if (!isoString) {
    date = new Date();
  } else {
    date = new Date(isoString);
    if (isNaN(date.getTime())) {
      date = new Date();
    }
  }

  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  const diffTime = today.getTime() - targetDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays <= 7) {
    const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" });
    return `Last ${dayOfWeek}`;
  } else {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }
}

export function formatCreatedAtTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });
}
