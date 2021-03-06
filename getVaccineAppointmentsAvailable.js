const fs = require("fs");
const axios = require("axios");

const app = async () => {
  let centers = [];

  const { data: centersByState } = await axios.get(
    `https://www.impfterminservice.de/assets/static/impfzentren.json`
  );

  Object.keys(centersByState).forEach((key) => {
    centers = [...centers, ...centersByState[key]];
  });

  const appointmentsAvailable = {};

  await Promise.all(
    centers.map(async (center) => {
      if (!center.PLZ) return;
      const plz = center.PLZ;

      const result = await axios.get(
        `https://001-iz.impfterminservice.de/rest/suche/termincheck?plz=${plz}&leistungsmerkmale=L920,L921,L922`
      );

      if (result && result.data) {
        appointmentsAvailable[plz] = result.data.termineVorhanden;
      }
    })
  );

  console.log("Appointments Available: ", appointmentsAvailable);
  fs.writeFileSync("appointments.json", JSON.stringify(appointmentsAvailable));
};

app();
