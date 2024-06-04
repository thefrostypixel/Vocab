let units = {};
let unitData = undefined;
let currentVocabs = [];
let currentProgress = {
    "Auswählen": [],
    "Schreiben": []
};
let options = {
    sel: {
        lang: undefined,
        group: undefined,
        unit: undefined
    },
    count: 10,
    tests: {
        "Auswählen": false,
        //"Kombinieren": false, // There are 5 sources on the left and 5 translations on the right. You have to select both of them to combine them.
        //"Buchstaben": false, // You have all letters in a random order and have to select them in the correct order.
        "Schreiben": false
    }
};
function saveOptions() {
    localStorage.setItem("options", JSON.stringify(options));
}
function loadOptions() {
    let o = localStorage.getItem("options");
    if (o) {
        options = JSON.parse(o);
    }
}

function loadUnits() {
    fetch("units/index.json").then(r => r.text()).then(d => {
        try {
            units = JSON.parse(d);
            selectUnit();
        } catch (e) {
            console.error(e);
            document.getElementById("page-title").innerHTML = "Vokabeln - Fehler";
            document.getElementById("select-unit").innerHTML = "<h1>Konnte die Liste der Einheiten nicht laden</h1>";
        }
    }).catch(() => {
        document.getElementById("page-title").innerHTML = "Vokabeln - Fehler";
        document.getElementById("select-unit").innerHTML = "<h1>Konnte die Liste der Einheiten nicht laden</h1>";
    });
}
function selectUnit() {
    saveOptions();
    document.querySelector("header").outerHTML = "<header select-unit><h1 id=\"header-title\">Einheiten</h1></header>";
    if (units[options.sel.lang] == undefined) {
        options.sel.lang = Object.keys(units)[0];
    }
    if (units[options.sel.lang][options.sel.group] == undefined) {
        options.sel.group = Object.keys(units[options.sel.lang])[0];
    }
    if (units[options.sel.lang][options.sel.group][options.sel.unit] == undefined) {
        options.sel.unit = Object.keys(units[options.sel.lang][options.sel.group])[0];
    }
    let html = "<h2>Sprache</h2><button class=\"select\"><a>" + options.sel.lang + "</a></button><div class=\"select-menu\"><button onclick=\"selectUnit();\">" + options.sel.lang + "</button>";
    for (let lang in units) {
        if (lang != options.sel.lang) {
            html += "<button onclick=\"options.sel.lang = this.innerText; selectUnit();\">" + lang + "</button>";
        }
    }
    /*html += "</div><h2>Gruppe</h2><button class=\"select\"><a>" + options.sel.group + "</a></button><div class=\"select-menu\"><button onclick=\"selectUnit();\">" + options.sel.group + "</button>";
    for (let group in units[options.sel.lang]) {
        if (group != options.sel.group) {
            html += "<button onclick=\"options.sel.group = this.innerText; selectUnit();\">" + group + "</button>";
        }
    }*/
    html += "</div><h2>Einheit</h2><button class=\"select\"><a>" + options.sel.unit + "</a></button><div class=\"select-menu\"><button onclick=\"selectUnit();\">" + options.sel.unit + "</button>";
    for (let unit in units[options.sel.lang][options.sel.group]) {
        if (unit != options.sel.unit) {
            html += "<button onclick=\"options.sel.unit = this.innerText; selectUnit();\">" + unit + "</button>";
        }
    }
    document.getElementById("select-unit").innerHTML = html + "</div><footer><button id=\"select-unit-continue-button\" onclick=\"selectTests();\">Weiter</button></footer>";
}
function selectTests() {
    saveOptions();
    document.querySelector("header").outerHTML = "<header select-tests><button id=\"back\" onclick=\"selectUnit();\">􀯶</button><h1 id=\"header-title\">Optionen</h1></header>";
    document.querySelectorAll(".count").forEach(b => {
        if (b.innerText == options.count || (b.innerText == "Alle" && options.count == Infinity)) {
            b.setAttribute("style", "transition-duration: 0s; background-color: #484;");
            b.getBoundingClientRect();
            b.setAttribute("style", "background-color: #484;");
        } else {
            b.setAttribute("style", "transition-duration: 0s;");
            b.getBoundingClientRect();
            b.removeAttribute("style");
        }
    });
    document.getElementById("select-tests-continue-button").setAttribute("style", "transition-duration: 0s;");
    document.getElementById("select-tests-continue-button").setAttribute("disabled", "");
    document.getElementById("select-tests-continue-button").getBoundingClientRect();
    document.getElementById("select-tests-continue-button").removeAttribute("style");
    document.querySelectorAll(".test").forEach(b => {
        if (options.tests[b.innerText]) {
            b.setAttribute("style", "transition-duration: 0s; background-color: #484;");
            document.getElementById("select-tests-continue-button").setAttribute("style", "transition-duration: 0s;");
            document.getElementById("select-tests-continue-button").removeAttribute("disabled");
            b.getBoundingClientRect();
            b.setAttribute("style", "background-color: #484;");
            document.getElementById("select-tests-continue-button").removeAttribute("style");
        }
    });
    fetch("units/" + units[options.sel.lang][options.sel.group][options.sel.unit] + ".json").then(r => r.text()).then(d => {
        try {
            unitData = JSON.parse(d);
        } catch (e) {
            console.error(e);
            document.getElementById("page-title").innerHTML = "Vokabeln - Fehler";
            document.getElementById("main").innerHTML = "<h1>Konnte die Einheit nicht laden</h1>";
        }
    }).catch(() => {
        document.getElementById("page-title").innerHTML = "Vokabeln - Fehler";
        document.getElementById("main").innerHTML = "<h1>Konnte die Einheit nicht laden</h1>";
    });
}
function selectCount(count) {
    options.count = count;
    document.querySelectorAll(".count").forEach(b => {
        if (b.innerText == count || (b.innerText == "Alle" && count == Infinity)) {
            b.style.backgroundColor = "#484";
        } else {
            b.removeAttribute("style");
        }
    });
}
function toggleTest(test) {
    options.tests[test] = !options.tests[test];
    let aTestIsEnabled = false;
    document.querySelectorAll(".test").forEach(b => {
        if (b.innerText == test) {
            if (options.tests[test]) {
                b.style.backgroundColor = "#484";
            } else {
                b.removeAttribute("style");
            }
        }
        if (b.hasAttribute("style")) {
            aTestIsEnabled = true;
        }
    });
    if (aTestIsEnabled) {
        document.getElementById("select-tests-continue-button").removeAttribute("disabled");
    } else {
        document.getElementById("select-tests-continue-button").setAttribute("disabled", "");
    }
}
function startUnit() {
    saveOptions();
    currentVocabs = Array.from({ length: unitData.length }, (_, i) => i);
    for (let i = currentVocabs.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [currentVocabs[i], currentVocabs[j]] = [currentVocabs[j], currentVocabs[i]];
    }
    currentVocabs.splice(options.count);
    currentProgress = {
        "Auswählen": [],
        "Schreiben": []
    };
    if (options.tests["Auswählen"]) {
        testSelect(0);
    } else if (options.tests["Kombinieren"]) {
        testCombine(0);
    } else if (options.tests["Buchstaben"]) {
        testLetters(0);
    } else if (options.tests["Schreiben"]) {
        testSpell(0);
    } else {
        alert("Could not start because no units are selected!");
    }
}
function testSelect(index) {
    document.querySelector("header").outerHTML = "<header test-select><button id=\"back\" onclick=\"selectTests();\">􀯶</button><h1 id=\"header-title\">Auswählen</h1></header>";
    let html = "<h2>" + unitData[currentVocabs[index]].from + "</h2>";
    let correctButton = Math.floor(Math.random() * Math.min(3, currentVocabs.length));
    let wrong = undefined;
    for (let i = 0; i < Math.min(3, currentVocabs.length); i++) {
        if (correctButton == i) {
            html += "<button class=\"option\" onclick=\"if (currentProgress['Auswählen'][" + index + "] == undefined) currentProgress['Auswählen'].push(true); ";
            if (index < currentVocabs.length - 1) {
                html += "testSelect(" + (index + 1) + ");";
            } else if (options.tests["Kombinieren"]) {
                html += "testCombine(0);";
            } else if (options.tests["Buchstaben"]) {
                html += "testLetters(0);";
            } else if (options.tests["Schreiben"]) {
                html += "testSpell(0);";
            } else {
                html += "showWellDone();";
            }
            html += "\">" + unitData[currentVocabs[index]].to + "</button>";
        } else {
            html += "<button class=\"option\" onclick=\"if (currentProgress['Auswählen'][" + index + "] == undefined) currentProgress['Auswählen'].push(false); this.style.background = '#844';\">" + unitData[currentVocabs[wrong = random(currentVocabs.length, [index, wrong])]].to + "</button>";
        }
    }
    document.getElementById("test-select").innerHTML = html;
}
function testCombine(index) /* TODO */ {}
function testLetters(index) /* TODO */ {}
function testSpell(index) /* TODO */ {
    document.querySelector("header").outerHTML = "<header test-spell><button id=\"back\" onclick=\"selectTests();\">􀯶</button><h1 id=\"header-title\">Schreiben</h1></header>";
    document.getElementById("test-spell").innerHTML = "<h2>" + unitData[currentVocabs[index]].from + "</h2><input id=\"test-spell-input\" enterkeyhint=\"next\" autocapitalize=\"off\" spellcheck=\"false\" onkeydown=\"if (event.key == 'Enter') testSpellVerify(" + index + ");\"><a id=\"test-spell-correct-title\"></a><h2 id=\"test-spell-correct-answer\"></h2><footer><button id=\"test-spell-continue-button\" onclick=\"testSpellVerify(" + index + ");\">Weiter</button></footer>";
    document.getElementById("test-spell-input").focus();
}
function testSpellVerify(index) {
    if (document.getElementById("test-spell-input").value == unitData[currentVocabs[index]].to) {
        currentProgress["Schreiben"].push(true);
        if (index == currentVocabs.length - 1) {
            showWellDone();
        } else {
            testSpell(index + 1);
        }
    } else {
        currentProgress["Schreiben"].push(false);
        // TODO Add A Button To Count It As Correct
        document.getElementById("test-spell-input").setAttribute("disabled", "");
        document.getElementById("test-spell-correct-title").innerText = "Richtige Antwort:";
        document.getElementById("test-spell-correct-answer").innerHTML = compareStrings(document.getElementById("test-spell-input").value, unitData[currentVocabs[index]].to);
        if (index == currentVocabs.length - 1) {
            document.getElementById("test-spell-continue-button").setAttribute("onclick", "showWellDone();");
            document.getElementById("test-spell-input").setAttribute("onkeydown", "if (event.key == 'Enter') { document.getElementById('test-spell-input').blur(); showWellDone(); }");
        } else {
            document.getElementById("test-spell-continue-button").setAttribute("onclick", "testSpell(" + (index + 1) + ");");
            document.getElementById("test-spell-input").setAttribute("onkeydown", "if (event.key == 'Enter') testSpell(" + (index + 1) + ");");
        }
    }
}
function showWellDone() {
    document.querySelector("header").outerHTML = "<header well-done><h1 id=\"header-title\">Zusammenfassung</h1></header>";
    let html = "";
    html += "<table><tbody><tr>";
    if (options.tests["Auswählen"]) {
        html += "<td>􀭈</td>";
    }
    if (options.tests["Schreiben"]) {
        html += "<td>􀅒</td>";
    }
    html += "<td>Vokabel</td></tr>";
    for (let i = 0; i < currentVocabs.length; i++) {
        html += "<tr>";
        if (options.tests["Auswählen"]) {
            if (currentProgress["Auswählen"][i]) {
                html += "<td style=\"color: #9F9;\">􀆅</td>";
            } else {
                html += "<td style=\"color: #FAA;\">􀆄</td>";
            }
        }
        if (options.tests["Schreiben"]) {
            if (currentProgress["Schreiben"][i]) {
                html += "<td style=\"color: #9F9;\">􀆅</td>";
            } else {
                html += "<td style=\"color: #FAA;\">􀆄</td>";
            }
        }
        html += "<td>" + unitData[currentVocabs[i]].from + "</td></tr>";
    }
    document.getElementById("well-done").innerHTML = html + "</tbody></table><footer><button id=\"test-spell-continue-button\" onclick=\"selectTests();\">Fertig</button></footer>";
}

