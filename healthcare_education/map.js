/*
  TODO
  test interpolate ?
  add legend circles ?
  */

const DEFAULTMAPOSITION = { x: 4030000, y: 2950000, z: 1500 };
const map = new gridviz.Map(document.getElementById('map'), {
    x: DEFAULTMAPOSITION.x,
    y: DEFAULTMAPOSITION.y,
    z: DEFAULTMAPOSITION.z,
}).addZoomButtons().setViewFromURL()

//set selected layer from URL param
const urlParams = new URLSearchParams(window.location.search);

// service selection
document.getElementById(urlParams.get("s") == "e" ? "education" : "healthcare").checked = true

// time selection
let r_ = urlParams.get("t")
if (r_ != undefined && document.getElementById(r_)) document.getElementById(r_).checked = true
// nb services selection
r_ = urlParams.get("nb")
if (r_ != undefined && document.getElementById(r_)) document.getElementById(r_).checked = true

// checkboxes
for (let cb of ["sbp", "sop", "label", "road", "bnd", "ag", "shading", "contours"]) {
    const sel = urlParams.get(cb);
    if (sel == undefined) continue;
    document.getElementById(cb).checked = sel != "" && sel != "false" && +sel != 0
}

// interpolator
const interpolate = urlParams.get("itrp")


//define interpolator
const interpFun = interpolate ? styles => {
    const interp = new gridviz.Interpolator({
        value: (c) => c.v,
        interpolatedProperty: 'v',
        targetResolution: (r, z) => Math.min(Math.floor(z * r) / r, r),
    })
    interp.styles = styles
    return [interp]
} : styles => styles


// toggle options panel collapse from URL param
//if (urlParams.get("collapsed")) document.getElementById("expand-toggle-button").click();

// sliders
const minh = urlParams.get("minh") || 5, maxh = urlParams.get("maxh") || 26
const mine = urlParams.get("mine") || 2, maxe = urlParams.get("maxe") || 9

//initialise sliders
noUiSlider.create(document.getElementById('sliderisoc_healthcare'),
    { start: [minh, maxh], range: { 'min': 0, 'max': 60 }, margin: 1, step: 1, behaviour: 'drag', connect: [false, true, false], pips: { mode: 'count', values: 5, density: 10 } });
noUiSlider.create(document.getElementById('sliderisoc_education'),
    { start: [mine, maxe], range: { 'min': 0, 'max': 30 }, margin: 0.5, step: 0.5, behaviour: 'drag', connect: [false, true, false], pips: { mode: 'count', values: 7, density: 3.5 } });


// compute changes
const preprocess = (c) => {
    c.dt_1_change = c.dt_1_2023 == undefined || c.dt_1_2020 == undefined ? undefined : c.dt_1_2023 - c.dt_1_2020
    c.dt_a3_change = c.dt_a3_2023 == undefined || c.dt_a3_2020 == undefined ? undefined : c.dt_a3_2023 - c.dt_a3_2020
}

const dataset = {
    education: new gridviz.MultiResolutionDataset(
        [100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000],
        r => new gviz_par.TiledParquetGrid(map, urlTiles + "education_2025_11/" + r + "/"),
        { preprocess: preprocess }
    ),
    healthcare: new gridviz.MultiResolutionDataset(
        [100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000],
        r => new gviz_par.TiledParquetGrid(map, urlTiles + "healthcare_2025_11/" + r + "/"),
        { preprocess: preprocess }
    ),
}


// styles
const nbClasses = 9
const colorRamp = []; for (let i = 0; i <= nbClasses - 1; i++) colorRamp.push(d3.interpolateViridis(1 - i / (nbClasses - 1) * 0.6))
// d3.interpolateTurbo(1 - t) //t=> d3.interpolateCubehelixDefault(1-t) //d3.interpolateYlOrRd  interpolateSpectral
const colorRampChange = []; for (let i = 0; i <= nbClasses - 1; i++) colorRampChange.push(d3.interpolateSpectral(1 - i / (nbClasses - 1)))
colorRampChange[4] = "white"
const blendOperation = () => 'multiply' //(z < 200 ? 'multiply' : 'source-over')

