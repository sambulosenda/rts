/*
    Styleguide: https://github.com/airbnb/javascript
*/


/* global Image,document,window,setTimeout,console,XMLHttpRequest,game */


/*

    Technical functions

*/

var common = {};

common.getJSONFromURI = function(URI) {
    var request = new XMLHttpRequest();
    
    request.addEventListener("error", function() {console.error("common.getJSONFromURI could not get " + URI);}, false);
    request.addEventListener("abort", function() {console.error("common.getJSONFromURI could not get " + URI);}, false);
    
    request.open('GET', URI, false);
    request.send(null);
    if (request.status == 200) {
        return JSON.parse(request.responseText);
    } else {
        console.error("common.getJSONFromURI could not get " + URI);
        return null;
    }

};

common.require = function (){
    var scriptsToLoad = [],
        nScriptsLoaded = 0;
    
    // required files
    for (var i = 0; i < arguments.length-1; ++i) {
        scriptsToLoad.push(arguments[i]);
    }
    
    var callback = arguments[arguments.length-1];
    
    this.loadNext = function() {
        
        nScriptsLoaded += 1;
        
        if (nScriptsLoaded === scriptsToLoad.length) {
            callback();
            return;  
        }
        
        common.resources.scripts.add(scriptsToLoad[nScriptsLoaded], this.loadNext.bind(this));
    };
    
    common.resources.scripts.add(scriptsToLoad[0], this.loadNext.bind(this));
};

common.checkLineIntersection = function(line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) {
    // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
    var denominator, a, b, numerator1, numerator2, result = {
        x: null,
        y: null,
        onLine1: false,
        onLine2: false
    };
    denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
    if (denominator === 0) {
        return result;
    }
    a = line1StartY - line2StartY;
    b = line1StartX - line2StartX;
    numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
    numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
    a = numerator1 / denominator;
    b = numerator2 / denominator;

    // if we cast these lines infinitely in both directions, they intersect here:
    result.x = line1StartX + (a * (line1EndX - line1StartX));
    result.y = line1StartY + (a * (line1EndY - line1StartY));
/*
        // it is worth noting that this should be the same as:
        x = line2StartX + (b * (line2EndX - line2StartX));
        y = line2StartX + (b * (line2EndY - line2StartY));
        */
    // if line1 is a segment and line2 is infinite, they intersect if:
    if (a > 0 && a < 1) {
        result.onLine1 = true;
    }
    // if line2 is a segment and line1 is infinite, they intersect if:
    if (b > 0 && b < 1) {
        result.onLine2 = true;
    }
    // if line1 and line2 are segments, they intersect if both of the above are true
    return result;
};

/*

    Resources

*/

function resources(){}
common.resources = new resources();

// Tilesets

function tilesets(){}
common.resources.tilesets = new tilesets();

var tileset = Image;
tileset.prototype.grid = {
    width : null,
    height : null
};
tileset.prototype.tilesPerRow = 0;
tileset.prototype.nbErrors = 0;
tileset.prototype.animations = null;
tileset.prototype.image_selected = null;
tileset.prototype.isLoaded = false;

tilesets.prototype.add = function(name) {
    if (typeof common.resources.tilesets[name] !== 'undefined') {
        console.log("Tileset " + name + " has already been loaded");
        return null;
    }
    
    var URI = './assets/images/tilesets/' + name + '.json';
    
    var tilesetObject = common.getJSONFromURI(URI);
    
    if (tileset === null) {
        console.log("tilesets.add() could not load " + URI);
        return null;    
    }
    
    var imageURI = './assets/images/tilesets/' + name + '.png';
    
    common.resources.tilesets[name] = new tileset();
    common.resources.tilesets[name].addEventListener('load',function(){
        this.isLoaded = true;
        this.nbErrors = 0;
        this.tilesPerRow = this.width / this.grid.width;
    });
    
    common.resources.tilesets[name].addEventListener('error',function(){
        if(this.nbErrors <= 3) {
            this.nbErrors += 1;
            this.src = this.src;
        } else {
            console.error("tilesets.add could not load image " + imageURI);
        }
    });
    
    if (tilesetObject.imageSelected) {
        var image_selectedURI = './assets/images/tilesets/' +name + 'Selected.png';
        common.resources.tilesets[name].image_selected = new Image();
        
        common.resources.tilesets[name].image_selected.addEventListener('load',function(){
            this.isLoaded = true;
            this.nbErrors = 0;
            this.tilesPerRow = this.width / this.grid.width;
        });
        
        common.resources.tilesets[name].image_selected.addEventListener('error',function(){
            if(this.nbErrors <= 3) {
                this.nbErrors += 1;
                this.src = this.src;
            } else {
                console.error("tilesets.add could not load image " + image_selectedURI);
            }
        });
        
        common.resources.tilesets[name].image_selected.src = image_selectedURI;
    }
    
    common.resources.tilesets[name].grid = tilesetObject.grid;
    common.resources.tilesets[name].collisionBox = tilesetObject.collisionBox;
    common.resources.tilesets[name].animations = tilesetObject.animations;
    common.resources.tilesets[name].defaultAnimation = tilesetObject.defaultAnimation;
    common.resources.tilesets[name].src = imageURI;
    return common.resources.tilesets[name];
};

