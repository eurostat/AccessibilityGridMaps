export function renderMap(code) {
    console.log(code)
    const isMobile = window.innerWidth <= 768
    const mapWidth = isMobile ? window.innerWidth : 700
    const mapHeight = isMobile
        ? Math.round(window.innerHeight - 160) // 100% of viewport height - header etc
        : 550

    const configs = {
        EMP_PLOC_NR: {
            legendTitle: 'Share',
            colors: ['#FFEB99', '#E0EAA8', '#BDE6B5', '#8AD6B9', '#62C8BD', '#4ABBC2', '#3194B6', '#155A9E', '#133C85', '#17256B'],
            thresholds: [10, 20, 30, 40, 50, 60, 70, 80, 90],
            nbClasses: 7,
        },
        LC_EMP_LOC_TEUR: {
            legendTitle: 'Share',
            colors: ['#FFEB99', '#E0EAA8', '#BDE6B5', '#8AD6B9', '#62C8BD', '#4ABBC2', '#3194B6', '#155A9E', '#133C85', '#17256B'],
            thresholds: [10, 20, 30, 40, 50, 60, 70, 80, 90],
            nbClasses: 7,
            //transform: (value) => Number((value * 1000).toFixed(0)), // convert from thousand euro to euro
        },
    }
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
        .colors(configs[code].colors)
        .thresholds(configs[code].thresholds)
        .numberOfClasses(configs[code].nbClasses)
        .classificationMethod(configs[code].thresholds ? 'threshold' : 'jenks') //jenks, quantile, equal, threshold

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
        .nutsLevel(3)


        .stat({
            csvURL: "https://raw.githubusercontent.com/eurostat/AccessibilityGridMaps/refs/heads/main/nuts/csv/euro_access_healthcare_NUTS_2024__INDIC_LT_20_MIN.csv",
            geoCol: "GEO",
            valueCol: "2023"
        })
        .legend({
            title: configs[code].legendTitle,
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

renderMap('EMP_PLOC_NR')