const cols_ = { ...colorRamp }; cols_.na = naColor
const defaultStyle = new gridviz.SquareColorCategoryWebGLStyle({
    color: cols_,
    blendOperation: blendOperation,
})

const chColors = { ...colorRampChange }; chColors.na = naColor
const defaultChangeStyle = new gridviz.SquareColorCategoryWebGLStyle({
    color: chColors,
    blendOperation: blendOperation,
})
const defaultStyleSize = new gridviz.ShapeColorSizeStyle({
    size: (c, r, z, vs) => 1.41 * vs(c.POP_2021),
    viewScale: gridviz.viewScale({ valueFunction: (c) => +c.POP_2021, stretching: gridviz.logarithmicScale(-7) }),
    shape: () => "circle",
    blendOperation: blendOperation,
});

let shadingCoeff = -7
let reliefDirection = 1
let resFactor = 1

//define legend
const legendWidth = Math.min(window.innerWidth - 40, 400)
const legend = new gridviz.ColorDiscreteLegend({
    width: legendWidth,
    labelFormat: (text, i) => (+text).toFixed(Number.isInteger(+text) ? 0 : 1) + (i == 1 || i == nbClasses - 1 ? " min." : "")
})
//define not available legend
const naLegend = new gridviz.ColorCategoryLegend({ colorLabel: [[naColor, "Driving time not available"]], shape: "square", });

defaultStyle.legends = [legend, naLegend]
defaultStyleSize.legends = [legend, naLegend]
defaultChangeStyle.legends = [legend]

let service = document.querySelector('input[name="service"]:checked').value;
let indic = document.querySelector('input[name="nearest"]:checked').value;
let year = document.querySelector('input[name="year"]:checked').value;
let field = "dt_" + indic + "_" + year
let slider = document.getElementById('sliderisoc_' + service)

