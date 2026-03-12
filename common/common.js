const urlBackground1 = 'https://ec.europa.eu/eurostat/cache/GISCO/mbkg/road/'
const nuts2jsonURL = "https://ec.europa.eu/assets/estat/E/E4/gisco/pub/nuts2json/v2/";
const euronymURL = "https://ec.europa.eu/assets/estat/E/E4/gisco/pub/euronym/v3/UTF_LATIN/";


//define background layers
const backgroundLayer1 = new gridviz.BackgroundLayer({
    url: urlBackground1,
    resolutions: Array.from({ length: 15 }, (_, i) => 114688 / Math.pow(2, i)),
    origin: [0, 6000000],
    nbPix: 512, //512 256
    //filterColor: () => '#ffffff55',
    visible: (z) => z > 4, //&& z < 2100,
    pixelationCoefficient: 0.55,
})

const backgroundLayer2 = new gridviz.BackgroundLayer(
    gridviz_eurostat.giscoBackgroundLayer('OSMPositronCompositeEN', 19, 'EPSG3035', {
        visible: (z) => z <= 4,
        pixelationCoefficient: 1,
    })
)

//define boundaries layer
const boundariesLayer = new gridviz.GeoJSONLayer(gridviz_eurostat.getEurostatBoundariesLayer({ baseURL: nuts2jsonURL, nutsYear: 2024, col: "#cc6699", scale: "03M", }))
//make labels layer
const labelLayer = new gridviz.LabelLayer(gridviz_eurostat.getEuronymeLabelLayer('EUR', '20', { baseURL: euronymURL, ccIn: ["AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FR", "GR", "HR", "HU", "IE", "IT", "LT", "LU", "LV", "PL", "PT", "MT", "NL", "RO", "SE", "SK", "SI", "CH", "NO", "LI", "AL",], }))

const strokeStyle = new gridviz.StrokeStyle({ visible: (z) => z < 4 })

const naColor = "#d6bad5" //"#ccc"


const formatPopulation = (number) => number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")

