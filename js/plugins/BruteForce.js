//=============================================================================
// BruteForce.js
//=============================================================================
/*:ja
 * @plugindesc それいけぼくらのブルートフォース用プラグイン
 * @author きつねうどん 
 * 
 */

(function() {
    var pluginName = 'BRUTEFORCE';

    //=============================================================================
    // Scene_Boot
    //=============================================================================
    var _Scene_Boot_start = Scene_Boot.prototype.start;
    Scene_Boot.prototype.start = function(){
        _Scene_Boot_start.apply(this, arguments);
        if (!DataManager.isBattleTest() && !DataManager.isEventTest()){
            SceneManager.push(Scene_BRUTEFORCE);
        }
    };


    //=============================================================================
    // Utility
    //=============================================================================
    Input.keyMapper['8']  = 'backspace';
    Input.keyMapper['13'] = 'enter';
    Input.keyMapper['16'] = 'shift';
    Input.keyMapper['46'] = 'delete';
    Input.keyMapper['65'] = 'a';
    Input.keyMapper['66'] = 'b';
    Input.keyMapper['67'] = 'c';
    Input.keyMapper['68'] = 'd';
    Input.keyMapper['69'] = 'e';
    Input.keyMapper['70'] = 'f';
    Input.keyMapper['71'] = 'g';
    Input.keyMapper['72'] = 'h';
    Input.keyMapper['73'] = 'i';
    Input.keyMapper['74'] = 'j';
    Input.keyMapper['75'] = 'k';
    Input.keyMapper['76'] = 'l';
    Input.keyMapper['77'] = 'm';
    Input.keyMapper['78'] = 'n';
    Input.keyMapper['79'] = 'o';
    Input.keyMapper['80'] = 'p';
    Input.keyMapper['81'] = 'q';
    Input.keyMapper['82'] = 'r';
    Input.keyMapper['83'] = 's';
    Input.keyMapper['84'] = 't';
    Input.keyMapper['85'] = 'u';
    Input.keyMapper['86'] = 'v';
    Input.keyMapper['87'] = 'w';
    Input.keyMapper['88'] = 'x';
    Input.keyMapper['89'] = 'y';
    Input.keyMapper['90'] = 'z';

    function lp(filename){
        return ImageManager.loadPicture(filename);
    };

    function transCode(num){
        switch(num ){
            case 0:
            default:
                return 'A';
            case 1:
                return 'B';
            case 2:
                return 'C';
            case 3:
                return 'D';
            case 4:
                return 'E';
            case 5:
                return 'F';
            case 6:
                return 'G';
            case 7:
                return 'H';
            case 8:
                return 'I';
            case 9:
                return 'J';
            case 10:
                return 'K';
            case 11:
                return 'L';
            case 12:
                return 'M';
            case 13:
                return 'N';
            case 14:
                return 'O';
            case 15:
                return 'P';
            case 16:
                return 'Q';
            case 17:
                return 'R';
            case 18:
                return 'S';
            case 19:
                return 'T';
            case 20:
                return 'U';
            case 21:
                return 'V';
            case 22:
                return 'W';
            case 23:
                return 'X';
            case 24:
                return 'Y';
            case 25:
                return 'Z';
        }
    };

    var getServerTime = function(){
        'use strict';
        var startServerTime;
        var xhr = new XMLHttpRequest();
        xhr.open('HEAD', location.href + '?' + Date.now(), false);
        try {
            xhr.send();
            startServerTime = new Date(xhr.getResponseHeader('Date') || Date.now()).getTime();
        } catch (error) {
            startServerTime = Date.now();
        }
        startServerTime -= performance.now();
        return function() {
            return startServerTime + performance.now();
        };
    };

    Bitmap.prototype.createImagePatched = function(img, gx, gy, x = 0, y = 0, sx = this.width, sy = this.height){
        this.blt(img, 0, 0, gx, gy, x, y);
        this.blt(img, gx, 0, gx, gy, x + gx, y, sx - gx * 2, gy);
        this.blt(img, gx * 2, 0, gx, gy, x + sx - gx, y);
        this.blt(img, 0, gy, gx, gy, x, y + gy, gx, sy - gy * 2);
        this.blt(img, gx, gy, gx, gy, x + gx, y + gy, sx - gx * 2, sy - gy * 2);
        this.blt(img, gx * 2, gy, gx, gy, x + sx - gx, y + gy, gx, sy - gy * 2)
        this.blt(img, 0, gy * 2, gx, gy, x, y + sy - gy);
        this.blt(img, gx, gy * 2, gx, gy, x + gx, y + sy - gy,  sx - gx * 2, gy);
        this.blt(img, gx * 2, gy * 2, gx, gy, x + sx - gx, y + sy - gy);
    };

    Sprite.prototype.setAnchor = function(x, y){
        this.anchor.x = x;
        this.anchor.y = y;
    };

    Sprite.prototype.setScale = function(x, y){
        this.scale.x = x;
        this.scale.y = y;
    };

    TilingSprite.prototype.moveOrigin = function(x, y){
        this.origin.x += x;
        this.origin.y += y;
    };

    Utils.rgbToCssColor = function(r, g, b) {
        r = Math.round(r);
        g = Math.round(g);
        b = Math.round(b);
        return 'rgb(' + r + ',' + g + ',' + b + ')';
    };


    //=============================================================================
    // Images
    //=============================================================================
    var img_background = {
        red: lp('bg_red'),
        green: lp('bg_green'),
        blue: lp('bg_blue'),
    };

    var img_gauge = {
        frame: lp('gauge_frame'),
        meter: lp('gauge_meter'),
        log: lp('gauge_log'),
    };

    var img_frame = {
        main: lp('frame_main'),
        key: lp('frame_key'),
        info: lp('frame_info'),
        text: lp('frame_text'),
        circle: lp('frame_circle'),
    };

    var img_icon = {
        desc: lp('icon_desc'),
        asc: lp('icon_asc'),
        rank: lp('icon_rank'),
        lock: lp('icon_lock'),
        people: lp('icon_people'),
        time: lp('icon_time'),
        up: lp('icon_up'),
        down: lp('icon_down'),
        close: lp('icon_close'),
    };

    var img_keys = {
        desc: lp('key_1'), asc: lp('key_2'), rank: lp('key_3'), 
        up: lp('key_up'), down: lp('key_down'), close: lp('key_0'),
        enter: lp('key_enter'), backspace: lp('key_backspace'), shift: lp('key_shift'), delete: lp('key_delete'),
        a: lp('key_a'), b: lp('key_b'), c: lp('key_c'), d: lp('key_d'), e: lp('key_e'), f: lp('key_f'),
        g: lp('key_g'), h: lp('key_h'), i: lp('key_i'), j: lp('key_j'), k: lp('key_k'),
        l: lp('key_l'), m: lp('key_m'), n: lp('key_n'), o: lp('key_o'), p: lp('key_p'),
        q: lp('key_q'), r: lp('key_r'), s: lp('key_s'), t: lp('key_t'), u: lp('key_u'),
        v: lp('key_v'), w: lp('key_w'), x: lp('key_x'), y: lp('key_y'), z: lp('key_z'),
    };


    //=============================================================================
    // Class Password
    //=============================================================================
    function Password(){
        this.word = 'pass';
        this.seed = 1;
    };

    Password.prototype.setWord = function(length){
        this.word = '';
        for(var i = 0; i < length; i ++){
            this.word += transCode(this.getValue() % 26);
        }
    };

    Password.prototype.setSeed = function(num){
        this.seed = num;
    };

    Password.prototype.getValue = function(){
        this.seed = this.seed * 16807 % 2147483647;
        return this.seed;
    };

    Password.prototype.checkWord = function(word){
        var x = this.word.length; 
        var y = word.length; 
        var d = []; 
        for( var i = 0; i <= x; i++ ) { 
            d[i] = []; 
            d[i][0] = i; 
        } 
        for( var i = 0; i <= y; i++ ) { 
            d[0][i] = i; 
        } 
        var cost = 0; 
        for( var i = 1; i <= x; i++ ) { 
            for( var j = 1; j <= y; j++ ) { 
                cost = this.word[i - 1] == word[j - 1] ? 0 : 1; 
                d[i][j] = Math.min( d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost ); 
            }
        }
        return d[x][y];
    };


    //=============================================================================
    // Specifications
    //=============================================================================
    const KEY_SIZE_X              = 30;
    const KEY_SIZE_Y              = 30;
    const KEY_SIZE_SHIFT_X        = 58;
    const KEY_SIZE_ENTER_X_LONG   = 46;
    const KEY_SIZE_ENTER_X_SHORT  = 22;
    const KEY_SIZE_ENTER_Y        = 62;
    const KEY_MARGIN              = 62;
    const KEY_TOP_X               = 88;
    const KEY_MIDDLE_X            = 110;
    const KEY_BOTTOM_X            = 134;
    const KEY_TOP_Y               = 434;
    const KEY_MIDDLE_Y            = 496;
    const KEY_BOTTOM_Y            = 558;
    const KEY_ENTER_X             = 692;
    const KEY_ENTER_Y             = 528;

    const GAUGE_X                 = 744;
    const GAUGE_Y                 = 404;
    const GAUGE_SIZE_X            = 27;
    const GAUGE_SIZE_Y            = 180;
    const GAUGE_MAX_RATE          = 144;

    const INFO_LEFT_X             = 100;
    const INFO_MIDDLE_X           = 288;
    const INFO_RIGHT_X            = 476;
    const INFO_Y                  = 54;
    const INFO_SIZE               = 16;
    const INFO_OUTLINE_SIZE       = 3;
    const INFO_COLOR              = '#200030';
    const INFO_OUTLINE_COLOR      = '#FFFFFF';

    const BUTTON_X                = 766;
    const BUTTON_TOP_Y            = 150;
    const BUTTON_MIDDLE_Y         = 232;
    const BUTTON_BOTTOM_Y         = 314;

    const MODAL_X                 = 88; 
    const MODAL_Y                 = 72;

    const TEXT_X                  = 96;
    const TEXT_Y                  = 358;
    const TEXT_SIZE               = 32;
    const TEXT_OUTLINE_SIZE       = 4;
    const TEXT_COLOR              = '#FFFFFF';
    const TEXT_OUTLINE_COLOR      = '#404080';
    const TEXT_MAX_LENGTH         = 32;

    var TEXT_LENGTH               = 4;
    var GAUGE_INTERVAL            = 1;
    var ACTION_ENABLED            = true;
    var PASSWORD                  = new Password();
    var PLAYER_NAME               = 'プレイヤー';
    var TIME_SERVER               = getServerTime();
    var TIME_LOCAL                = Date.now();


    //=============================================================================
    // Class Background
    //=============================================================================
    function Background(scene, img, mx, my, interval){
        this.sprite = new TilingSprite(img);
        scene.addChild(this.sprite);
        this.sprite.blendMode = 1;
        this.sprite.move(0, 0, this.sprite.bitmap.width, this.sprite.bitmap.height);
        this.mx = mx;
        this.my = my;
        this.interval = interval;
        this.count = 0;
    };

    Background.prototype.update = function(){
        this.sprite.moveOrigin(this.mx, this.my);
        if(this.interval > 0){
            this.count ++;
            this.sprite.opacity = (Math.sin(this.count / this.interval) + 1) * 64;
        }
    };


    //=============================================================================
    // Class Frame
    //=============================================================================
    function Frame(scene, img, gx, gy, x, y, sx, sy){
        this.sprite = new Sprite(new Bitmap(sx, sy));
        this.sprite.bitmap.createImagePatched(img, gx, gy);
        scene.addChild(this.sprite);
        this.sprite.move(x, y);
    };

    
    //=============================================================================
    // Class Modal
    //=============================================================================
    function Modal(scene, x, y, sx, sy){
        this.filter = new Sprite(new Bitmap(816, 624));
        scene.addChild(this.filter);
        this.filter.bitmap.fillAll('#000000');
        this.filter.opacity = 0;//144;
        this.frame = new Sprite(new Bitmap(sx, sy));
        this.frame.bitmap.createImagePatched(img_frame.main, 40, 40);
        scene.addChild(this.frame);
        this.frame.move(x, y);
        this.frame.opacity = 0;
    };


    //=============================================================================
    // Class Log
    //=============================================================================
    function Log(scene, x, y){
        this.textarea = new Sprite(new Bitmap(560, 192));
        scene.addChild(this.textarea);
        this.textarea.bitmap.fillAll('#000000');
        this.textarea.opacity = 255;
        this.textarea.blendMode = 1;
        this.textarea.move(x, y);

        this.textarea.bitmap.fontSize = 24;
        this.textarea.bitmap.outlineWidth = 4;
        this.textarea.bitmap.textColor = TEXT_COLOR;
        this.textarea.bitmap.outlineColor = TEXT_OUTLINE_COLOR;
        this.textarea.bitmap.fontFace = $gameSystem.mainFontFace();
        this.textarea.bitmap.drawText('  きつねうどん　のアタック！', 2, 0, 556, 32, 'left');
        this.textarea.bitmap.drawText('[ ABCD EFGH ABCD EFGH ABCD EFGH ABCD EFGH ]', 2, 32, 556, 32, 'left');
        this.textarea.bitmap.drawText('  効果はいま一つのようだ　(一致率 :  12.00 %)', 2, 64, 556, 32, 'left');
        //this.textarea.bitmap.drawText('効果はいま一つのようだ　(一致率 :  12.00 %)', 0, 96, 560, 32, 'left');
       // this.textarea.bitmap.drawText('効果はいま一つのようだ　(一致率 :  12.00 %)', 0, 128, 560, 32, 'left');
        this.textarea.bitmap.drawText('1 / 4 ', 2, 160, 556, 32, 'right');
    };


    //=============================================================================
    // Class Info
    //=============================================================================
    function Info(scene, code, x, y){
        this.sprite = new Sprite(img_icon[code]);
        scene.addChild(this.sprite);
        this.sprite.move(x, y);
        this.sprite.setAnchor(0.5, 0.5);
        this.text = new Sprite(new Bitmap(72, 32));
        scene.addChild(this.text);
        this.text.bitmap.fontSize = INFO_SIZE ;
        this.text.bitmap.outlineWidth = INFO_OUTLINE_SIZE;
        this.text.bitmap.textColor = INFO_COLOR ;
        this.text.bitmap.outlineColor = INFO_OUTLINE_COLOR;
        switch(code){
            case 'lock':
                this.text.bitmap.drawText('パス強度', 0, 0, 72, 32, 'center');
                break;
            case 'people':
                this.text.bitmap.drawText('接続人数', 0, 0, 72, 32, 'center');
                break;
            case 'time':
                this.text.bitmap.drawText('残り時間', 0, 0, 72, 32, 'center');
                break;
            default:
                break;
        }
        this.text.move(x, y + 26);
        this.text.setAnchor(0.5, 0.5);
    };


    //=============================================================================
    // Class Simplebutton
    //=============================================================================
    function Simplebutton(scene, code, x, y){
        this.icon = new Sprite(img_icon[code]);
        scene.addChild(this.icon);
        this.icon.move(x, y);
        this.icon.setAnchor(0.5, 0.5);
        this.key = new Sprite(img_keys[code]);
        scene.addChild(this.key);
        this.key.move(x - 20, y - 20);
        this.key.setAnchor(0.5, 0.5);
    };


    //=============================================================================
    // Class Button
    //=============================================================================
    function Button(scene, code, x, y){
        this.icon = new Sprite(img_icon[code]);
        scene.addChild(this.icon);
        this.icon.move(x + 1, y + 1);
        this.icon.setAnchor(0.5, 0.5);
        this.frame = new Sprite(img_frame.circle);
        scene.addChild(this.frame);
        this.frame.move(x, y);
        this.frame.setAnchor(0.5, 0.5);
        this.key = new Sprite(img_keys[code]);
        scene.addChild(this.key);
        this.key.move(x - 20, y - 20);
        this.key.setAnchor(0.5, 0.5);
        this.text = new Sprite(new Bitmap(48, 32));
        scene.addChild(this.text);
        this.text.bitmap.fontSize = INFO_SIZE ;
        this.text.bitmap.outlineWidth = INFO_OUTLINE_SIZE;
        this.text.bitmap.textColor = INFO_COLOR ;
        this.text.bitmap.outlineColor = INFO_OUTLINE_COLOR;
        switch(code){
            case 'desc':
                this.text.bitmap.drawText('降順', 0, 0, 48, 32, 'center');
                break;
            case 'asc':
                this.text.bitmap.drawText('昇順', 0, 0, 48, 32, 'center');
                break;
            case 'rank':
                this.text.bitmap.drawText('順位', 0, 0, 48, 32, 'center');
                break;
            default:
                break;
        }
        this.text.move(x, y + 26);
        this.text.setAnchor(0.5, 0.5);
        this.code = code;
        this.count = 0;
    };


    //=============================================================================
    // Class Gauge
    //=============================================================================
    function Gauge(scene, x, y){
        this.meter = new Sprite(new Bitmap(GAUGE_SIZE_X, GAUGE_SIZE_Y));
        scene.addChild(this.meter);
        this.meter.move(x + 5, y);
        this.effect = new Sprite(new Bitmap(GAUGE_SIZE_X, GAUGE_SIZE_Y));
        scene.addChild(this.effect);
        this.effect.bitmap.blt(img_gauge.meter, 0, 0, 27, 144, 0, 16);
        this.effect.move(x + 3, y);
        this.effect.blendMode = 1;
        this.effect.opacity = 0;
        this.frame = new Sprite(img_gauge.frame);
        scene.addChild(this.frame);
        this.frame.move(x, y);
        this.rate = GAUGE_MAX_RATE;
        this.count = 0;
        this.effectcount = 0;
        this.refresh();
    };

    Gauge.prototype.update = function(){
        this.count ++;
        this.meter.opacity = Math.sin(this.count % 240 / 240 * Math.PI * 2) * 32 + 224;
        if(this.count % GAUGE_INTERVAL == 0){
            if(this.rate < GAUGE_MAX_RATE){
                this.rate ++;
                this.refresh();
                if(this.rate >= GAUGE_MAX_RATE){
                    this.effectcount = 48;
                    this.effect.opacity = this.effectcount * 4;
                    return true;
                }
            }
        }
        if(this.effectcount > 0){
            this.effectcount --;
            this.effect.opacity = this.effectcount * 4;
        }
        return false;
    };

    Gauge.prototype.refresh = function(){
        this.meter.bitmap.clear();
        this.meter.bitmap.blt(img_gauge.meter, 0, 0, 27, this.rate, 0, 160 - this.rate);
    };

    Gauge.prototype.isFull = function(){
        if(this.rate >= 144){
            return true;
        } else {
            return false;
        }
    };

    //=============================================================================
    // Class Textbox
    //=============================================================================
    function Textbox(scene, x, y, sx, sy){
        this.sprite = new Sprite(new Bitmap(sx, sy));
        scene.addChild(this.sprite);
        this.sprite.move(x, y);
        this.sprite.blendMode = 1;
        this.sprite.bitmap.fontSize = TEXT_SIZE;
        this.sprite.bitmap.outlineWidth = TEXT_OUTLINE_SIZE;
        this.sprite.bitmap.textColor = TEXT_COLOR;
        this.sprite.bitmap.outlineColor = TEXT_OUTLINE_COLOR;
        this.sprite.bitmap.fontFace = $gameSystem.mainFontFace();
        this.text = '';
        this.index = 0;
        this.refresh()
    };

    Textbox.prototype.clear = function(){
        this.text = '';
        this.index = 0;
        this.refresh();
    };

    Textbox.prototype.refresh = function(){
        var temp = '';
        for(var i = 0; i < TEXT_LENGTH; i ++){
            if(i > 0 && i % 4 == 0){
                temp += ' ';
            }
            if(this.text[i]){
                temp += this.text[i];
            } else {
                temp += '_';
            }
        }
        this.sprite.bitmap.clear();
        this.sprite.bitmap.drawText(temp, 0, 0, this.sprite.bitmap.width, this.sprite.bitmap.height, 'left');
    };

    Textbox.prototype.pushChar = function(keycode){
        if(this.index < TEXT_LENGTH){
            this.text = this.text.substr(0, this.index) + keycode.toUpperCase() + this.text.substr(this.index + 1, TEXT_LENGTH - this.index - 1);
            this.index ++;
            this.refresh();
            return true;
        } else {
            return false;
        }
    };

    Textbox.prototype.popChar = function(){
        if(this.index > 0){
            this.index --;
            this.text = this.text.substr(0, this.index);
            this.refresh();
            return true;
        } else {
            return false;
        }
    };

    Textbox.prototype.isFull = function(){
        if(this.text.length >= TEXT_LENGTH){
            return true;
        } else {
            return false;
        }
    };


    //=============================================================================
    // Class InputManager
    //=============================================================================
    function InputManager(){
        this.state = 'key';
        this.active = true;
        this.count = 0;
    };

    InputManager.prototype.toggleActive = function(){
        if(this.isActive()){
            this.active = false;
        } else {
            this.active = true;
        }
    };

    InputManager.prototype.changeState = function(state){
        this.state = state;
    };

    InputManager.prototype.isActive = function(){
        return this.active;
    };

    InputManager.prototype.getState = function(){
        return this.state;
    };

    InputManager.prototype.getCount = function(){
        return this.count;
    };

    InputManager.prototype.setCount = function(count){
        this.count = count;
    };


    //=============================================================================
    // Class Key
    //=============================================================================
    function Key(scene, code, x, y){
        this.sprite = new Sprite(img_keys[code]);
        scene.addChild(this.sprite);
        this.code = code;
        this.sprite.move(x, y);
        this.sprite.setAnchor(0.5, 0.5);
        this.sprite.setScale(2, 2);
        this.count = 0;
        this.state = 'enable'
    };

    Key.prototype.checkTouch = function(x, y){
        switch(this.code){
            default:
                if(x >= this.sprite.x - KEY_SIZE_X && x < this.sprite.x + KEY_SIZE_X && y >= this.sprite.y - KEY_SIZE_Y && y < this.sprite.y + KEY_SIZE_Y){
                    return true;
                } else {
                    return false;
                }
            case 'shift':
                if(x >= this.sprite.x - KEY_SIZE_SHIFT_X && x < this.sprite.x + KEY_SIZE_SHIFT_X  && y >= this.sprite.y - KEY_SIZE_Y && y < this.sprite.y + KEY_SIZE_Y){
                    return true;
                } else {
                    return false;
                }
            case 'enter':
                if((x >= this.sprite.x - KEY_SIZE_ENTER_X_LONG && x < this.sprite.x + KEY_SIZE_ENTER_X_LONG && y >= this.sprite.y - KEY_SIZE_ENTER_Y && y < this.sprite.y) ||
                (x >= this.sprite.x - KEY_SIZE_ENTER_X_SHORT && x < this.sprite.x + KEY_SIZE_ENTER_X_LONG && y >= this.sprite.y && y < this.sprite.y + KEY_SIZE_ENTER_Y)){
                    return true;
                } else {
                    return false;
                }
        }
    };

    Key.prototype.update = function(){
        switch(this.state){
            case 'enable':
                break;
            case 'disable':
                break;
            case 'pressed':
                this.count ++;
                if(this.count >= 24){
                    this.state = 'enable';
                    this.sprite.setColorTone([0, 0, 0, 0]);
                } else {
                    this.sprite.setColorTone([this.count * 2 - 48, this.count * 4 - 96, 240 - this.count * 10, 0]);
                }
                break;
            default:
                break;
        }
    };

    Key.prototype.press = function(){
        switch(this.state){
            case 'enable':
            case 'pressed':
                this.state = 'pressed';
                this.sprite.setColorTone([-48, -96, 240, 0]);
                this.count = 0;
                break;
            case 'disable':
                break;
            default:
                break;
        }
    };

    Key.prototype.disabled = function(){
        this.state = 'disable';
        this.sprite.setColorTone([-144, -144, -144, 0]);
    };


    Key.prototype.enabled = function(){
        this.state = 'enable';
        this.sprite.setColorTone([0, 0, 0, 0]);
    };


    //=============================================================================
    // Class Keymap
    //=============================================================================
    function Keymap(){
        this.map = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q',
                    'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'backspace', 'enter', 'shift', 'delete'];
    };

    Keymap.prototype.checkTouch = function(){
        var result = "";
        this.map.forEach(keycode => {
            if(Input.isTriggered(keycode)){
                result = keycode;
            }
        })
        return result;
    };


    //=============================================================================
    // Class Board
    //=============================================================================
    function Board(scene, x, y, sx, sy){
        this.sprite = new Sprite(new Bitmap(sx, sy));
        scene.addChild(this.sprite);
        this.sprite.move(x, y);
        this.sprite.bitmap.context.lineWidth = 3;
        this.sprite.bitmap.context.strokeStyle = '#FFFFFF';
        this.sprite.bitmap.context.lineCap = 'round';
        this.effect = new Sprite(new Bitmap(sx, sy));
        this.effect.opacity = 152;
        this.effect.blendMode = 1;
        scene.addChild(this.effect);
        this.effect.move(x, y);
        this.effect.bitmap.context.lineWidth = 7;
        this.effect.bitmap.context.strokeStyle = '#FF7070';
        this.effect.bitmap.context.lineCap = 'round';
        this.clear();
        this.x = 0;
        this.y = 0;
        this.drawing = false;
        this.count = 0;
    };

    Board.prototype.update = function(){
        if(this.isDrawing()){
            if(TouchInput.isPressed()){
                this.draw(TouchInput.x - this.sprite.x, TouchInput.y - this.sprite.y);
                return false;
            } else {
                this.endDrawing();
                return false;
            }
        } else {
            if(TouchInput.isTriggered()){
                this.startDrawing(TouchInput.x - this.sprite.x, TouchInput.y - this.sprite.y);
                return true;
            }
        }
    };

    Board.prototype.clear = function(){
        this.sprite.bitmap.fillAll('#000000');
        for(var i = 0; i < 27; i ++){
            this.sprite.bitmap.fillRect(0, i * 8 + 8, 760, 1, '#002000');
        }
        this.effect.bitmap.fillAll('#000000');
    };

    Board.prototype.draw = function(x, y){
        this.count ++;
        this.sprite.bitmap.context.beginPath();
        this.sprite.bitmap.context.moveTo(this.x, this.y);
        this.sprite.bitmap.context.lineTo(x, y);
        this.sprite.bitmap.context.stroke();
        this.sprite.bitmap._baseTexture.update();
        var cycle = this.count % 330;
        this.effect.bitmap.context.strokeStyle = this.getColor(cycle);
        this.effect.bitmap.context.beginPath();
        this.effect.bitmap.context.moveTo(this.x, this.y);
        this.effect.bitmap.context.lineTo(x, y);
        this.effect.bitmap.context.stroke();
        this.effect.bitmap._baseTexture.update();
        this.x = x;
        this.y = y;
    };

    Board.prototype.getColor = function(cycle){
        var r = 0;
        var g = 0;
        var b = 0;
        switch(Math.floor(cycle / 55)){
            case 0:
            default:
                var r = 110;
                var g = cycle * 2;
                break;
            case 1:
                var r = 110 - (cycle - 55) * 2;
                var g = 110;
                break;
            case 2:
                var g = 110;
                var b = (cycle - 110) * 2;
                break;
            case 3:
                var g = 110 - (cycle - 165) * 2;
                var b = 110
                break;
            case 4:
                var b = 110
                var r = (cycle - 220) * 2;
                break;
            case 5:
                var b = 110 - (cycle - 275) * 2;
                var r = 110;
                break;
        }
        return Utils.rgbToCssColor(145 + r, 145 + g, 145 + b);
    };

    Board.prototype.startDrawing = function(x, y){
        this.x = x;
        this.y = y;
        this.drawing = true;
    };
    
    Board.prototype.endDrawing = function(x, y){
        this.drawing = false;
        this.sprite.bitmap.context.closePath();
        this.effect.bitmap.context.closePath();
    };

    Board.prototype.isDrawing = function(){
        return this.drawing;
    };

    Utils.rgbToCssColor = function(r, g, b) {
        r = Math.round(r);
        g = Math.round(g);
        b = Math.round(b);
        return 'rgb(' + r + ',' + g + ',' + b + ')';
    };

    //=============================================================================
    // Scene_BRUTEFORCE
    //=============================================================================
    function Scene_BRUTEFORCE(){
        this.initialize.apply(this, arguments);
    };

    Scene_BRUTEFORCE.prototype = Object.create(Scene_Base.prototype);
    Scene_BRUTEFORCE.prototype.constructor = Scene_BRUTEFORCE;

    Scene_BRUTEFORCE.prototype.initialize = function(){
        Scene_Base.prototype.initialize.call(this);
    };

    Scene_BRUTEFORCE.prototype.create = function(){
        Scene_Base.prototype.create.call(this);
        this.initRenderer();
        this.createBackground();
        this.createGauge();
        this.createInfo();
        this.createFrame();
        this.createInput();
        this.createTextbox();
        this.createButton();
        this.createLog();
        this.createSimplebutton();
        this.createModal();

        PASSWORD.setSeed(1);
        PASSWORD.setWord(TEXT_LENGTH);
        console.log(PASSWORD.word);
        var t = getServerTime();
        var time = new Date(t).getHours();
        console.log(time);
        this.d = new Sprite(lp('gauge_point'));
        this.addChild(this.d);
        this.d.move(658, 176);
        this.c = new Sprite(img_gauge.log);
        this.addChild(this.c);
        this.c.move(658, 176);

    };

    Scene_BRUTEFORCE.prototype.update = function(){
        Scene_Base.prototype.update.call(this);
        this.updateBackground();
        this.updateInput();
        this.updateGauge();
        this.updateKey();
    };

    Scene_BRUTEFORCE.prototype.initRenderer = function(){
        this.renderer = {
            lower : new Stage(),
            key : new Stage(),
            board: new Stage(),
            middle : new Stage(),
            upper : new Stage(),
            animation : new Stage()
        }
        this.addChild(this.renderer.lower);
        this.addChild(this.renderer.key);
        this.addChild(this.renderer.board);
        this.addChild(this.renderer.middle);
        this.addChild(this.renderer.upper);
        this.addChild(this.renderer.animation);
        this.renderer.board.alpha = 0;
    };

    Scene_BRUTEFORCE.prototype.createBackground = function(){
        this.background = [];
        this.background.push(new Background(this.renderer.lower, img_background.red, 0.4, 0, 60));
        this.background.push(new Background(this.renderer.lower, img_background.green, -0.5, 0, 48));
        this.background.push(new Background(this.renderer.lower, img_background.blue, 0.6, 0, 40));
    };

    Scene_BRUTEFORCE.prototype.createLog = function(){
        this.log = new Log(this.renderer.middle, 62, 128);
    };

    Scene_BRUTEFORCE.prototype.createFrame = function(){
        this.frame = [];
        this.frame.push(new Frame(this.renderer.lower, img_frame.main, 40, 40, 0, 0, 816, 624));
        this.frame.push(new Frame(this.renderer.middle, img_frame.info, 30, 30, 16, 360, 784, 248));
        this.frame.push(new Frame(this.renderer.middle, img_frame.info, 30, 30, 40, 16, 664, 82));
        this.frame.push(new Frame(this.renderer.middle, img_frame.info, 30, 30, 40, 104, 664, 240));
        this.frame.push(new Frame(this.renderer.middle, img_frame.text, 15, 15, 72, 350, 672, 48));
    };

    Scene_BRUTEFORCE.prototype.createModal = function(){
        this.modal = new Modal(this.renderer.upper, MODAL_X, MODAL_Y, 640, 480);
    };

    Scene_BRUTEFORCE.prototype.createInfo = function(){
        this.info = [];
        this.info.push(new Info(this.renderer.middle, 'lock', INFO_LEFT_X, INFO_Y));
        this.info.push(new Info(this.renderer.middle, 'people', INFO_MIDDLE_X, INFO_Y));
        this.info.push(new Info(this.renderer.middle, 'time', INFO_RIGHT_X, INFO_Y));
    };

    Scene_BRUTEFORCE.prototype.createSimplebutton = function(){
        this.Simplebutton = [];
        this.Simplebutton.push(new Simplebutton(this.renderer.middle, 'up', 664, 144));
        this.Simplebutton.push(new Simplebutton(this.renderer.middle, 'down', 664, 304));
    };

    Scene_BRUTEFORCE.prototype.createGauge = function(){
        this.gauge = new Gauge(this.renderer.middle, GAUGE_X, GAUGE_Y);
    };

    Scene_BRUTEFORCE.prototype.createInput = function(){
        this.inputmanager = new InputManager();
        this.keymap = new Keymap();
        this.key = [];
        var char = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'backspace'];
        for(var i = 0; i < 11; i ++){
            this.key.push(new Key(this.renderer.key, char[i], KEY_TOP_X + i * KEY_MARGIN, KEY_TOP_Y));
        }
        var char = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'];
        for(var i = 0; i < 9; i ++){
            this.key.push(new Key(this.renderer.key, char[i], KEY_MIDDLE_X + i * KEY_MARGIN, KEY_MIDDLE_Y));
        }
        var char = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];
        for(var i = 0; i < 7; i ++){
            this.key.push(new Key(this.renderer.key, char[i], KEY_BOTTOM_X + i * KEY_MARGIN, KEY_BOTTOM_Y));
        }
        this.key.push(new Key(this.renderer.key, 'enter', KEY_ENTER_X, KEY_ENTER_Y));
        this.key.push(new Key(this.renderer.upper, 'shift', KEY_BOTTOM_X + 7 * KEY_MARGIN + 34, KEY_BOTTOM_Y));
        this.key[27].disabled();
        this.board = new Board(this.renderer.board, 28, 372, 760, 224);
        this.deletekey = new Key(this.renderer.board, 'delete', KEY_BOTTOM_X + 7 * KEY_MARGIN + 34 + 94, KEY_BOTTOM_Y);
    };

    Scene_BRUTEFORCE.prototype.createTextbox = function(){
        this.textbox = new Textbox(this.renderer.upper, TEXT_X, TEXT_Y, 624, 32);
    };

    Scene_BRUTEFORCE.prototype.createButton = function(){
        this.button = [];
        this.button.push(new Button(this.renderer.middle, 'desc', BUTTON_X, BUTTON_TOP_Y));
        this.button.push(new Button(this.renderer.middle, 'asc', BUTTON_X, BUTTON_MIDDLE_Y ));
        this.button.push(new Button(this.renderer.middle, 'rank', BUTTON_X, BUTTON_BOTTOM_Y));
    };

    Scene_BRUTEFORCE.prototype.updateBackground = function(){
        if(this.background){
            this.background.forEach(index => index.update())
        }
    };

    Scene_BRUTEFORCE.prototype.updateKey = function(){
        if(this.key){
            this.key.forEach(key => key.update());
            if(this.gauge && this.textbox){
                if(this.gauge.isFull() && this.textbox.isFull()){
                    this.key[27].enabled();
                } else {
                    this.key[27].disabled();
                }
            }
        }
        if(this.deletekey){
            this.deletekey.update();
        }
    };

    Scene_BRUTEFORCE.prototype.updateGauge = function(){
        if(this.gauge.update()){
            this.soundCharge();
            ACTION_ENABLED = true;
        }
    };

    Scene_BRUTEFORCE.prototype.updateInput = function(){
        if(this.inputmanager){
            if(this.inputmanager.isActive()){
                switch(this.inputmanager.getState()){
                    case 'key':
                        if(this.key){
                            if(TouchInput.isTriggered()){
                                this.key.forEach(key => {
                                    if(key.checkTouch(TouchInput.x, TouchInput.y)){
                                        this.hitKey_Key(key.code);
                                        key.press();
                                    }
                                });
                            } else {
                                this.keymap.map.forEach(keycode => {
                                    if(keycode != 'delete'){
                                        if(Input.isTriggered(keycode)){
                                            this.hitKey_Key(keycode);
                                            this.key.filter(key => {
                                                if(key.code == keycode){
                                                    key.press();
                                                }
                                            });
                                        }
                                    }
                                })
                            }
                        }
                        break;
                    case 'board':
                        if(this.board){
                            var se_flag = false;
                            if(this.board.update()){
                                se_flag = true;
                            }
                            if(TouchInput.isTriggered()){
                                if(this.key[28]){
                                    if(this.key[28].checkTouch(TouchInput.x, TouchInput.y)){
                                        this.hitKey_Board(this.key[28].code);
                                        this.key[28].press();
                                        se_flag = false;
                                    }
                                }
                                if(this.deletekey.checkTouch(TouchInput.x, TouchInput.y)){
                                    this.hitKey_Board(this.deletekey.code);
                                    this.deletekey.press();
                                    se_flag = false;
                                }
                                if(se_flag){
                                    this.soundDraw();
                                }
                            } else {
                                if(this.key[28]){
                                    if(Input.isTriggered(this.key[28].code)){
                                        this.hitKey_Board(this.key[28].code);
                                        this.key[28].press();
                                    }
                                }
                                if(Input.isTriggered(this.deletekey.code)){
                                    this.hitKey_Board(this.deletekey.code);
                                    this.deletekey.press();
                                }
                            }
                        }
                        break;
                    default:
                        break;
                }
            } else {
                switch(this.inputmanager.getState()){
                    case 'key':
                        if(this.inputmanager.getCount() > 10){
                            this.renderer.board.alpha = 0;
                            this.inputmanager.toggleActive();
                        } else {
                            this.inputmanager.setCount(this.inputmanager.getCount() + 1);
                            this.renderer.board.alpha = (10 - this.inputmanager.getCount()) * 0.1;
                        }
                        break;
                    case 'board':
                        if(this.inputmanager.getCount() > 10){
                            this.renderer.board.alpha = 1;
                            this.inputmanager.toggleActive();
                        } else {
                            this.inputmanager.setCount(this.inputmanager.getCount() + 1);
                            this.renderer.board.alpha = this.inputmanager.getCount() * 0.1;
                        }
                        break;
                    default:
                        break;
                }
            }
        }
    };

    Scene_BRUTEFORCE.prototype.hitKey_Key = function(keycode){
        switch(keycode){
            default:
                this.textbox.pushChar(keycode);
                this.soundType();
                break;
            case 'enter':
                if(this.gauge.isFull() && this.textbox.isFull()){
                    this.gauge.rate = 0;
                    this.soundType();
                    var Match = 1 - (PASSWORD.checkWord(this.textbox.text) / PASSWORD.word.length);
                    console.log(PASSWORD.word);
                    console.log(this.textbox.text);
                    console.log(PASSWORD.word.length);
                    console.log(Match);
                }
                break;
            case 'backspace':
                this.textbox.popChar(keycode);
                this.soundType();
                break;
            case 'shift':
                this.inputmanager.toggleActive();
                this.inputmanager.changeState('board');
                this.inputmanager.setCount(0);
                this.soundType();
                break;
        }
    };

    Scene_BRUTEFORCE.prototype.hitKey_Board = function(keycode){
        this.soundType();
        switch(keycode){
            default:
                break;
            case 'shift':
                this.inputmanager.toggleActive();
                this.inputmanager.changeState('key');
                this.inputmanager.setCount(0);
                break;
            case 'delete':
                this.board.clear();
                break;
        }
    };


    Scene_BRUTEFORCE.prototype.soundCharge = function(){
        AudioManager.playSe({'name':'Heal6', 'volume':30, 'pitch':125, 'pan':0});
    };

    Scene_BRUTEFORCE.prototype.soundType = function(){
        var pitch = 75 + Math.randomInt(50);
        AudioManager.playSe({'name':'se_type', 'volume':70, 'pitch':pitch, 'pan':0});
    };

    Scene_BRUTEFORCE.prototype.soundDraw = function(){
        var pitch = 225 + Math.randomInt(75);
        AudioManager.playSe({'name':'Bow2', 'volume':10, 'pitch':pitch, 'pan':0});
    };

})();
