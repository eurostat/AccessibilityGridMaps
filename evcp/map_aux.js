


// update URL with map parameters
const updateURL = (map) => {
    //get parameters
    const p = new URLSearchParams(window.location.search);

    // map viewport
    const v = map.getView();
    p.set("x", v.x.toFixed(0)); p.set("y", v.y.toFixed(0)); p.set("z", v.z.toFixed(0));

    // handle selection
    p.set("t", document.querySelector('input[name="year"]:checked').value);
    p.set("nb", document.querySelector('input[name="nearest"]:checked').value);

    // handle checkboxes
    for (let cb of ["sbp", "sop", "label", "road", "bnd", "ag", "shading", "contours"])
        p.set(cb, document.getElementById(cb).checked ? "1" : "");

    // sliders
    [min, max] = document.getElementById('sliderisoc_evcp').noUiSlider.get(true);
    p.set("mine", Math.round(min)); p.set("maxe", Math.round(max));

    //interpolate
    //p.set("itrp", interpolate ? "1" : "");

    //set URL with map parameters
    const newURL = `${window.location.pathname}?${p.toString()}`;
    window.history.replaceState({}, '', newURL);
};