function update() {

    // read GUI information
    service = document.querySelector('input[name="service"]:checked').value;
    indic = document.querySelector('input[name="nearest"]:checked').value;
    year = document.querySelector('input[name="year"]:checked').value;
    field = "dt_" + indic + "_" + year

    const sop = document.getElementById('sop').checked;
    const sbp = document.getElementById('sbp').checked;
    const contours = document.getElementById('contours').checked;
    const shading = document.getElementById('shading').checked;
    const cn = document.getElementById('label').checked;
    const bn = document.getElementById('bnd').checked;
    const ag = document.getElementById('ag').checked;
    const bk = document.getElementById('road').checked;

    // show/hide slider
    document.getElementById("sliH").style.display = service == "healthcare" && year != "change" ? 'inline' : 'none'
    document.getElementById("sliE").style.display = service == "education" && year != "change" ? 'inline' : 'none'

    // show/hide options
    //document.getElementById("contours_").style.display = !sbp ? 'inline' : 'none'
    //document.getElementById("shading_").style.display = !sbp ? 'inline' : 'none'

    //show/hide copyrights
    const egCopyright = document.getElementById('eurogeographics-copyright');
    if (egCopyright) egCopyright.style.display = bn ? 'inline-block' : 'none';
    const tomtomCopyright = document.getElementById('tomtom-copyright');
    if (tomtomCopyright) tomtomCopyright.style.display = bk ? 'inline-block' : 'none';

    //
    slider = document.getElementById('sliderisoc_' + service)

    // the grid style
    let style = undefined
    let shadingStyle = undefined
    let tanakaStyle = undefined

    if (year != "change") {
        let [min, max] = slider.noUiSlider.get(true);
        const breaks = [...Array(nbClasses - 1).keys()].map(i => (60 * (min + (max - min) * i / (nbClasses - 2)) / 60).toFixed(2))

        if (!sbp) {
            // default style
            const classifier = gridviz.classifier(breaks)
            defaultStyle.code = (c) => c[field] == undefined ? "na" : classifier(+c[field] / 60)
            defaultStyle.cellsNb = -1
            defaultStyle.filter = c => (!sop || +c.POP_2021 > 0) && (c[field] != undefined || +c.POP_2021 > 0)
            style = defaultStyle
            if (shading) shadingStyle = new gridviz.ShadingStyle({ elevation: field, scale: gridviz.exponentialScale(shadingCoeff), revert: true })
            if (contours) tanakaStyle = new gridviz.SideTanakaStyle({ classifier: (() => c => nbClasses - 1 - classifier(c[field] / 60)), revert: false, limit: 'steep' })
        } else {
            // default style, sized by population
            const classifier = gridviz.colorClassifier(breaks, colorRamp)
            defaultStyleSize.color = (c) => (c[field] == undefined) ? naColor : classifier(c[field] / 60)
            defaultStyleSize.filter = c => +c.POP_2021 > 0
            style = defaultStyleSize
        }

        //legend
        legend.colors = () => colorRamp
        legend.breaks = () => breaks
        if (indic == "1")
            legend.title = "Driving time to nearest " + service + " service, in " + year
        else
            legend.title = "Average driving time to 3 nearest " + service + " services, in " + year

    } else {
        //define breaks by hand
        const breaks = service == "education" ? [-8, -4, -2, -1, 1, 2, 4, 8] : [-15, -8, -4, -2, 2, 4, 8, 15]
        //central class to hide
        const thr = breaks[4] * 60

        if (!sbp) {
            // style for change
            const classifier = gridviz.classifier(breaks)
            defaultChangeStyle.code = (c) => c[field] == undefined ? "na" : classifier(+c[field] / 60)
            defaultChangeStyle.cellsNb = -1
            defaultChangeStyle.filter = c => (!sop || +c.POP_2021 > 0) && c[field] != undefined && Math.abs(c[field]) >= thr
            style = defaultChangeStyle
            if (shading) shadingStyle = new gridviz.ShadingStyle({ elevation: field, scale: gridviz.exponentialScale(shadingCoeff), revert: true })
            if (contours) tanakaStyle = new gridviz.SideTanakaStyle({ classifier: (() => c => nbClasses - 1 - classifier(c[field] / 60)), revert: false, limit: 'steep' })
        }
        else {
            // style for change, sized by population
            const classifier = gridviz.colorClassifier(breaks, colorRampChange)
            defaultStyleSize.color = (c) => {
                let v = c[field]
                if (v == undefined || isNaN(v)) return "grey"
                return classifier(v / 60)
            }
            defaultStyleSize.filter = c => +c.POP_2021 > 0 && Math.abs(c[field]) >= thr
            style = defaultStyleSize
        }

        //legend
        legend.colors = () => colorRampChange
        legend.breaks = () => breaks
        if (indic == "1")
            legend.title = "Change in driving time to nearest " + service + " service from 2020 to 2023"
        else
            legend.title = "Change in average driving time to 3 nearest " + service + " service from 2020 to 2023"

    }


    //make layer stack
    layers = []

    //add background layers
    if (bk) { layers.push(backgroundLayer1), layers.push(backgroundLayer2) }

    //add grid layer
    if (ag) {
        // apply default style filter to stroke style
        strokeStyle.filter = style.filter

        // make grid layer
        const glayer = new gridviz.GridLayer(
            dataset[service],
            sbp || contours || shading ? [style] : [style, strokeStyle],
            { minPixelsPerCell: (sbp ? 6 : 1.6) * resFactor }
        )
        layers.push(glayer)
    }

    //shading layer
    if (shadingStyle && !sbp) {
        // apply default style filter to stroke style
        shadingStyle.filter = style.filter

        // make shading layer
        const glayerShading = new gridviz.GridLayer(
            dataset[service], [shadingStyle], { minPixelsPerCell: 1.6 * resFactor }
        )
        layers.push(glayerShading)
    }

    //tanaka layer
    if (tanakaStyle && !sbp) {
        // apply default style filter to stroke style
        tanakaStyle.filter = style.filter
        // make tanaka layer
        const glayerTanaka = new gridviz.GridLayer(
            dataset[service], [tanakaStyle], { minPixelsPerCell: 1.6 * resFactor }
        )
        if (glayerTanaka) layers.push(glayerTanaka)
    }

    //set tooltip on top layer
    if (layers.length >= 1) {
        const topLayer = layers[layers.length - 1]
        if (year == "change")
            topLayer.cellInfoHTML = (c) =>
                (!style.filter(c)) ? undefined :
                    c[field] == undefined ? undefined :
                        sop && !c.POP_2021 ? undefined :
                            Math.abs(c[field] / 60).toFixed(1) + " min " + (c[field] > 0 ? "slower" : "faster") + "<br>Population in 2021: " + formatPopulation(+c.POP_2021)
        else
            topLayer.cellInfoHTML = (c) =>
                (style.filter && !style.filter(c)) ? undefined :
                    //c[field] == undefined ? undefined :
                    sop && !c.POP_2021 ? undefined :
                        (c[field] == undefined ? "Not available" : (c[field] / 60).toFixed(1) + " min") + "<br>Population in 2021: " + formatPopulation(+c.POP_2021)
    }

    //add top layers
    if (bn) layers.push(boundariesLayer)
    if (cn) layers.push(labelLayer)

    //set map layers
    map.layers = layers

    map.redraw()
    updateURL(map)
}




