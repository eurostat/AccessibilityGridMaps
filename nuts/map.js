const urlBase =
  "https://raw.githubusercontent.com/eurostat/AccessibilityGridMaps/refs/heads/main/nuts/csv/";

const statinfoOptions = {
  healthcare: [
    { name: "average travel time in minutes", code: "AVG-MN" },
    { name: "median travel time in minutes", code: "MED-MN" },
    { name: "share of population more than 5 min", code: "GT_5_MN-PC" },
    { name: "share of population more than 10 min", code: "GT_10_MN-PC" },
    { name: "share of population more than 20 min", code: "GT_20_MN-PC" },
    { name: "share of population more than 45 min", code: "GT_45_MN-PC" },
    { name: "population more than 5 min", code: "GT_5_MN-NR" },
    { name: "population more than 10 min", code: "GT_10_MN-NR" },
    { name: "population more than 20 min", code: "GT_20_MN-NR" },
    { name: "population more than 45 min", code: "GT_45_MN-NR" },
  ],
  education: [
    { name: "average travel time in minutes", code: "AVG-MN" },
    { name: "median travel time in minutes", code: "MED-MN" },
    { name: "share of population more than 2 min", code: "GT_2_MN-PC" },
    { name: "share of population more than 10 min", code: "GT_10_MN-PC" },
    { name: "share of population more than 15 min", code: "GT_15_MN-PC" },
    { name: "share of population more than 20 min", code: "GT_20_MN-PC" },
    { name: "population more than 2 min", code: "GT_2_MN-NR" },
    { name: "population more than 10 min", code: "GT_10_MN-NR" },
    { name: "population more than 15 min", code: "GT_15_MN-NR" },
    { name: "population more than 20 min", code: "GT_20_MN-NR" },
  ],
  evrp: [
    { name: "average travel distance in meters", code: "AVG-M" },
    { name: "median travel distance in meters", code: "MED-M" },
    { name: "share of population more than 500 m", code: "GT_500_M-PC" },
    { name: "share of population more than 2 km", code: "GT_2000_M-PC" },
    { name: "share of population more than 5 km", code: "GT_5000_M-PC" },
    { name: "population more than 500 m", code: "GT_500_M-NR" },
    { name: "population more than 2 km", code: "GT_2000_M-NR" },
    { name: "population more than 5 km", code: "GT_5000_M-NR" },
  ],
};
const indicOptions = {
  healthcare: [
    { name: "driving time to the nearest healthcare service", code: "N1" },
    {
      name: "average driving time to the 3 nearest healthcare services",
      code: "AN3",
    },
  ],
  education: [
    { name: "driving time to the nearest education service", code: "N1" },
    {
      name: "average driving time to the 3 nearest education services",
      code: "AN3",
    },
  ],
  evrp: [
    { name: "driving distance to the nearest recharging point", code: "N1" },
    {
      name: "average distance to the 5 nearest EV recharging points",
      code: "AN5",
    },
  ],
};
const timeOptions = {
  healthcare: [2026, 2023, 2020],
  education: [2026, 2023, 2020],
  evrp: [2025, 2024, 2023],
};

