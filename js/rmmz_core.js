//=============================================================================
// Fox_Utils.js
//=============================================================================
/*:ja
 * @target MZ
 * @plugindesc 便利機能を追加します。
 * @author きつねうどん 
 * 
 */


class Surface{
    constructor(x = 0, y = 0, opacity = 0, rotation = 0.0, scale_x = 0.0, scale_y = 0.0, color_r = 0, color_g = 0, color_b = 0, color_gray = 0){
        this.x = x;
        this.y = y;
        this.opacity = opacity;
        this.rotation = rotation;
        this.scale = {
            x: scale_x,
            y: scale_y,
        }
        this.colorTone = {
            r: color_r,
            g: color_g,
            b: color_b,
            gray: color_gray,
        }
    };

    static compose(...surfaces){
        let surface = new Surface();
        for(let element of surfaces){
            if(element instanceof Surface){        
                surface.x += element.x;
                surface.y += element.y;
                surface.opacity += element.opacity;
                surface.rotation += element.rotation;
                surface.scale.x += element.scale.x;
                surface.scale.y += element.scale.y;
                surface.colorTone.r += element.colorTone.r;
                surface.colorTone.g += element.colorTone.g;
                surface.colorTone.b += element.colorTone.b;
                surface.colorTone.gray += element.colorTone.gray;
            }
        }
        return surface;
    };
};

class Lerp{
    static TARGET_COMPOSE       = 0;
    static TARGET_SIZING        = 1;
    static TARGET_TRANSPARENCY  = 2;
    static TARGET_MOVING        = 3;
    static TARGET_ROTATION      = 4;
    static TARGET_COLORING      = 5;
    static TYPE_COMPOSE         = 0;
    static TYPE_LINEAR          = 1;
    static TYPE_EASEIN          = 2;
    static TYPE_EASEOUT         = 3;
    static TYPE_EASEINOUT       = 4;
    static TYPE_ELASTIC         = 5;
    static TYPE_BOUNCE          = 6;
    static models               = new Map();
    static emptySurface         = new Surface();

    constructor(target, type, duration, delay, ...values){
        this.target = target;
        this.type = type;
        this.duration = duration;
        this.delay = delay;
        if(target == Lerp.TARGET_COMPOSE || type == Lerp.TYPE_COMPOSE){
            this.values = values.filter(value => value instanceof Lerp).map(value => value.mapkey).sort();
            this.mapkey = this.getComposedKey();
            if(!Lerp.models.has(this.mapkey)){
                Lerp.models.set(this.mapkey, Lerp.compose(...values));
            }
        } else {
            this.values = values;
            this.mapkey = this.getMapKey();
            if(!Lerp.models.has(this.mapkey)){
                Lerp.models.set(this.mapkey, this.makeModel());
            }
        }
        this.endPoint = Lerp.models.get(this.mapkey).length - 1;
        this.progressList = [];
    };

    static compose(...lerps){
        let models = lerps.filter(value => value instanceof Lerp).map(value => Lerp.models.get(value.mapkey));
        let max = 0;
        for(let element of models){
            if(max < element.length){
                max = element.length;
            }
        }
        let surfaces = [];
        let composedModel = [];
        for(let i = 0; i < max; i ++){
            for(let element of models){
                if(element[i] instanceof Surface){
                    surfaces.push(element[i]);
                }
            }
            composedModel.push(Surface.compose(...surfaces));
            surfaces.length = 0;
        }
        if(composedModel.length == 0){
            return [Lerp.emptySurface];
        } else {
            return composedModel;
        }
    };

    start(index = 0){
        this.progressList.push(index);
    };

    inProgress(){
        if(this.progressList.length > 0){
            return true;
        } else {
            return false;
        }
    };

    update(){
        let surfaces = [];
        for(let i = 0; i < this.progressList.length; i ++){
            surfaces.push(this.getSurface(this.progressList[i]));
            if(this.progressList[i] >= this.endPoint){
                this.progressList.splice(i, 1)
                i --;
            } else {
                this.progressList[i] ++;
            }
        }
        return surfaces;
    };

    getMapKey(){
        return [this.target, this.type, this.duration, this.delay, this.values].join();
    };

    getComposedKey(){
        return ["c", this.values].join();
    };

    getSurface(index){
        return Lerp.models.get(this.mapkey, undefined)[index];
    };

    makeModel(){
        if(!(this.duration > 0) || this.values.length == 0){
            return [Lerp.emptySurface];
        }
        switch(this.type){
            case Lerp.TYPE_LINEAR:
                return this.getLinearModel();
            case Lerp.TYPE_EASEIN:
                return this.getEaseInModel();
            case Lerp.TYPE_EASEOUT:
                return this.getEaseOutModel();
            case Lerp.TYPE_EASEINOUT:
                return this.getEaseInOutModel();
            case Lerp.TYPE_ELASTIC:
                return this.getElasticModel();
            case Lerp.TYPE_BOUNCE:
                return this.getBounceModel();
            default:
                return [Lerp.emptySurface];
        }
    };