// INTERFACE EVENT LISTENERS
addInterfaceEventListeners();
function addInterfaceEventListeners() {

    ['healthcare', 'education', 'change', '2020', '2023', '1', '3', 'label', 'bnd', 'ag', 'road', 'shading', 'contours', 'sbp', 'sop'].forEach((id) => {
        document.getElementById(id).addEventListener("click", (event) => {
            event.stopPropagation();
            update()
        })

    })

    //slider
    document.getElementById('sliderisoc_healthcare').noUiSlider.on("update", update);
    document.getElementById('sliderisoc_education').noUiSlider.on("update", update);

    //home button
    document.getElementById("home-button").addEventListener("click", (event) => {
        event.stopPropagation();
        map.setView(DEFAULTMAPOSITION.x, DEFAULTMAPOSITION.y);
        map.setZoom(DEFAULTMAPOSITION.z);
        map.redraw();
    });
}

//keyboard events
let animation = undefined
window.addEventListener('keypress', e => {
    //console.log(e.key)
    if (e.key == "m") { map.setZoom(map.getZoom() * 1.04); map.redraw() }
    if (e.key == "p") { map.setZoom(map.getZoom() / 1.04); map.redraw() }
    if (e.key == "t") { document.getElementById("contours").checked = !document.getElementById("contours").checked; update() }
    if (e.key == "s") { document.getElementById("shading").checked = !document.getElementById("shading").checked; update() }
    if (e.key == "r") { reliefDirection *= -1; update() }
    if (e.key == "d") { shadingCoeff -= 3; console.log(shadingCoeff); update() }
    if (e.key == "f") { shadingCoeff += 3; console.log(shadingCoeff); update() }
    if (e.key == "1") { const [min, max] = slider.noUiSlider.get(true); const step = service == "education" ? 0.5 : 1; slider.noUiSlider.set([min - step, max - step]) }
    if (e.key == "2") { const [min, max] = slider.noUiSlider.get(true); const step = service == "education" ? 0.5 : 1; slider.noUiSlider.set([min + step, max + step]) }
    if (e.key == "+") { resFactor /= 1.2; console.log(resFactor); update() }
    if (e.key == "-") { resFactor *= 1.2; console.log(resFactor); update() }
    if (e.key == "z") {
        //restart animation to 0
        slider.noUiSlider.set([0, service == "education" ? 3 : 6])
    }
    if (e.key == "a") {
        //stop animation
        if (animation) {
            clearInterval(animation);
            animation = undefined
            return
        }

        const max = service == "education" ? 30 : 60
        const amp = service == "education" ? 3 : 6
        let step = amp / 10

        //start animation
        animation = setInterval(() => {
            //get current value
            let v = slider.noUiSlider.get(true)[0]
            //increase position
            v += step
            //check  new value limits and bounce
            if (v + amp >= max) { step *= -1; v = max - amp }
            if (v <= 0) { step *= -1; v = 0 }
            //set position
            slider.noUiSlider.set([v, v + amp])
        }, 300);
    }
})

update()
