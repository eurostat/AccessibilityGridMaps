

const urlTiles = "https://ec.europa.eu/assets/estat/E/E4/gisco/accessibility_maps/healthcare_education/tiles/"
//const urlTiles = "http://127.0.0.1:5500/tmp/"
const versionTag = "v2026_01" // "" // v2026_01 v2025_11



// update URL with map parameters
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
