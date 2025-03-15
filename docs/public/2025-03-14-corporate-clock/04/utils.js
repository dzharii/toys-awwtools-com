
function loadTimeZones() {
    const container = document.getElementById("timezones");
    timeZones.forEach(zone => {
        const clockDiv = document.createElement("div");
        clockDiv.textContent = `${zone.name}: ${new Date().toLocaleTimeString("en-US", { timeZone: zone.timezone })}`;
        container.appendChild(clockDiv);
    });
}

