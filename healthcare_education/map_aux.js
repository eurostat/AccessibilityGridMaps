

//const urlTiles = "https://ec.europa.eu/assets/estat/E/E4/gisco/accessibility_maps/healthcare_education/tiles/"
const urlTiles = "http://127.0.0.1:5500/tmp/"
const versionTag = "v2026_01"
const urlBackground1 = 'https://ec.europa.eu/eurostat/cache/GISCO/mbkg/road/'
const nuts2jsonURL = "https://ec.europa.eu/assets/estat/E/E4/gisco/pub/nuts2json/v2/";
const euronymURL = "https://ec.europa.eu/assets/estat/E/E4/gisco/pub/euronym/v3/UTF_LATIN/";


const formatPopulation = (number) => number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")


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



// update URL with map parameters
//TODO should be trigerred also on map move end event
const updateURL = (map) => {
    //get parameters
    const p = new URLSearchParams(window.location.search);

    // map viewport
    const v = map.getView();
    p.set("x", v.x.toFixed(0)); p.set("y", v.y.toFixed(0)); p.set("z", v.z.toFixed(0));

    // handle selection
    const service = document.querySelector('input[name="service"]:checked').value;
        p.set("s", service=="healthcare"?"h":"e");
    p.set("t", document.querySelector('input[name="year"]:checked').value);
    p.set("nb", document.querySelector('input[name="nearest"]:checked').value);

    // handle checkboxes
    for (let cb of ["sbp", "sop", "label", "road", "bnd", "ag", "shading", "contours"])
        p.set(cb, document.getElementById(cb).checked ? "1" : "");

    // sliders
    let [min, max] = document.getElementById('sliderisoc_healthcare').noUiSlider.get(true);
    p.set("minh", Math.round(min)); p.set("maxh", Math.round(max));
    [min, max] = document.getElementById('sliderisoc_education').noUiSlider.get(true);
    p.set("mine", Math.round(min)); p.set("maxe", Math.round(max));

    //interpolate
    //p.set("itrp", interpolate ? "1" : "");

    //set URL with map parameters
    const newURL = `${window.location.pathname}?${p.toString()}`;
    window.history.replaceState({}, '', newURL);
};