    addSurface(surfaces, params){
        switch(this.target){
            case Lerp.TARGET_SIZING:
                surfaces.push(new Surface(0, 0, 0, 0, params[0], params[1]));
                break;
            case Lerp.TARGET_TRANSPARENCY:
                surfaces.push(new Surface(0, 0, params[0]));
                break;
            case Lerp.TARGET_MOVING:
                surfaces.push(new Surface(params[0], params[1]));
                break;
            case Lerp.TARGET_ROTATION:
                surfaces.push(new Surface(0, 0, 0, params[0]));
                break;
            case Lerp.TARGET_COLORING:
                surfaces.push(new Surface(0, 0, 0, 0, 0, 0, params[0], params[1], params[2], params[3]));
                break;        
            default:
                surfaces.push(Lerp.emptySurface);
                break;
        }
    };

    takeDifference(surfaces){
        switch(this.target){
            case Lerp.TARGET_SIZING:
                for(let i = surfaces.length - 1; i > 0; i --){
                    surfaces[i].scale.x -= surfaces[i - 1].scale.x;
                    surfaces[i].scale.y -= surfaces[i - 1].scale.y;
                }
                break;
            case Lerp.TARGET_TRANSPARENCY:
                for(let i = surfaces.length - 1; i > 0; i --){
                    surfaces[i].opacity -= surfaces[i - 1].opacity;
                }
                break;
            case Lerp.TARGET_MOVING:
                for(let i = surfaces.length - 1; i > 0; i --){
                    surfaces[i].x -= surfaces[i - 1].x;
                    surfaces[i].y -= surfaces[i - 1].y;
                }
                break;
            case Lerp.TARGET_ROTATION:
                for(let i = surfaces.length - 1; i > 0; i --){
                    surfaces[i].rotation -= surfaces[i - 1].rotation;
                }
                break;
            case Lerp.TARGET_COLORING:
                for(let i = surfaces.length - 1; i > 0; i --){
                    surfaces[i].colorTone.r -= surfaces[i - 1].colorTone.r;
                    surfaces[i].colorTone.g -= surfaces[i - 1].colorTone.g;
                    surfaces[i].colorTone.b -= surfaces[i - 1].colorTone.b;
                    surfaces[i].colorTone.gray -= surfaces[i - 1].colorTone.gray;
                }
                break;        
            default:
                surfaces.push(Lerp.emptySurface);
                break;
        }
    };

    getLinearModel(){
        let surfaces = [];
        let params = [];
        for(let i = 0; i < this.values.length; i ++){
            params[i] = 0;
        }
        for(let i = 0; i < this.duration + this.delay; i ++){
            if(i < this.delay){
                surfaces.push(Lerp.emptySurface);
            } else {
                for(let j = 0; j < this.values.length; j ++){
                    params[j] = this.values[j] ? (this.values[j] / this.duration) : 0;
                }
                this.addSurface(surfaces, params);
            }
        }
        return surfaces;
    };

    getEaseInModel(){
        let surfaces = [];
        let params = [];
        let t = 0;
        for(let i = 0; i < this.values.length; i ++){
            params[i] = 0;
        }
        for(let i = 0; i < this.duration + this.delay; i ++){
            if(i < this.delay){
                surfaces.push(Lerp.emptySurface);
            } else { 
                t = (i - this.delay + 1) / this.duration;
                for(let j = 0; j < params.length; j ++){
                    params[j] = this.values[j] ? (1 - Math.cos(Math.PI / 2 * t)) * this.values[j] : 0;
                }
                this.addSurface(surfaces, params);
            }
        }
        this.takeDifference(surfaces);
        return surfaces;
    };

    getEaseOutModel(){
        let surfaces = [];
        let params = [];
        let t = 0;
        for(let i = 0; i < this.values.length; i ++){
            params[i] = 0;
        }
        for(let i = 0; i < this.duration + this.delay; i ++){
            if(i < this.delay){
                surfaces.push(Lerp.emptySurface);
            } else { 
                t = (i - this.delay + 1) / this.duration;
                for(let j = 0; j < params.length; j ++){
                    params[j] = this.values[j] ? (Math.sin(Math.PI / 2 * t) * this.values[j]) : 0;
                }
                this.addSurface(surfaces, params);
            }
        }
        this.takeDifference(surfaces);
        return surfaces;
    };

    getEaseInOutModel(){
        let surfaces = [];
        let params = [];
        let t = 0;
        for(let i = 0; i < this.values.length; i ++){
            params[i] = 0;
        }
        for(let i = 0; i < this.duration + this.delay; i ++){
            if(i < this.delay){
                surfaces.push(Lerp.emptySurface);
            } else {
                t = (i - this.delay + 1) / this.duration;
                for(let j = 0; j < params.length; j ++){
                    params[j] = this.values[j] ? ((1 - Math.cos(Math.PI * t)) * this.values[j]) / 2 : 0;
                }
                this.addSurface(surfaces, params);
            }
        }
        this.takeDifference(surfaces);
        return surfaces;
    };