loadOptions();
loadUnits();

function random(max, exclude = []) {
    let n = Math.floor(Math.random() * (max - exclude.length));
    for (let e of exclude.sort((a, b) => a - b)) {
        if (n >= e) {
            n++;
        }
    }
    return n;
}
function compareStrings(wrong, right) {
    let chars = [];
    let changes = 0;
    function uniqueCommon(aArray, aLo, aHi, bArray, bLo, bHi) {
        function findUnique(arr, lo, hi) {
            const lineMap = new Map();
            for ( let i = lo; i <= hi; i ++ ) {
                let line = arr[ i ];
                if ( lineMap.has( line ) ) {
                    lineMap.get( line ).count ++;
                    lineMap.get( line ).index = i;
                } else {
                    lineMap.set( line, {
                        count: 1,
                        index: i
                    } );
                }
            }
            lineMap.forEach( ( val, key, map ) => {
                if ( val.count !== 1 ) {
                    map.delete( key );
                } else {
                    map.set( key, val.index );
                }
            } );
            return lineMap;
        }
        const ma = findUnique( aArray, aLo, aHi );
        const mb = findUnique( bArray, bLo, bHi );
        ma.forEach( ( val, key, map ) => {
            if ( mb.has( key ) ) {
                map.set( key, {
                    indexA: val,
                    indexB: mb.get( key )
                } );
            } else {
                map.delete( key );
            }
        } );
        return ma;
    }
    function recurseLCS(aLo, aHi, bLo, bHi, uniqueCommonMap) {
        function addSubMatch(aLo, aHi, bLo, bHi) {
            while (aLo <= aHi && bLo <= bHi && wrong[aLo] === right[bLo]) {
                chars.push({
                    char: wrong[aLo++],
                    type: 0
                });
                bLo++;
            }
            let aHiTemp = aHi;
            while (aLo <= aHi && bLo <= bHi && wrong[aHi] == right[bHi]) {
                aHi--;
                bHi--;
            }
            const uniqueCommonMap = uniqueCommon(wrong, aLo, aHi, right, bLo, bHi);
            if (uniqueCommonMap.size == 0) {
                while (aLo <= aHi) {
                    chars.push({
                        char: wrong[aLo++],
                        type: -1
                    });
                    changes++;
                }
                while (bLo <= bHi) {
                    chars.push({
                        char: right[bLo++],
                        type: 1
                    });
                    changes++;
                }
            } else {
                recurseLCS(aLo, aHi, bLo, bHi, uniqueCommonMap);
            }
            while (aHi < aHiTemp) {
                chars.push({
                    char: wrong[++aHi],
                    type: 0
                });
                bHi++;
            }
        }
        let abMap = uniqueCommonMap || uniqueCommon(wrong, aLo, aHi, right, bLo, bHi);
        let ja = [];
        abMap.forEach(val => {
            let i = 0;
            while ( ja[ i ] && ja[ i ][ ja[ i ].length - 1 ].indexB < val.indexB ) {
                i ++;
            }
            if ( ! ja[ i ] ) {
                ja[ i ] = [];
            }
            if ( 0 < i ) {
                val.prev = ja[ i - 1 ][ ja[ i - 1 ].length - 1 ];
            }
            ja[ i ].push( val );
        } );
        let lcs = [];
        if ( 0 < ja.length ) {
            let n = ja.length - 1;
            lcs = [ ja[ n ][ ja[ n ].length - 1 ] ];
            while ( lcs[ lcs.length - 1 ].prev ) {
                lcs.push( lcs[ lcs.length - 1 ].prev );
            }
        }
        let x = lcs.reverse();
        if (x.length == 0) {
            addSubMatch(aLo, aHi, bLo, bHi);
        } else {
            if (aLo < x[0].indexA || bLo < x[0].indexB) {
                addSubMatch(aLo, x[0].indexA - 1, bLo, x[0].indexB - 1);
            }
            let i;
            for (i = 0; i < x.length - 1; i ++) {
                addSubMatch(x[i].indexA, x[i + 1].indexA - 1, x[i].indexB, x[i + 1].indexB - 1);
            }
            if (x[i].indexA <= aHi || x[i].indexB <= bHi) {
                addSubMatch(x[i].indexA, aHi, x[i].indexB, bHi);
            }
        }
    }
    recurseLCS(0, wrong.length - 1, 0, right.length - 1);
    if (changes > right.length / 2) {
        return "<a style=\"color: #9F9;\">" + right + "</a>";
    } else {
        let html = "";
        chars.forEach(char => {
            if (char.type == 1) {
                html += "<a style=\"color: #9F9;\">" + char.char + "</a>";
            } else if (char.type == -1) {
                html += "<a style=\"color: #FAA;\">" + char.char + "</a>";
            } else {
                html += char.char;
            }
        });
        return html;
    }
}
