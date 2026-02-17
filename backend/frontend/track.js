// Get tracking number from URL
const params = new URLSearchParams(window.location.search);
const tn = params.get("tn")?.trim().toUpperCase();

if (!tn) {
  document.body.innerHTML = "<h2>No tracking number provided</h2>";
  throw new Error("No tracking number in URL");
}

// Fetch shipment from backend
fetch(`/api/shipments/${tn}`)
  .then(res => {
    if (!res.ok) throw new Error("Shipment not found");
    return res.json();
  })
  .then(shipment => {
    const tnElem = document.getElementById("tn");
    const senderElem = document.getElementById("sender");
    const receiverElem = document.getElementById("receiver");
    const originElem = document.getElementById("origin");
    const destinationElem = document.getElementById("destination");
    const weightElem = document.getElementById("weight");
    const statusElem = document.getElementById("status");
    const lastUpdateElem = document.getElementById("lastUpdate");

    // Fill shipment info
    tnElem.textContent = shipment.trackingNumber || "N/A";
    senderElem.textContent = shipment.sender || "N/A";
    receiverElem.textContent = shipment.recipient || "N/A";
    originElem.textContent = shipment.origin || "N/A";
    destinationElem.textContent = shipment.destination || "N/A";
    weightElem.textContent = shipment.weight || "N/A";
    statusElem.textContent = shipment.status || "N/A";
    lastUpdateElem.textContent = shipment.lastUpdate || "N/A";

    // -------------------------
    // PROGRESS + HISTORY
    // -------------------------
    const progressList = document.getElementById("progressList");
    const historyBody = document.querySelector("#historyTable tbody");

    if (shipment.history && shipment.history.length > 0) {
      shipment.history.forEach((item, index) => {

        // HISTORY TABLE
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${item.date || ""}</td>
          <td>${item.location || ""}</td>
          <td>${item.status || ""}</td>
        `;
        historyBody.appendChild(row);

        // PROGRESS LIST
        const li = document.createElement("li");
        li.textContent = item.status || "";

        // last item = active
        if (index === shipment.history.length - 1) {
          li.classList.add("active");
        } else {
          li.classList.add("done");
        }

        progressList.appendChild(li);
      });
    }

    // -------------------------
    // MAP
    // -------------------------
    const map = L.map("map").setView([6.5244, 3.3792], 4);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

    shipment.route?.forEach(r => {
      L.marker([r.lat, r.lng]).addTo(map).bindPopup(r.label || "");
    });

    const coords = shipment.route?.map(r => [r.lat, r.lng]) || [];
    if (coords.length) map.fitBounds(coords);

  })
  .catch(err => {
    document.body.innerHTML = "<h2>Shipment not found</h2>";
    console.error(err);
  });