    getElasticModel(){
        let surfaces = [];
        let params = [];
        let t = 0;
        for(let i = 0; i < this.values.length; i ++){
            params[i] = 0;
        }
        const C = (2 * Math.PI) / 3;
        for(let i = 0; i < this.duration + this.delay; i ++){
            if(i < this.delay){
                surfaces.push(Lerp.emptySurface);
            } else {
                if(i - this.delay == 0){
                    surfaces.push(Lerp.emptySurface);
                } else {
                    t = (i - this.delay + 1) / this.duration;
                    for(let j = 0; j < params.length; j ++){
                        params[j] = this.values[j] ? (Math.pow(2, -10 * t) * Math.sin(t * 10 - 0.75) * C + 1) * this.values[j] : 0;
                    }
                    this.addSurface(surfaces, params);
                }
            }
        }
        this.takeDifference(surfaces);
        return surfaces;
    };

    getBounceModel(){
        let surfaces = [];
        let params = [];
        let t = 0;
        for(let i = 0; i < this.values.length; i ++){
            params[i] = 0;
        }
        const C_1 = 7.5625;
        const C_2 = 2.75;
        for(let i = 0; i < this.duration + this.delay; i ++){
            if(i < this.delay){
                surfaces.push(Lerp.emptySurface);
            } else { 
                t = (i - this.delay + 1) / this.duration;
                if(t < 1 / C_2){
                    for(let j = 0; j < params.length; j ++){
                        params[j] = this.values[j] ? C_1 * t * t * this.values[j] : 0
                    }
                } else {
                    if(t < 2 / C_2){
                        for(let j = 0; j < params.length; j ++){
                            params[j] = this.values[j] ? (C_1 * (t - 1.5 / C_2) * (t - 1.5 / C_2) + 0.75) * this.values[j] : 0
                        }
                    } else {
                        if(t < 2.5 / C_2){
                            for(let j = 0; j < params.length; j ++){
                                params[j] = this.values[j] ? (C_1 * (t - 2.25 / C_2) * (t - 2.25 / C_2) + 0.9375) * this.values[j] : 0
                            }
                        } else {
                            for(let j = 0; j < params.length; j ++){
                                params[j] = this.values[j] ? (C_1 * (t - 2.625 / C_2) * (t - 2.625 / C_2) + 0.984375) * this.values[j] : 0
                            }
                        }
                    }
                }
                this.addSurface(surfaces, params);
            }
        }
        this.takeDifference(surfaces);
        return surfaces;
    };

};


class Trigger{
    static TYPE_CLICK               = 1;
    static TYPE_RELEASE             = 2;
    static TYPE_SELECT              = 3;
    static TYPE_PRESS               = 4;
    static TYPE_PRESS_SELECT        = 5;
    static TYPE_LONGPRESS           = 6;
    static TYPE_LONGPRESS_SELECT    = 7;
    static TYPE_REPEAT              = 8;
    static TYPE_REPEAT_SELECT       = 9;
    static TYPE_CANCEL              = 10;
    static TYPE_DOUBLE_CLICK        = 11;
    static TYPE_KEY_DOWN            = 21;
    static TYPE_KEY_UP              = 22;
    static TYPE_KEY_PRESS           = 23;
    static TYPE_KEY_LONGPRESS       = 24;
    static TYPE_KEY_REPEAT          = 25;
    static TYPE_KEY_DOUBLE_DOWN     = 26;

    static RANGE_NATURAL            = 1;
    static RANGE_RECTANGLE          = 2;
    static RANGE_CIRCLE             = 3;
    static RANGE_NATURAL_TINY       = 11;
    static RANGE_NATURAL_SMALL      = 12;
    static RANGE_NATURAL_BIG        = 13;
    static RANGE_NATURAL_HUGE       = 14;
    static RANGE_RECTANGLE_TINY     = 21;
    static RANGE_RECTANGLE_SMALL    = 22;
    static RANGE_RECTANGLE_BIG      = 23;
    static RANGE_RECTANGLE_HUGE     = 24;
    static RANGE_CIRCLE_TINY        = 31;
    static RANGE_CIRCLE_SMALL       = 32;
    static RANGE_CIRCLE_BIG         = 33;
    static RANGE_CIRCLE_HUGE        = 34;

