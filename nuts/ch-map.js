
const data = {
    service: "healthcare",
    time: 2023,
    indic: "INDIC_LT_5_MIN",
    nuts_lvl: 3,
}


export function renderMap() {

    const isMobile = window.innerWidth <= 768
    const mapWidth = isMobile ? window.innerWidth : 700
    const mapHeight = isMobile
        ? Math.round(window.innerHeight - 160) // 100% of viewport height - header etc
        : 550

    const map = eurostatmap
        .map('ch')
        .width(mapWidth)
        .height(mapHeight)
        .dorling(false)
        .scale('60M')
        //.title('Manufacturing sector by region, 2023')

        .position({ x: 4300000, y: 3420000, z: isMobile ? 9000 : 7400 })
        .insetsButton(true)

        //classification
        .colors(['#FFEB99', '#E0EAA8', '#BDE6B5', '#8AD6B9', '#62C8BD', '#4ABBC2', '#3194B6', '#155A9E', '#133C85', '#17256B'])
        //.thresholds([10, 20, 30, 40, 50, 60, 70, 80, 90])
        .numberOfClasses(7)
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
        .footnote(
            ' <tspan style="font-style: italic;">Source</tspan>: Eurostat <a href="https://ec.europa.eu/eurostat" target="_blank">(sbs_r_nuts2021)</a>'
        )
        .footnoteTooltipText(false)

        .zoomButtons(true)
        .insets('default')
        //end SE settings
        .nutsLevel(data.nuts_lvl)


        .stat({
            csvURL: "https://raw.githubusercontent.com/eurostat/AccessibilityGridMaps/refs/heads/main/nuts/csv/euro_access_" + data.service + "_NUTS_2024__" + data.indic + ".csv",
            geoCol: "GEO",
            valueCol: data.time
        })
        .legend({
            title: "Share of TODO",
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

renderMap(data)


const indicOptions = {
    "healthcare": [ { "name": "LT_5_MIN", "code": "LT_5_MIN", "status": "active" }, { "name": "LT_20_MIN", "code":"LT_20_MIN", "status": "active" }, { "name": "LT_45_MIN", "code":"LT_45_MIN", "status": "active" }],
    "education": [
        { name: "LT_2_MIN", code: "LT_2_MIN", "status": "active" },
        { name: "LT_10_MIN", code: "LT_10_MIN", "status": "active" },
        { name: "LT_20_MIN", code: "LT_20_MIN", "status": "active" }
    ],
}


// import the module that registers <ewc-select>
import './dropdown/ewc-singleselect.js';


// Wait for the custom element to be defined, then initialize
(async () => {
    await customElements.whenDefined('ewc-singleselect');

    for (const ddl of ["time", "nuts_lvl", "indic"]) {
        document.getElementById(ddl).addEventListener('option-selected', e => {
            data[ddl] = e.detail.option.code
            renderMap();
        })
    }

    document.getElementById("service").addEventListener('option-selected', e => {
        const s = e.detail.option.code
        data["service"] = s
        //document.getElementById('indic').options = indicOptions[s]
        renderMap();
    })

})();
