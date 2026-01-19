

const urlTiles = "https://ec.europa.eu/assets/estat/E/E4/gisco/accessibility_maps/healthcare_education/tiles/"
const urlBackground1 = 'https://ec.europa.eu/eurostat/cache/GISCO/mbkg/road/'
const nuts2jsonURL = "https://ec.europa.eu/assets/estat/E/E4/gisco/pub/nuts2json/v2/";
const euronymURL = "https://ec.europa.eu/assets/estat/E/E4/gisco/pub/euronym/v3/UTF_LATIN/";


const formatPopulation = (number) => number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")


//define background layers
const backgroundLayer1 = new gridviz.BackgroundLayer({
    url: urlBackground1,
    //resolutions: Array.from({ length: 12 }, (_, i) => 0.5 * 28.00132289714475 * Math.pow(2, 10 - i)),
    resolutions: Array.from({ length: 15 }, (_, i) => 114688 / Math.pow(2, i)),
    origin: [0, 6000000],
    nbPix: 512, //512 256
    //filterColor: () => '#ffffff55',
    visible: (z) => z > 4, //&& z < 2100,
    pixelationCoefficient: 0.55,
})

const backgroundLayer2 = new gridviz.BackgroundLayer(
    //OSMPositronCompositeEN OSMPositronBackground
    gridviz_eurostat.giscoBackgroundLayer('OSMPositronCompositeEN', 19, 'EPSG3035', {
        visible: (z) => z <= 4,
        pixelationCoefficient: 0.55,
    })
)

//define boundaries layer
const boundariesLayer = new gridviz.GeoJSONLayer(gridviz_eurostat.getEurostatBoundariesLayer({ baseURL: nuts2jsonURL, nutsYear: 2024, col: "#cc6699", scale: "03M", }))
//make labels layer
const labelLayer = new gridviz.LabelLayer(gridviz_eurostat.getEuronymeLabelLayer('EUR', '20', { baseURL: euronymURL, ccIn: ["AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FR", "GR", "HR", "HU", "IE", "IT", "LT", "LU", "LV", "PL", "PT", "MT", "NL", "RO", "SE", "SK", "SI", "CH", "NO", "LI", "AL",], }))

const strokeStyle = new gridviz.StrokeStyle({ visible: (z) => z < 4 })

const naColor = "#d6bad5" //"#ccc"



// update URL with map parameters
//TODO should be trigerred also on map move end event
const updateURL = (map) => {
    //get parameters
    const p = new URLSearchParams(window.location.search);

    // map viewport
    const v = map.getView();
    p.set("x", v.x.toFixed(0)); p.set("y", v.y.toFixed(0)); p.set("z", v.z.toFixed(0));

    // handle checkboxes
    for (let cb of ["healthcare", "education", "2020", "2023", "change", "1", "3", "sbp", "sop", "label", "background", "bnd", "ag"])
        p.set(cb, document.getElementById(cb).checked ? "1" : "");

    //interpolate
    //p.set("interpolate", interpolate ? "1" : "");

    //set URL with map parameters
    const newURL = `${window.location.pathname}?${p.toString()}`;
    window.history.replaceState({}, '', newURL);
};