    static RANGE_KEY_BACKSPACE      = 8;
    static RANGE_KEY_TAB            = 9;
    static RANGE_KEY_ENTER          = 13;
    static RANGE_KEY_SHIFT          = 16;
    static RANGE_KEY_CTRL           = 17;
    static RANGE_KEY_ALT            = 18;
    static RANGE_KEY_SPACE          = 32;
    static RANGE_KEY_LEFT           = 37;
    static RANGE_KEY_UP             = 38;
    static RANGE_KEY_RIGHT          = 39;
    static RANGE_KEY_DOWN           = 40;
    static RANGE_KEY_DELETE         = 46;
    static RANGE_KEY_0              = 48;
    static RANGE_KEY_1              = 49;
    static RANGE_KEY_2              = 50;
    static RANGE_KEY_3              = 51;
    static RANGE_KEY_4              = 52;
    static RANGE_KEY_5              = 53;
    static RANGE_KEY_6              = 54;
    static RANGE_KEY_7              = 55;
    static RANGE_KEY_8              = 56;
    static RANGE_KEY_9              = 57;
    static RANGE_KEY_A              = 65;
    static RANGE_KEY_B              = 66;
    static RANGE_KEY_C              = 67;
    static RANGE_KEY_D              = 68;
    static RANGE_KEY_E              = 69;
    static RANGE_KEY_F              = 70;
    static RANGE_KEY_G              = 71;
    static RANGE_KEY_H              = 72;
    static RANGE_KEY_I              = 73;
    static RANGE_KEY_J              = 74;
    static RANGE_KEY_K              = 75;
    static RANGE_KEY_L              = 76;
    static RANGE_KEY_M              = 77;
    static RANGE_KEY_N              = 78;
    static RANGE_KEY_O              = 79;
    static RANGE_KEY_P              = 80;
    static RANGE_KEY_Q              = 81;
    static RANGE_KEY_R              = 82;
    static RANGE_KEY_S              = 83;
    static RANGE_KEY_T              = 84;
    static RANGE_KEY_U              = 85;
    static RANGE_KEY_V              = 86;
    static RANGE_KEY_W              = 87;
    static RANGE_KEY_X              = 88;
    static RANGE_KEY_Y              = 89;
    static RANGE_KEY_Z              = 90;
    static RANGE_KEY_F_1            = 112;
    static RANGE_KEY_F_2            = 113;
    static RANGE_KEY_F_3            = 114;
    static RANGE_KEY_F_4            = 115;
    static RANGE_KEY_F_5            = 116;
    static RANGE_KEY_F_6            = 117;
    static RANGE_KEY_F_7            = 118;
    static RANGE_KEY_F_8            = 119;
    static RANGE_KEY_F_9            = 120;
    static RANGE_KEY_F_10           = 121;
    static RANGE_KEY_F_11           = 122;
    static RANGE_KEY_F_12           = 123;
    static RANGE_KEY_ESC            = 243;

    constructor(type, ...ranges){
        this.type = type;
        this.ranges = ranges;
        this.disabled = false;
        console.log(ranges);
        console.log(this.ranges);
    };

    check(parent){
        if(this.disabled){
            return false;
        }
        switch(this.type){
            case Trigger.TYPE_CLICK:
                return this.checkClick(parent);
            case Trigger.TYPE_RELEASE:
                return this.checkRelease();
            case Trigger.TYPE_SELECT:
                return this.checkSelect();
            case Trigger.TYPE_PRESS:
                return this.checkPress();
            case Trigger.TYPE_PRESS_SELECT:
                return this.checkPressSelect();
            case Trigger.TYPE_DOUBLE_CLICK:
                return this.checkDoubleClick();
            case Trigger.TYPE_KEY_DOWN:
                return this.checkKeyDown();
            case Trigger.TYPE_KEY_UP:
                return this.checkKeyUp();
            case Trigger.TYPE_KEY_PRESS:
                return this.checkKeyPress();
            case Trigger.TYPE_KEY_DOUBLE_DOWN:
                return this.checkKeyDoubleDown();
            default:
                return false;
        }
    };

    checkClick(parent){
        if(parent instanceof ItemSprite){
            console.log(parent)
            return "triggered"
        } else {
            if(TouchInput.isTriggered()){
                return true;
            } else {
                return false;
            }
        }
    };
// EventSprite.prototype.checkBoxCollision = function(x, y){
//     if(x >= this.x - this.anchor.x * this.bitmap.width * this.base.scale.x && x < this.x + (1 - this.anchor.x) * this.bitmap.width * this.base.scale.x && y >= this.y - this.anchor.y * this.bitmap.height * this.base.scale.y && y < this.y + (1 - this.anchor.y) * this.bitmap.height * this.base.scale.y){
//         return true;
//     } else {
//         return false;
//     }
// };

// EventSprite.prototype.checkAlphaCollision = function(x, y){
//     if(this.bitmap.getAlphaPixel(this.bitmap.width * this.anchor.x + (x - this.x) / this.base.scale.x, this.bitmap.height * this.anchor.y + (y - this.y) / this.base.scale.y)){
//         return true;
//     } else {
//         return false;
//     }
// };

    checkRelease(){
        return false;
    };