tilesets.prototype.get = function(name) {
    if(common.resources.tilesets[name] === undefined) {
        return common.resources.tilesets.add(name);
    }
    
    return common.resources.tilesets[name];
};

// Icons

function icons() {}
common.resources.icons = new icons();

var icon = Image;

icons.prototype.add = function(name) {
    if (typeof common.resources.icons[name] !== 'undefined') {
        console.log("Icon " + name + " has already been loaded");
        return null;
    }
    
    var imageURI = './assets/images/icons/' + name + '.png';
    
    common.resources.icons[name] = new icon();
    common.resources.icons[name].addEventListener('load',function(){
        this.nbErrors = 0;
    });
    
    common.resources.icons[name].addEventListener('error',function(){
        if(this.nbErrors <= 3) {
            this.nbErrors += 1;
            this.src = this.src;
        } else {
            console.error("tilesets.add could not load image " + imageURI);
        }
    });
    
    common.resources.icons[name].setAttribute("class","icon");
    common.resources.icons[name].src = imageURI;
    
    return common.resources.icons[name];
};

icons.prototype.get = function(name) {
    if(common.resources.icons[name] === undefined) {
        return common.resources.icons.add(name);
    }
    
    return common.resources.icons[name];
};

// Scripts
function Scripts() {}
common.resources.scripts = new Scripts();

function Script() {}

Scripts.prototype.add = function(name, callback) {
    var script = new Script();
    
    script.DOM = document.createElement("script");
    script.DOM.type = "text/javascript";
    
    if (script.DOM.readyState){  //IE
        script.DOM.onreadystatechange = function() {
            if (script.DOM.readyState == "loaded" ||
                    script.DOM.readyState == "complete"){
                script.DOM.onreadystatechange = null;
                if (window[name].initialise) window[name].initialise();
                if (callback) callback();
            }
        };
    } else {  //Others
        script.DOM.onload = function(){
            if (window[name].initialise) window[name].initialise();
            if (callback) callback();
        };
    }

    script.DOM.src = './assets/javascript/' + name + '.js';
    
    document.getElementsByTagName("head")[0].appendChild(script.DOM);
};

/*

    Game engine specific functions

*/


common.getGridFromScreen = function(level, canvas, x, y) {
    x = x + canvas.xOffset - level.tilewidth/2;
    y = y + canvas.yOffset;
   
    var gx = Math.floor((x / (level.tilewidth) + y / (level.tileheight)));
    var gy = Math.floor((y / (level.tileheight) - x / (level.tilewidth)));
    
    if (gx < 0) gx = 0;
    else if (gx >= level.width) gx = level.width-1;

    if (gy < 0) gy = 0;
    else if (gy >= level.height) gy = level.height-1;
    
    gx = parseInt(gx,10);
    gy = parseInt(gy,10);
    var i = gx + (gy * level.width);
    
    return { x : parseInt(gx,10), y : parseInt(gy,10), index : i};
    
};

common.getGridFromCoordinates = function(x, y) {
    var levelDefinition = game.getLevel();
    
    x = x - levelDefinition.tilewidth/2;
   
    var gx = Math.floor((x / (levelDefinition.tilewidth) + y / (levelDefinition.tileheight)));
    var gy = Math.floor((y / (levelDefinition.tileheight) - x / (levelDefinition.tilewidth)));
    
    if (gx < 0) gx = 0;
    else if (gx >= levelDefinition.width) gx = levelDefinition.width-1;

    if (gy < 0) gy = 0;
    else if (gy >= levelDefinition.height) gy = levelDefinition.height-1;
    
    gx = parseInt(gx,10);
    gy = parseInt(gy,10);
    
    var i = gx + (gy * levelDefinition.width);
    
    return { x : parseInt(gx,10), y : parseInt(gy,10), index : i};
    
};


// WARNING: This function is not tested yet
// TODO: test this function
common.getScreenFromGrid = function(level, canvas, x, y) {
    var sx = Math.round(canvas.xOffset) + ((parseInt(x,10) - parseInt(y,10)) * (level.tilewidth / 2));
    var sy = Math.round(canvas.yOffset) + ((parseInt(x,10) + parseInt(y,10)) * (level.tileheight / 2));
    return { x : sx, y : sy};
};

common.getCoordinatesFromGrid = function(x, y) {
    var levelDefinition = game.getLevel();
    var sx = ((parseInt(x,10) - parseInt(y,10)) * (levelDefinition.tilewidth / 2)) + levelDefinition.tilewidth/2;
    var sy = ((parseInt(x,10) + parseInt(y,10)) * (levelDefinition.tileheight / 2)) + levelDefinition.tileheight/2;
    return { x : sx, y : sy};
};