export function renderMap() {
  //read GUI selection
  const data = {};
  for (const ddl of [
    "service",
    "time",
    "statinfo-unit",
    "indic",
    "age",
    "mode",
    "degurba",
    "nuts_lvl",
  ])
    data[ddl] = document.getElementById(ddl).value;

  const a = data["statinfo-unit"].split("-")
  const statinfo = a[0]
  const unit = a[1]
  //console.log(statinfo, unit)

  // map type
  const maptype = ["MN", "M", "PC"].includes(unit) ? "choropleth" : "proportionalSymbol"

  const map = eurostatmap
    .map(maptype)
    .scale("60M")
    .transitionDuration(0)
    .insets("default")
    .insetsButton(true)
    .zoomButtons(true)
    .header(false)
    .footer(false)
    // .showEstatLogo(true)
    // .showEstatRibbon(true)
    .showSourceLink(false)
    //.footnote(
    //  ' <tspan style="font-style: italic;">Source</tspan>: <a href="https://ec.europa.eu/eurostat/web/gisco/geodata/geographic-accessibility/" target="_blank">Eurostat</a>',
    //)
    .footnoteTooltipText(false)

    .nutsLevel(data.nuts_lvl)
    .stat({
      csvURL:
        urlBase +
        "euro_access_NUTS_2024_" +
        data.service +
        "__TRA_MODE_" +
        data.mode +
        "__AGE_" +
        data.age +
        "__DEG_URB_" +
        data.degurba +
        "__ACCESS_INDIC_" +
        data.indic +
        "__STATINFO_" +
        statinfo +
        "__UNIT_" +
        unit +
        ".csv",
      geoCol: "GEO",
      valueCol: data.time,
      unitText: unit == "PC" ? "%" : unit == "MN" ? "min" : unit == "M" ? "m" : "",
      preprocess: (id, v) => (id.length - 2 == data.nuts_lvl ? v : null),
    });

  if (maptype == "choropleth") {
    map
      .colors([
        "#E0EAA8",
        "#BDE6B5",
        "#62C8BD",
        "#4ABBC2",
        "#155A9E",
        "#133C85",
      ])
      //.colors(['#FFEB99', '#E0EAA8', '#BDE6B5', '#8AD6B9', '#62C8BD', '#4ABBC2', '#3194B6', '#155A9E', '#133C85', '#17256B'])
      //.thresholds([10, 20, 30, 40, 50, 60, 70, 80, 90])
      .numberOfClasses(6)
      .classificationMethod(false ? "threshold" : "jenks") //jenks, quantile, equal, threshold
      .dorling(false)
      .legend({
        title: "Share, in %",
        titlePadding: -10,
        x: 5,
        y: 120,
        boxPadding: 4,
        boxOpacity: 0.9,
        tickLength: 8,
        maxMin: true,
        maxMinTickLength: 15,
        maxMinRegionLabels: false,
        maxMinLabels: ["", ""],
      });
  } else if (maptype == "proportionalSymbol") {
    map
      .psSettings({ maxSize: 20, minSize: 0, fill: "#155A9E" })
      //stroke: '#fff', strokeWidth: 0.2, sizeScale: 'linear'
      .dorling(true)
      //.psSettings({ shape: 'circle' }) // try: cross, diamond, star, square, wye, circle, triangle, rectangle https://github.com/d3/d3-shape#symbols
      .legend({
        title: "People",
        x: 5,
        y: 120,
        sizeLegend: { values: [100000, 5000000, 20000000] },
      });
  } else {
    console.log("unsupported map type: " + maptype)
  }

  map.build();

  //setTimeout(() => console.log(map.position()), 1000)
}

// add events
for (const ddl of [
  "time",
  "statinfo-unit",
  "indic",
  "age",
  "mode",
  "degurba",
  "nuts_lvl",
]) {
  document.getElementById(ddl).addEventListener("change", renderMap);
}

document.getElementById("service").addEventListener("change", function () {
  let dropdown;

  //update statinfo-unit list
  dropdown = document.getElementById("statinfo-unit");
  dropdown.innerHTML = "";
  statinfoOptions[this.value].forEach((elt, i) => {
    const option = new Option(elt.name, elt.code);
    dropdown.add(option);
  });
  dropdown.selectedIndex = 0;

  //update year list
  dropdown = document.getElementById("time");
  dropdown.innerHTML = "";
  timeOptions[this.value].forEach((elt, i) => {
    const option = new Option(elt, elt);
    dropdown.add(option);
  });
  dropdown.selectedIndex = 0;

  //update indic list
  dropdown = document.getElementById("indic");
  dropdown.innerHTML = "";
  indicOptions[this.value].forEach((elt, i) => {
    const option = new Option(elt.name, elt.code);
    dropdown.add(option);
  });
  dropdown.selectedIndex = 0;

  renderMap();
});

//trigger event to load the lists
document
  .getElementById("service")
  .dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));

//initial map redraw
//renderMap();