    checkSelect(){
        return false;
    };

    checkPress(){
        return false;
    };

    checkPressSelect(){
        return false;
    };

    checkDoubleClick(){
        return false;
    };

    checkKeyDown(){
        return false;
    };

    checkKeyUp(){
        return false;
    };

    checkKeyPress(){
        return false;
    };

    checkKeyDoubleDown(){
        return false;
    };

};

class Item{
    constructor(){
        this.triggerList = [];
        this.lerpList = [];
        this.functionList = [];
    };
};

function ItemSprite(){
    this.initialize.apply(this, arguments);
};

ItemSprite.prototype.constructor = ItemSprite;

ItemSprite.prototype.initialize = function(x = 0, y = 0){
    this.x = x;
    this.y = y;
    this.itemList = [];
    this.item = {
        lerp: new Lerp(Lerp.TARGET_MOVING, Lerp.TYPE_EASEINOUT, 20, 0, 40, 100),
        trigger: new Trigger(Trigger.TYPE_CLICK, Trigger.RANGE_NATURAL, Trigger.RANGE_NATURAL)
    }
};



let Input = {};
Input.keyMapper = {
    9: "tab", // tab
    13: "ok", // enter
    16: "shift", // shift
    17: "control", // control
    18: "control", // alt
    27: "escape", // escape
    32: "ok", // space
    33: "pageup", // pageup
    34: "pagedown", // pagedown
    37: "left", // left arrow
    38: "up", // up arrow
    39: "right", // right arrow
    40: "down", // down arrow
    45: "escape", // insert
    81: "pageup", // Q
    87: "pagedown", // W
    88: "escape", // X
    90: "ok", // Z
    96: "escape", // numpad 0
    98: "down", // numpad 2
    100: "left", // numpad 4
    102: "right", // numpad 6
    104: "up", // numpad 8
    120: "debug" // F9
};

//=============================================================================
// Input
//=============================================================================
Input.keyMapper["8"] = "backspace";
//Input.keyMapper["9"] = "tab"; already mapped as "tab"
//Input.keyMapper["13"] = "enter"; already mapped as "ok"
//Input.keyMapper["16"] = "shift"; already mapped as "shift"
//Input.keyMapper["17"] = "control"; already mapped as "control"
//Input.keyMapper["18"] = "control"; already mapped as "control"
//Input.keyMapper["27"] = "escape"; already mapped as "escape"
//Input.keyMapper["32"] = "space"; already mapped as "ok"
//Input.keyMapper["33"] = "pageup; already mapped as "pageup"
//Input.keyMapper["34"] = "pagedown"; already mapped as "pagedown"
//Input.keyMapper["37"] = "left"; already mapped as "left"
//Input.keyMapper["38"] = "up"; already mapped as "up"
//Input.keyMapper["39"] = "right"; already mapped as "right"
//Input.keyMapper["40"] = "down"; already mapped as "down"
//Input.keyMapper["45"] = "insert"; already mapped as "escape"
Input.keyMapper["46"] = "delete";
Input.keyMapper["48"] = "0";
Input.keyMapper["49"] = "1";
Input.keyMapper["50"] = "2";
Input.keyMapper["51"] = "3";
Input.keyMapper["52"] = "4";
Input.keyMapper["53"] = "5";
Input.keyMapper["54"] = "6";
Input.keyMapper["55"] = "7";
Input.keyMapper["56"] = "8";
Input.keyMapper["57"] = "9";
Input.keyMapper["65"] = "a";
Input.keyMapper["66"] = "b";
Input.keyMapper["67"] = "c";
Input.keyMapper["68"] = "d";
Input.keyMapper["69"] = "e";
Input.keyMapper["70"] = "f";
Input.keyMapper["71"] = "g";
Input.keyMapper["72"] = "h";
Input.keyMapper["73"] = "i";
Input.keyMapper["74"] = "j";
Input.keyMapper["75"] = "k";
Input.keyMapper["76"] = "l";
Input.keyMapper["77"] = "m";
Input.keyMapper["78"] = "n";
Input.keyMapper["79"] = "o";
Input.keyMapper["80"] = "p";
//Input.keyMapper["81"] = "q"; already mapped as "pageup"
Input.keyMapper["82"] = "r";
Input.keyMapper["83"] = "s";
Input.keyMapper["84"] = "t";
Input.keyMapper["85"] = "u";
Input.keyMapper["86"] = "v";
//Input.keyMapper["87"] = "w"; already mapped as "pagedown"
//Input.keyMapper["88"] = "x"; already mapped as "escape"
Input.keyMapper["89"] = "y";
//Input.keyMapper["90"] = "z"; already mapped as "ok"
//Input.keyMapper["96"] = "numpad0"; already mapped as "escape"
//Input.keyMapper["98"] = "numpad2"; already mapped as "down"
//Input.keyMapper["100"] = "numpad4"; already mapped as "left"
//Input.keyMapper["102"] = "numpad6"; already mapped as "right"
//Input.keyMapper["104"] = "numpad8"; already mapped as "up"
Input.keyMapper["112"] = "f1";
Input.keyMapper["113"] = "f2";
Input.keyMapper["114"] = "f3";
Input.keyMapper["115"] = "f4";
Input.keyMapper["116"] = "f5";
Input.keyMapper["117"] = "f6";
Input.keyMapper["118"] = "f7";
Input.keyMapper["119"] = "f8";
//Input.keyMapper["120"] = "f9"; already mapped as "debug"
Input.keyMapper["121"] = "f10";
Input.keyMapper["122"] = "f11";
Input.keyMapper["123"] = "f12";

