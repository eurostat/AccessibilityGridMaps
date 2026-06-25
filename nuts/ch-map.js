
const indicOptions = {
    healthcare: [{ "name": "less than 5 min", "code": "LT_5_MIN" }, { "name": "less than 20 min", "code": "LT_20_MIN" }, { "name": "less than 45 min", "code": "LT_45_MIN" }],
    education: [{ "name": "less than 2 min", "code": "LT_2_MIN" }, { "name": "less than 10 min", "code": "LT_10_MIN" }, { "name": "less than 20 min", "code": "LT_20_MIN" }],
    evrp: [{ "name": "less than 500 m", "code": "LT_500_M" }, { "name": "less than 5 km", "code": "LT_5000_M" }]
}
/*const indicToText = {
    LT_5_MIN : "less than 5 min",
    LT_20_MIN : "less than 20 min",
    LT_45_MIN : "less than 45 min",
    LT_2_MIN : "less than 2 min",
    LT_10_MIN : "less than 10 min",
    LT_500_M : "less than 500 m",
    LT_5000_M : "less than 5 km",
}
const serviceToText = {
    healthcare: "healthcare service",
    education: "education service",
    evrp: "EV recharging point",
}*/

const timeOptions = {
    healthcare: [2023, 2020],
    education: [2023, 2020],
    evrp: [2025, 2024, 2023]
}



export function renderMap() {

    //read GUI selection
    const data = {}
    for (const ddl of ["service", "time", "indic", "nuts_lvl"])
        data[ddl] = document.getElementById(ddl).value


    const isMobile = window.innerWidth <= 768
    const mapWidth = isMobile ? window.innerWidth : 900
    const mapHeight = isMobile
        ? Math.round(window.innerHeight - 160) // 100% of viewport height - header etc
        : 550 * 9 / 7

    const map = eurostatmap
        .map('ch')
        .width(mapWidth)
        .height(mapHeight)
        .dorling(false)
        .scale('60M')
        //.title('Share of population within '+indicToText[data.indic]+' to the nearest ' + serviceToText[data.service] + " in "+data.time)

        .position({ x: 4300000, y: 3420000, z: isMobile ? 9000 : 7400 * 7 / 9 })
        .insetsButton(true)

        //classification
        //.colors(['#FFEB99', '#E0EAA8', '#BDE6B5', '#8AD6B9', '#62C8BD', '#4ABBC2', '#3194B6', '#155A9E', '#133C85', '#17256B'])
        .colors(['#E0EAA8', '#BDE6B5', '#62C8BD', '#4ABBC2', '#155A9E', '#133C85'])
        //.thresholds([10, 20, 30, 40, 50, 60, 70, 80, 90])
        .numberOfClasses(6)
        .classificationMethod(false ? 'threshold' : 'jenks') //jenks, quantile, equal, threshold

        //SE settings
        // .header(true)
        .footer(true)
        //.headerPadding(headerPadding)
        .zoomButtons(false)
        .showEstatLogo(true)
        .showEstatRibbon(true)
        .logoPosition([2, mapHeight - 30])
        .ribbonPosition([mapWidth - 180, mapHeight - 30])
        .ribbonWidth(300)
        .ribbonHeight(50)
        .showSourceLink(false)
        .footnote(' <tspan style="font-style: italic;">Source</tspan>: <a href="https://ec.europa.eu/eurostat/web/gisco/geodata/geographic-accessibility/" target="_blank">Eurostat</a>')
        .footnoteTooltipText(false)

        .zoomButtons(true)
        .insets('default')
        //end SE settings
        .nutsLevel(data.nuts_lvl)


        .stat({
            //euro_access_education_URAU_2024__AGE_T__ACCESS_INDIC_LT_2_MIN__UNIT_PC
            csvURL: "https://raw.githubusercontent.com/eurostat/AccessibilityGridMaps/refs/heads/main/nuts/csv/euro_access_NUTS_2024_" + data.service + "__AGE_T__ACCESS_INDIC_" + data.indic + "__UNIT_PC.csv",
            geoCol: "GEO",
            valueCol: data.time,
            unitText: '%'
        })
        .legend({
            title: "Share, in %",
            titlePadding: -10,
            x: 5,
            y: isMobile ? 10 : 100,
            boxPadding: 4,
            boxOpacity: 0.9,
            tickLength: 8,
            maxMin: true,
            maxMinTickLength: 15,
            maxMinRegionLabels: false,
            maxMinLabels: ['', ''],
        })

    map.build()

    //setTimeout(() => console.log(map.position()), 1000)
}

renderMap()




// add events
for (const ddl of ["time", "indic", "nuts_lvl"]) {
    document.getElementById(ddl).addEventListener("change", renderMap);
}

document.getElementById("service").addEventListener("change", function () {
    let dropdown

    //update driving type: driving time or driving distance
    document.getElementById('divingType').innerHTML = this.value == "evrp" ? "distance" : "time"

    //update indic list
    dropdown = document.getElementById('indic');
    dropdown.innerHTML = '';
    indicOptions[this.value].forEach((elt, i) => {
        const option = new Option(elt.name, elt.code);
        dropdown.add(option);
    });
    dropdown.selectedIndex = 1;

    //update year list
    dropdown = document.getElementById('time');
    dropdown.innerHTML = '';
    timeOptions[this.value].forEach((elt, i) => {
        const option = new Option(elt, elt);
        dropdown.add(option);
    });
    dropdown.selectedIndex = 1;

    renderMap()
});