let itsp = new ItemSprite(20, 40);
itsp.itemList.push(new Item());
console.log(itsp.item.trigger)
console.log(itsp.item.trigger.check(itsp));
console.log(Input.keyMapper);
// let ev = {x: 100, y: 50};
// let t = new Trigger(Trigger.click);
// console.log(t.check.call(ev, t.type));
// console.log(t.check());
// let tr = new Trigger(Trigger.release);
// console.log(tr.check());
// function Trigger(){
//     this.initialize.apply(this, arguments);
// };

// Trigger.prototype.constructor = Trigger;

// Trigger.prototype.initialize = function(d){
//     this.x = 0;
//     this.y = 0;
//     this.easing = new Easing(Easing.TARGET_SIZING, 2, d, 4);
// };


// let lerps = [];
// lerps.push(new Lerp(Lerp.TARGET_SIZING, Lerp.TYPE_LINEAR, 10, 2, 200, 120));
// lerps.push(new Lerp(Lerp.TARGET_MOVING, Lerp.TYPE_EASEIN, 20, 0, 100, 50));
// lerps.push(new Lerp(Lerp.TARGET_COMPOSE, Lerp.TYPE_COMPOSE, 0, 0, lerps[0], lerps[1]));
// lerps.push(new Lerp(Lerp.TARGET_COMPOSE, Lerp.TYPE_COMPOSE, 0, 0, lerps[0], lerps[1], 20));
// lerps.push(new Lerp(Lerp.TARGET_COMPOSE, Lerp.TYPE_COMPOSE, 0, 0, lerps[0], lerps[2]));
// lerps.push(new Lerp(Lerp.TARGET_COMPOSE, Lerp.TYPE_COMPOSE, 0, 0));

// lerps[0].start();
// lerps[0].start(2);
// lerps[1].start();
// console.log(lerps[0]);
// console.log(lerps[1]);
// console.log(lerps[2]);
// console.log(lerps[3]);
// console.log(lerps[4]);
// console.log(lerps[5]);
// console.log(Lerp.models);

// let surfaces = [];
// for(let i = 0; i < 20; i ++){
//     if(lerps[0].inProgress()){
//         surfaces.push(...lerps[0].update());
//     }
//     if(lerps[1].inProgress()){
//         surfaces.push(...lerps[1].update());
//     }
//     console.log(Surface.compose(...surfaces));
//     surfaces.length = 0;
// }

// =============================================================================
// Stage
// =============================================================================
// Stage.prototype.update = function(){
//     for(const child of this.children){
//         if(child.update){
//             child.update();
//         }
//     }
// };


// //=============================================================================
// // Bitmap
// //=============================================================================
// Bitmap.prototype.createImage = function(img_source, gx, gy, x = 0, y = 0, sx = this.width, sy = this.height){
//     this.blt(img_source, 0, 0, gx, gy, x, y);
//     this.blt(img_source, gx, 0, gx, gy, x + gx, y, sx - gx * 2, gy);
//     this.blt(img_source, gx * 2, 0, gx, gy, x + sx - gx, y);
//     this.blt(img_source, 0, gy, gx, gy, x, y + gy, gx, sy - gy * 2);
//     this.blt(img_source, gx, gy, gx, gy, x + gx, y + gy, sx - gx * 2, sy - gy * 2);
//     this.blt(img_source, gx * 2, gy, gx, gy, x + sx - gx, y + gy, gx, sy - gy * 2)
//     this.blt(img_source, 0, gy * 2, gx, gy, x, y + sy - gy);
//     this.blt(img_source, gx, gy * 2, gx, gy, x + gx, y + sy - gy,  sx - gx * 2, gy);
//     this.blt(img_source, gx * 2, gy * 2, gx, gy, x + sx - gx, y + sy - gy);
// };


// //=============================================================================
// // Params
// //=============================================================================
// const EASING_TARGET_SIZING          = 1;
// const EASING_TARGET_TRANSPARENCY    = 2;
// const EASING_TARGET_MOVING          = 3;
// const EASING_TARGET_ROTATION        = 4;
// const EASING_TARGET_COLORING        = 5;

// const EASING_TYPE_LINEAR            = 1;
// const EASING_TYPE_EASEIN            = 2;
// const EASING_TYPE_EASEOUT           = 3;
// const EASING_TYPE_EASEINOUT         = 4;
// const EASING_TYPE_BOUNCY            = 5;

// const TRIGGER_TYPE_NOTHING          = 0;
// const TRIGGER_TYPE_CLICK            = 1;

// //=============================================================================
// // Easing
// //=============================================================================
// function Easing(){
//     this.initialize.apply(this, arguments);
// }

// Easing.prototype.constructor = Easing;

// Easing.prototype.initialize = function(target, type, duration, delay, ...values){
//     this.target = target;
//     this.type = type;
//     this.duration = duration;
//     this.delay = delay;
//     this.values = values;
//     this.count = 0;
// };

// Easing.prototype.getTarget = function(target){
//     switch(target){
//         default:
//         case EASING_TARGET_SIZING:
//         return;
//     }
// };

// //=============================================================================
// // Trigger
// //=============================================================================
// // function Trigger(){
// //     this.initialize.apply(this, arguments);
// // }

// // Trigger.prototype.constructor = Trigger;

// // Trigger.prototype.initialize = function(){
// // };


// //=============================================================================
// // EXSprite
// //=============================================================================
// function EXSprite(){
//     this.initialize.apply(this, arguments);
// };

// EXSprite.prototype = Object.create(Sprite.prototype);
// EXSprite.prototype.constructor = EXSprite;

// EXSprite.prototype.initialize = function(bitmap, parent){
//     Sprite.prototype.initialize.call(this, bitmap);
//     this.anchor.x = 0.5;
//     this.anchor.y = 0.5;
//     this.base = {
//         scale: {
//             x: 1.0,
//             y: 1.0,
//         },
//         anchor: {
//             x: 0.5,
//             y: 0.5
//         },
//         opacity: 255,
//         x: 0,
//         y: 0,
//         rotation: 0.0,
//         colorTone: [0, 0, 0, 0],
//     };
//     this.easingList = [];
//     parent.addChild(this);
// };


// //=============================================================================
// // EventSprite
// //=============================================================================
// function EventSprite(){
//     this.initialize.apply(this, arguments);
// };

// EventSprite.prototype = Object.create(EXSprite.prototype);
// EventSprite.prototype.constructor = EventSprite;

// EventSprite.prototype.initialize = function(bitmap, parent, listener, event, isActive = true, isBoxCollision = false, isContinuous = true){
//     EXSprite.prototype.initialize.call(this, bitmap, parent);
//     this.trigger = new Trigger(Trigger.TYPE_CLICK),
//     this.listener = this.getListener(listener);
//     this.lestenerName = listener;
//     this.event = event;
//     this.isActive = isActive;
//     this.isBoxCollision = isBoxCollision;
//     this.isContinuous = isContinuous;
//     this.isPressed = false;
//     this.onCollisionRatio = 1.0;
//     this.offCollisionRatio = 1.25;
//     this.easeIn = {
//         count: 0,
//         function: this.easeIn_Shrink.bind(this),
//         callback: this.easeOut_Start.bind(this),
//         start: false,
//         end: false,
//     };
//     this.easeOut = {
//         count: 0,
//         function: this.easeOut_Enlarge.bind(this),
//         callback: this.easeEnd.bind(this),
//         start: false,
//         end: false,
//     };
// };

// EventSprite.prototype.update = function(){
//     EXSprite.prototype.update.call(this);
//     if(this.isActive){
//         this.listener.call(this, TouchInput.x, TouchInput.y);
//     }
//     if(this.easeIn.start && !this.easeIn.end){
//         if(this.easeIn.function()){
//             this.easeIn.callback();
//         }
//     }
//     if(this.easeOut.start && !this.easeOut.end){
//         if(this.easeOut.function()){
//             this.easeOut.callback();
//         }
//     }
// };

// EventSprite.prototype.getListener = function(listener){
//     switch(listener.toUpperCase()){
//         default:
//         case "CLICK":
//         return this.checkClick;
//         case "RELEASE":
//         return this.checkRelease;
//     }
// };

// EventSprite.prototype.checkClick = function(x, y){
//     if(TouchInput.isTriggered()){
//         if(this.isBoxCollision) {
//             if(this.checkBoxCollision(x, y)){
//                 this.touch();
//             }
//         } else {
//             if(this.checkAlphaCollision(x, y)){
//                 this.touch();
//             }
//         }
//     }  
// };

// EventSprite.prototype.checkBoxCollision = function(x, y){
//     if(x >= this.x - this.anchor.x * this.bitmap.width * this.base.scale.x && x < this.x + (1 - this.anchor.x) * this.bitmap.width * this.base.scale.x && y >= this.y - this.anchor.y * this.bitmap.height * this.base.scale.y && y < this.y + (1 - this.anchor.y) * this.bitmap.height * this.base.scale.y){
//         return true;
//     } else {
//         return false;
//     }
// };

// EventSprite.prototype.checkAlphaCollision = function(x, y){
//     if(this.bitmap.getAlphaPixel(this.bitmap.width * this.anchor.x + (x - this.x) / this.base.scale.x, this.bitmap.height * this.anchor.y + (y - this.y) / this.base.scale.y)){
//         return true;
//     } else {
//         return false;
//     }
// };

// EventSprite.prototype.checkRelease = function(x, y){
//     if(TouchInput.isTriggered()){
//         if(this.isBoxCollision) {
//             if(this.checkBoxCollision(x, y)){
//                 this.touch();
//             }
//         } else {
//             if(this.checkAlphaCollision(x, y)){
//                 this.touch();
//             }
//         }
//     }
//     if(TouchInput.isReleased()){
//     }
// };

// EventSprite.prototype.checkTouched = function(x, y){
//     if(this.isActive){
//         if(this.scale.x <= 0 || this.scale.y <= 0){
//             return false;
//         }
//         if(this.isBoxCollision) {
//             if(x >= this.x - this.anchor.x * this.bitmap.width * this.scale.x && x < this.x + (1 - this.anchor.x) * this.bitmap.width * this.scale.x && y >= this.y - this.anchor.y * this.bitmap.height * this.scale.y && y < this.y + (1 - this.anchor.y) * this.bitmap.height * this.scale.y){
//                 this.touch();
//             }
//         } else {
//             if(this.bitmap.getAlphaPixel(this.bitmap.width * this.anchor.x + (x - this.x) / this.scale.x, this.bitmap.height * this.anchor.y + (y - this.y) / this.scale.y)){
//                 this.touch();
//             }
//         }
//     }
// };

// EventSprite.prototype.touch = function(){
//     if(!this.isContinuous){
//         this.inactivate();
//     }
//     this.easeIn_Start();
//     this.event.apply(this, arguments);
// };

// EventSprite.prototype.activate = function(){
//     this.isActive = true;
// };

// EventSprite.prototype.inactivate = function(){
//     this.isActive = false;
// };

// EventSprite.prototype.setContinuous = function(){
//     this.isContinuous = true;
// };

// EventSprite.prototype.setUncontinuous = function(){
//     this.isContinuous = false;
// };

// EventSprite.prototype.setScale = function(x, y){
//     this.scale.x = x,
//     this.scale.y = y;
//     this.base.scale.x = x;
//     this.base.scale.y = y;
// };

// EventSprite.prototype.setAnchor = function(x, y){
//     this.anchor.x = x,
//     this.anchor.y = y;
//     this.base.anchor.x = x;
//     this.base.anchor.y = y;
// };

// EventSprite.prototype.easeIn_Start = function(){
//     this.easeIn.count = 0;
//     this.easeIn.start = true;
//     this.easeIn.end = false;
//     this.easeOut.count = 0;
//     this.easeOut.start = false;
//     this.easeOut.end = false;
//     this.easeIn.function();
// };

// EventSprite.prototype.easeOut_Start = function(){        
//     this.easeIn.count = 0;
//     this.easeIn.start = false;
//     this.easeIn.end = false;
//     this.easeOut.count = 0;
//     this.easeOut.start = true;
//     this.easeOut.end = false;
//     this.easeOut.function();
// };

// EventSprite.prototype.easeEnd = function(){   
//     this.easeIn.count = 0;
//     this.easeIn.start = false;
//     this.easeIn.end = false;
//     this.easeOut.count = 0;
//     this.easeOut.start = false;
//     this.easeOut.end = false;
// };

// EventSprite.prototype.easeIn_Shrink = function(){
//     if(this.easeIn.count > 0){
//         this.easeIn.count --;
//         this.scale.x = this.base.scale.x * (1 - Math.cos(this.easeIn.count / 20 * Math.PI) * 0.2);
//         this.scale.y = this.base.scale.y * (1 - Math.cos(this.easeIn.count / 20 * Math.PI) * 0.2);
//         if(this.easeIn.count <= 0){
//             this.easeIn.end = true;
//             return true;
//         } else {
//             return false;
//         }
//     } else {
//         this.easeIn.count = 10;
//         return false;
//     }
// };

// EventSprite.prototype.easeOut_Enlarge = function(){
//     if(this.easeOut.count > 0){
//         this.easeOut.count --;
//         this.scale.x = this.base.scale.x - Math.cos((10 - this.easeOut.count) / 20 * Math.PI) * 0.2;
//         this.scale.y = this.base.scale.y - Math.cos((10 - this.easeOut.count) / 20 * Math.PI) * 0.2;
//         if(this.easeOut.count <= 0){
//             this.easeOut.end = true;
//             return true;
//         } else {
//             return false;
//         }
//     } else {
//         this.easeOut.count = 10;
//         return false;
//     }
// };

