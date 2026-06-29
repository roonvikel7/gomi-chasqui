// ============================================================
// GOMI-CHASQUI: LA RUTA DEL QHAPAQ ÑAN — Game Engine
// An educational endless runner about the Inca messenger system
// ============================================================

// ---- Assets ----
const ASSETS = {
    alpaca1: { img: new Image(), canvas: null },
    alpaca2: { img: new Image(), canvas: null },
    uncu: { img: new Image() },
    pututu: { img: new Image() },
    chuspa: { img: new Image() },
    qepi: { img: new Image() },
    ullu: { img: new Image() },
    usutas: { img: new Image() }
};
function prepareSVGCanvas(asset) {
    asset.img.onload = () => {
        const c = document.createElement('canvas');
        // Render at a higher resolution to keep it crisp when scaled
        c.width = 160; 
        c.height = 130;
        const ctx = c.getContext('2d');
        ctx.drawImage(asset.img, 0, 0, c.width, c.height);
        asset.canvas = c;
    };
}
ASSETS.alpaca1.img.src = 'assets/alpaca1.svg';
ASSETS.alpaca2.img.src = 'assets/alpaca2.svg';
prepareSVGCanvas(ASSETS.alpaca1);
prepareSVGCanvas(ASSETS.alpaca2);

ASSETS.uncu.img.src = 'assets/uncu.webp';
ASSETS.pututu.img.src = 'assets/pututu.webp';
ASSETS.chuspa.img.src = 'assets/chuspa.webp';
ASSETS.qepi.img.src = 'assets/qepi.webp';
ASSETS.ullu.img.src = 'assets/ullu.webp';
ASSETS.usutas.img.src = 'assets/usutas.webp';

// ---- Configuration ----
const CFG = {
    W: 900,
    H: 500,
    GROUND_Y: 410,
    GRAVITY: 0.62,
    JUMP_FORCE: -13.5,
    INIT_SPEED: 4.5,
    MAX_SPEED: 13,
    SPEED_INC: 0.0007,
    OBS_GAP_MIN: 900,
    OBS_GAP_MAX: 2200,
    QUIPU_GAP_MIN: 1400,
    QUIPU_GAP_MAX: 3200,
    PLAYER_W: 38,
    PLAYER_H: 52,
    DUCK_H: 30,
    HIT_SHRINK: 6,
};

// ---- Andean Color Palette ----
// ---- Color Interpolation Helpers ----
function hexToRgba(hex) {
    if (hex.startsWith('rgba')) {
        const parts = hex.substring(5, hex.length - 1).split(',');
        return [parseFloat(parts[0]), parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3] || 1)];
    }
    if (hex === 'transparent') return [0, 0, 0, 0];
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    return [
        parseInt(h.substring(0, 2), 16),
        parseInt(h.substring(2, 4), 16),
        parseInt(h.substring(4, 6), 16),
        1
    ];
}

function interpolateColor(c1, c2, factor) {
    const rgb1 = hexToRgba(c1);
    const rgb2 = hexToRgba(c2);
    const r = Math.round(rgb1[0] + (rgb2[0] - rgb1[0]) * factor);
    const g = Math.round(rgb1[1] + (rgb2[1] - rgb1[1]) * factor);
    const b = Math.round(rgb1[2] + (rgb2[2] - rgb1[2]) * factor);
    const a = rgb1[3] + (rgb2[3] - rgb1[3]) * factor;
    return `rgba(${r},${g},${b},${a.toFixed(3)})`;
}

// ---- Day Cycles ----
const DAY_CYCLES = [
    { // Dawn
        skyTop: '#1a1025', skyMid: '#e05953', skyBot: '#f3b866', horizon: '#ffe8a1', sunGlow: '#ff914d',
        starColor: 'rgba(255, 238, 221, 0.2)', mtFar: '#4a3045', mtMid: '#6a3c42', mtNear: '#554238',
        mtSnow: 'rgba(255,200,200,0.6)', groundTop: '#6b6338', groundMid: '#5c542b', groundBot: '#4c4220',
        pathStone: '#b5a38a', pathLine: '#7c6d59', cloudColor: 'rgba(255,200,200,0.5)'
    },
    { // Noon (Current)
        skyTop: '#4a90e2', skyMid: '#7bb1ea', skyBot: '#b8d8ea', horizon: '#eef4e8', sunGlow: '#ffd54f',
        starColor: 'rgba(255, 238, 221, 0)', mtFar: '#789ca4', mtMid: '#718f4a', mtNear: '#5c7b3b',
        mtSnow: 'rgba(255,255,255,0.8)', groundTop: '#8da336', groundMid: '#7b8e2b', groundBot: '#5c6b20',
        pathStone: '#d3c8b4', pathLine: '#9e9484', cloudColor: 'rgba(255,255,255,0.4)'
    },
    { // Dusk
        skyTop: '#2b1b3d', skyMid: '#712d4a', skyBot: '#d85d45', horizon: '#f49f50', sunGlow: '#ff6600',
        starColor: 'rgba(255, 238, 221, 0.4)', mtFar: '#33273e', mtMid: '#3c2430', mtNear: '#302622',
        mtSnow: 'rgba(255,180,180,0.5)', groundTop: '#4c4f26', groundMid: '#3c401e', groundBot: '#2e3015',
        pathStone: '#937a6b', pathLine: '#5c493e', cloudColor: 'rgba(255,150,150,0.5)'
    },
    { // Night
        skyTop: '#070b1e', skyMid: '#14123a', skyBot: '#3a1850', horizon: '#c85a30', sunGlow: '#000000',
        starColor: 'rgba(255, 238, 221, 1)', mtFar: '#110820', mtMid: '#1e0e35', mtNear: '#2d1650',
        mtSnow: 'rgba(255,255,255,0.25)', groundTop: '#2a351d', groundMid: '#202a14', groundBot: '#151e0c',
        pathStone: '#504c45', pathLine: '#3a342e', cloudColor: 'rgba(255,255,255,0.1)'
    }
];

// ---- Andean Color Palette ----
let PAL = {
    ...DAY_CYCLES[1],
    playerBody: '#ff6e3a',
    playerHi: '#ff9e6a',
    playerSh: '#c04020',
    playerHat1: '#d62828',
    playerHat2: '#f7b32b',
    playerHat3: '#2d9e5c',
    playerBag: '#8b5e3c',
    quipuColors: ['#e74c3c', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6', '#e67e22'],
    rockBase: '#6a6a6a',
    rockHi: '#8a8a8a',
    rockSh: '#4a4a4a',
    rockMoss: '#3d7a3d',
    llamaBody: '#f5e6d3',
    llamaHi: '#fff3e8',
    llamaSh: '#c4a882',
    llamaSpot: '#d4a87a',
    gold: '#ffd700',
};

// ---- Trivia System (Facts + Questions) ----
const TRIVIA = [
    { fact: "\"Qhapaq Ñan\" se traduce del quechua como el \"Camino Principal\" o \"Camino Real\" de los incas.", q: "¿Qué significa \"Qhapaq Ñan\" en quechua?", opts: ["Camino del Rey", "Camino Principal", "Camino de Piedra", "Camino del Sol"], correct: 1 },
    { fact: "La gigantesca red vial incaica conectaba territorios de seis países sudamericanos actuales, desde Colombia hasta Argentina.", q: "¿Cuántos países actuales atravesaba el Qhapaq Ñan?", opts: ["Solo Perú", "Dos (Perú y Bolivia)", "Seis países", "Toda Sudamérica"], correct: 2 },
    { fact: "El Qhapaq Ñan no era para uso común; servía estrictamente para la integración, el control militar y la comunicación del Imperio.", q: "¿Cuál era la función central de esta red?", opts: ["Fomentar el turismo", "Control y comunicación", "Competencias físicas", "Rutas comerciales libres"], correct: 1 },
    { fact: "Los incas construyeron \"tambos\" a lo largo de los caminos para que sirvieran como posadas y almacenes de provisiones.", q: "¿Qué eran los \"tambos\"?", opts: ["Templos de adoración", "Posadas y almacenes", "Fortalezas militares", "Torres de vigilancia"], correct: 1 },
    { fact: "La llama fue el animal de carga indispensable para transportar bienes a través de la accidentada geografía andina.", q: "¿Qué animal de carga se usaba en esta red?", opts: ["El caballo", "La llama", "El guanaco", "El perro sin pelo"], correct: 1 },
    { fact: "Debido a su valor histórico y monumental ingeniería, la UNESCO declaró al Qhapaq Ñan como Patrimonio Mundial en 2014.", q: "¿Quién declaró al Qhapaq Ñan Patrimonio Mundial?", opts: ["La ONU", "El Gobierno Peruano", "La UNESCO", "La OEA"], correct: 2 },
    { fact: "La ciudad del Cusco era considerada el \"ombligo del mundo\", el punto cero desde donde partían todos los caminos principales.", q: "¿Desde qué ciudad partían todos los caminos?", opts: ["Machu Picchu", "Cusco", "Quito", "Pachacamac"], correct: 1 },
    { fact: "Para sortear ríos caudalosos, la ingeniería inca diseñó inmensos puentes colgantes tejidos enteramente con fibra vegetal (ichu).", q: "¿De qué estaban hechos los puentes colgantes?", opts: ["Madera gruesa", "Piedra tallada", "Fibra vegetal (ichu)", "Cuero de alpaca"], correct: 2 },
    { fact: "La red vial era tan extensa que atravesaba climas extremos: la árida costa, la alta cordillera y la tupida ceja de selva.", q: "¿Qué ecosistemas abarcaba el camino?", opts: ["Exclusivamente desiertos", "Costa, sierra y selva", "Solo altas montañas", "Valles templados"], correct: 1 },
    { fact: "El puente colgante Q'eswachaka, en Cusco, es el último de su tipo y se renueva anualmente usando técnicas ancestrales.", q: "¿Cómo se llama el famoso puente inca renovado hoy en día?", opts: ["Q'eswachaka", "Rumichaca", "Huacachina", "Tarabita"], correct: 0 },
    { fact: "Los chasquis eran veloces corredores oficiales y mensajeros de élite al servicio exclusivo del Estado Inca.", q: "¿Quiénes eran exactamente los chasquis?", opts: ["Guerreros armados", "Sacerdotes andinos", "Mensajeros oficiales", "Campesinos"], correct: 2 },
    { fact: "El chasqui hacía sonar un \"pututu\" (una gran caracola marina) para avisar al siguiente mensajero que estuviera listo.", q: "¿Qué tocaba el chasqui para anunciar su llegada?", opts: ["Un pequeño tambor", "Un pututu (caracola)", "Una flauta o quena", "Una zampoña"], correct: 1 },
    { fact: "Por su altísima exigencia física y mental, los futuros chasquis eran seleccionados y entrenados rigurosamente desde su niñez.", q: "¿A qué edad comenzaba el entrenamiento del chasqui?", opts: ["En la niñez", "A los 15 años", "A los 18 años", "En la adultez"], correct: 0 },
    { fact: "Los chasquihuasis eran pequeños refugios ubicados junto a los caminos donde los mensajeros esperaban su turno y descansaban.", q: "¿Dónde descansaban y hacían los relevos?", opts: ["En las huacas", "En los chasquihuasis", "En las llactas", "Al aire libre"], correct: 1 },
    { fact: "Para no olvidar ni alterar la información contable y censal, los chasquis transportaban cuidadosamente los valiosos quipus.", q: "¿Qué objeto llevaban para la contabilidad oficial?", opts: ["Papiros andinos", "Quipus", "Piedras pintadas", "Tablillas de arcilla"], correct: 1 },
    { fact: "Durante sus largas y solitarias travesías por los Andes, los chasquis solían portar una honda o \"huaraca\" como arma defensiva.", q: "¿Qué arma de defensa solían portar?", opts: ["Arco y flecha", "Honda (huaraca)", "Espada de bronce", "Lanza de madera"], correct: 1 },
    { fact: "Un chasqui corría a máxima velocidad tramos cortos, de entre 10 a 15 kilómetros, antes de entregar el mensaje al siguiente relevo.", q: "¿Qué distancia corría un chasqui antes del relevo?", opts: ["1 a 2 kilómetros", "10 a 15 kilómetros", "50 kilómetros", "100 kilómetros"], correct: 1 },
    { fact: "Los mensajes narrativos se transmitían de forma estrictamente oral, por lo que los chasquis debían tener una memoria prodigiosa.", q: "¿Cómo transmitían los mensajes largos?", opts: ["Escritos en pergaminos", "Oralmente (memoria)", "Por señales de humo", "Con dibujos en telas"], correct: 1 },
    { fact: "Gracias al veloz sistema de relevos, el Inca en el Cusco podía comer pescado fresco traído en menos de dos días desde la costa.", q: "¿Qué producto fresco llevaban de la costa al Cusco?", opts: ["Algodón pima", "Pescado fresco", "Aceitunas", "Maíz morado"], correct: 1 },
    { fact: "El término quechua \"Chasqui\" se traduce como \"el que recibe y da\", reflejando su labor ininterrumpida de entrega.", q: "¿Qué significa \"Chasqui\" en quechua?", opts: ["Corredor veloz", "El que recibe y da", "Hombre resistente", "Caminante eterno"], correct: 1 },
    { fact: "Los quipus no usaban escritura; eran sistemas tridimensionales de registro conformados por cuerdas de diferentes grosores y colores.", q: "¿Qué es físicamente un quipu?", opts: ["Una tela pintada", "Cuerdas anudadas", "Un arma de caza", "Un adorno de cuello"], correct: 1 },
    { fact: "El \"Quipucamayoc\" era el funcionario estatal altamente capacitado para fabricar, leer y custodiar los quipus.", q: "¿Quién elaboraba y leía los quipus?", opts: ["El Amauta", "El Quipucamayoc", "El Curaca", "El Mitimae"], correct: 1 },
    { fact: "Los quipus utilizaban un estricto sistema aritmético decimal, es decir, agrupaban las cantidades en base 10.", q: "¿Qué base numérica usaban los quipus?", opts: ["Base binaria", "Base hexadecimal", "Base 10 (decimal)", "Base vigesimal"], correct: 2 },
    { fact: "En un quipu, el valor numérico exacto se determinaba por la altura del nudo en la cuerda y el tipo específico de nudo realizado.", q: "¿Qué indicaba el valor del número (1, 10, 100)?", opts: ["El color de la cuerda", "Posición y tipo de nudo", "El largo del hilo", "El grosor de la cuerda"], correct: 1 },
    { fact: "Además de la contabilidad de recursos, los quipus también funcionaban como un archivo para almacenar historias y genealogías.", q: "¿Qué otra función cumplían los quipus?", opts: ["Ser dinero andino", "Adorno para el Inca", "Registro histórico", "Mapa de estrellas"], correct: 2 },
    { fact: "Los incas conocían y aplicaban el concepto matemático del cero, representándolo de forma sencilla: dejando un espacio sin nudos.", q: "¿Qué significaba un espacio sin nudo en la cuerda?", opts: ["Un error al hilar", "El número cero", "Fin de un mensaje", "Una deuda impaga"], correct: 1 },
    { fact: "Para la elaboración de los quipus se empleaban principalmente resistentes hilos de algodón y lanas de camélidos.", q: "¿De qué materiales se hacían los quipus?", opts: ["Hilos de oro y plata", "Algodón y lana", "Cuero de puma", "Fibras de totora"], correct: 1 },
    { fact: "Anatómicamente, todo quipu se estructura a partir de una gruesa \"cuerda principal\" horizontal de la cual cuelgan todas las demás.", q: "¿Cómo se llama la cuerda gruesa superior?", opts: ["Cuerda principal", "Cuerda guía", "Cuerda colgante", "Cuerda base"], correct: 0 },
    { fact: "La dirección en la que se torcía el hilo al fabricarlo (hacia la derecha o hacia la izquierda) también guardaba información oculta.", q: "¿Qué detalle del hilado guardaba información extra?", opts: ["El peso de la cuerda", "La dirección de la torsión", "La humedad de la lana", "La aspereza del nudo"], correct: 1 },
    { fact: "En el santuario de Pachacamac, en la costa central peruana, los arqueólogos hallaron uno de los mayores archivos de quipus del Imperio.", q: "¿Dónde se halló una gran colección de quipus?", opts: ["En Chan Chan", "En Pachacamac", "En Caral", "En Huaca de la Luna"], correct: 1 }
];

// ---- Sound System (Web Audio API) ----
class SoundFX {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }
    init() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            this.enabled = false;
        }
    }
    play(type) {
        if (!this.enabled || !this.ctx) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);

            if (type === 'jump') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(320, now);
                osc.frequency.exponentialRampToValueAtTime(580, now + 0.12);
                gain.gain.setValueAtTime(0.12, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
                osc.start(now);
                osc.stop(now + 0.18);
            } else if (type === 'collect') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);
                osc.frequency.exponentialRampToValueAtTime(900, now + 0.15);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
            } else if (type === 'hit') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.exponentialRampToValueAtTime(60, now + 0.3);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
                osc.start(now);
                osc.stop(now + 0.35);
            } else if (type === 'revive') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
                osc.frequency.exponentialRampToValueAtTime(1000, now + 0.2);
                osc.frequency.exponentialRampToValueAtTime(1200, now + 0.3);
                gain.gain.setValueAtTime(0.12, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
                osc.start(now);
                osc.stop(now + 0.35);
            }
        } catch (e) { /* silent fail */ }
    }
}

// ---- Utility ----
function rand(min, max) { return Math.random() * (max - min) + min; }
function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
function lerp(a, b, t) { return a + (b - a) * t; }

// ---- Stars ----
function createStars(count) {
    const stars = [];
    for (let i = 0; i < count; i++) {
        stars.push({
            x: Math.random() * CFG.W,
            y: Math.random() * (CFG.H * 0.5),
            r: rand(0.4, 1.6),
            twinkleSpeed: rand(0.01, 0.04),
            twinkleOffset: Math.random() * Math.PI * 2,
            brightness: rand(0.3, 1),
        });
    }
    return stars;
}

// ---- Clouds ----
function createClouds(count) {
    const clouds = [];
    for (let i = 0; i < count; i++) {
        clouds.push({
            x: rand(-100, CFG.W + 100),
            y: rand(30, 180),
            w: rand(80, 200),
            h: rand(20, 45),
            speed: rand(0.15, 0.5),
            opacity: rand(0.03, 0.08),
        });
    }
    return clouds;
}

// ---- Mountain Generation ----
function generateMountainLayer(yBase, heightMin, heightMax, segments) {
    const pts = [];
    const segW = CFG.W / segments;
    for (let i = 0; i <= segments + 2; i++) {
        pts.push({
            x: (i - 1) * segW,
            y: yBase - rand(heightMin, heightMax),
        });
    }
    return pts;
}

// ---- Drawing Helpers ----
function drawRoundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

// ---- DRAW: Gummy Chasqui ----
function drawChasqui(ctx, x, y, w, h, frame, isJumping, isDucking) {
    ctx.save();
    const cx = x + w / 2;

    // Running animation offsets
    const runCycle = Math.sin(frame * 0.35);
    const armSwing = Math.sin(frame * 0.35) * 8;
    const legSwing = Math.sin(frame * 0.35) * 7;
    const bounce = isJumping ? 0 : Math.abs(Math.sin(frame * 0.35)) * 2;

    const bodyH = isDucking ? h * 0.5 : h * 0.55;
    const bodyW = isDucking ? w * 1.1 : w * 0.75;
    const bodyY = y + h - bodyH - (isDucking ? 0 : 2) + bounce;
    const bodyX = cx - bodyW / 2;

    // --- Shadow on ground ---
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(cx, CFG.GROUND_Y + 2, w * 0.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // --- Legs ---
    if (!isDucking) {
        const legW = 7, legH = 14;
        const legY = bodyY + bodyH - 4;
        ctx.fillStyle = PAL.playerSh;
        // Left leg
        ctx.save();
        ctx.translate(cx - 7, legY);
        ctx.rotate((isJumping ? -0.3 : legSwing * 0.05));
        drawRoundRect(ctx, -legW / 2, 0, legW, legH, 3);
        ctx.fill();
        ctx.restore();
        // Right leg
        ctx.save();
        ctx.translate(cx + 7, legY);
        ctx.rotate((isJumping ? 0.3 : -legSwing * 0.05));
        drawRoundRect(ctx, -legW / 2, 0, legW, legH, 3);
        ctx.fill();
        ctx.restore();
    }

    // --- Body (gummy effect) ---
    const bodyGrad = ctx.createRadialGradient(bodyX + bodyW * 0.35, bodyY + bodyH * 0.3, bodyW * 0.1,
        bodyX + bodyW * 0.5, bodyY + bodyH * 0.5, bodyW * 0.7);
    bodyGrad.addColorStop(0, PAL.playerHi);
    bodyGrad.addColorStop(0.6, PAL.playerBody);
    bodyGrad.addColorStop(1, PAL.playerSh);
    ctx.fillStyle = bodyGrad;
    drawRoundRect(ctx, bodyX, bodyY, bodyW, bodyH, isDucking ? 10 : 12);
    ctx.fill();

    // Gummy shine
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.beginPath();
    ctx.ellipse(bodyX + bodyW * 0.35, bodyY + bodyH * 0.3, bodyW * 0.2, bodyH * 0.2, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Poncho stripes
    const stripeY = bodyY + bodyH * 0.3;
    const stripeH = 3;
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = PAL.playerHat2;
    drawRoundRect(ctx, bodyX + 3, stripeY, bodyW - 6, stripeH, 1);
    ctx.fill();
    ctx.fillStyle = PAL.playerHat3;
    drawRoundRect(ctx, bodyX + 3, stripeY + stripeH + 2, bodyW - 6, stripeH, 1);
    ctx.fill();
    ctx.fillStyle = PAL.playerHat1;
    drawRoundRect(ctx, bodyX + 3, stripeY + (stripeH + 2) * 2, bodyW - 6, stripeH, 1);
    ctx.fill();
    ctx.globalAlpha = 1;

    // --- Arms ---
    if (!isDucking) {
        ctx.strokeStyle = PAL.playerBody;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        // Left arm
        ctx.beginPath();
        ctx.moveTo(bodyX + 2, bodyY + bodyH * 0.35);
        ctx.lineTo(bodyX - 6 + (isJumping ? -3 : armSwing * 0.5), bodyY + bodyH * 0.55 + (isJumping ? -8 : 0));
        ctx.stroke();
        // Right arm
        ctx.beginPath();
        ctx.moveTo(bodyX + bodyW - 2, bodyY + bodyH * 0.35);
        ctx.lineTo(bodyX + bodyW + 6 + (isJumping ? 3 : -armSwing * 0.5), bodyY + bodyH * 0.55 + (isJumping ? -8 : 0));
        ctx.stroke();
    }

    // --- Messenger Bag (chuspa) ---
    if (!isDucking) {
        ctx.fillStyle = PAL.playerBag;
        const bagW = 10, bagH = 12;
        drawRoundRect(ctx, bodyX + bodyW - 4, bodyY + bodyH * 0.25, bagW, bagH, 3);
        ctx.fill();
        ctx.strokeStyle = '#6e4428';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bodyX + bodyW - 4 + bagW / 2, bodyY + bodyH * 0.25);
        ctx.lineTo(bodyX + bodyW * 0.5, bodyY + 2);
        ctx.stroke();
    }

    // --- Head ---
    const headR = isDucking ? 10 : 12;
    const headY = isDucking ? bodyY + bodyH * 0.3 : bodyY - headR * 0.7;
    const headX = cx;

    const headGrad = ctx.createRadialGradient(headX - 3, headY - 3, 2, headX, headY, headR);
    headGrad.addColorStop(0, PAL.playerHi);
    headGrad.addColorStop(0.6, PAL.playerBody);
    headGrad.addColorStop(1, PAL.playerSh);
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.arc(headX, headY, headR, 0, Math.PI * 2);
    ctx.fill();

    // Head shine
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.ellipse(headX - 3, headY - 4, 4, 3, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // --- Chullo Hat ---
    const hatY = headY - headR - 2;
    const hatW = headR * 2.2;
    const hatH = headR * 1.1;

    // Main hat body
    ctx.fillStyle = PAL.playerHat1;
    ctx.beginPath();
    ctx.moveTo(headX - hatW / 2, headY - headR * 0.3);
    ctx.quadraticCurveTo(headX - hatW / 2 - 2, hatY + hatH * 0.4, headX - hatW * 0.3, hatY);
    ctx.quadraticCurveTo(headX, hatY - hatH * 0.3, headX + hatW * 0.3, hatY);
    ctx.quadraticCurveTo(headX + hatW / 2 + 2, hatY + hatH * 0.4, headX + hatW / 2, headY - headR * 0.3);
    ctx.closePath();
    ctx.fill();

    // Hat stripes
    ctx.fillStyle = PAL.playerHat2;
    ctx.fillRect(headX - hatW / 2 + 2, hatY + hatH * 0.25, hatW - 4, 3);
    ctx.fillStyle = PAL.playerHat3;
    ctx.fillRect(headX - hatW / 2 + 2, hatY + hatH * 0.5, hatW - 4, 3);

    // Ear flaps
    ctx.fillStyle = PAL.playerHat1;
    // Left flap
    ctx.beginPath();
    ctx.moveTo(headX - hatW / 2, headY - headR * 0.3);
    ctx.lineTo(headX - hatW / 2 - 4, headY + headR * 0.7);
    ctx.lineTo(headX - hatW / 2 + 5, headY + headR * 0.3);
    ctx.closePath();
    ctx.fill();
    // Right flap
    ctx.beginPath();
    ctx.moveTo(headX + hatW / 2, headY - headR * 0.3);
    ctx.lineTo(headX + hatW / 2 + 4, headY + headR * 0.7);
    ctx.lineTo(headX + hatW / 2 - 5, headY + headR * 0.3);
    ctx.closePath();
    ctx.fill();

    // Pom-pom
    ctx.fillStyle = PAL.playerHat2;
    ctx.beginPath();
    ctx.arc(headX, hatY - hatH * 0.2, 4, 0, Math.PI * 2);
    ctx.fill();

    // --- Face ---
    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(headX - 4, headY - 1, 3.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(headX + 4, headY - 1, 3.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pupils (look forward)
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.arc(headX - 3, headY - 0.5, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(headX + 5, headY - 0.5, 2, 0, Math.PI * 2);
    ctx.fill();

    // Eye shine
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(headX - 3.5, headY - 2, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(headX + 4.5, headY - 2, 1, 0, Math.PI * 2);
    ctx.fill();

    // Mouth
    ctx.strokeStyle = '#8b3a1a';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    if (isJumping) {
        // Excited open mouth
        ctx.arc(headX + 1, headY + 4, 3, 0, Math.PI);
    } else {
        // Happy smile
        ctx.arc(headX + 1, headY + 3, 3.5, 0.1, Math.PI - 0.1);
    }
    ctx.stroke();

    // Cheek blush
    ctx.fillStyle = 'rgba(255,100,100,0.25)';
    ctx.beginPath();
    ctx.ellipse(headX - 8, headY + 2, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(headX + 10, headY + 2, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

// ---- DRAW: Rock Obstacle ----
function drawRock(ctx, x, y, w, h) {
    ctx.save();
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h + 2, w * 0.55, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Main rock shape
    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, PAL.rockHi);
    grad.addColorStop(0.5, PAL.rockBase);
    grad.addColorStop(1, PAL.rockSh);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.1, y + h);
    ctx.lineTo(x, y + h * 0.5);
    ctx.quadraticCurveTo(x + w * 0.1, y - h * 0.05, x + w * 0.35, y);
    ctx.quadraticCurveTo(x + w * 0.5, y - h * 0.08, x + w * 0.7, y + h * 0.05);
    ctx.quadraticCurveTo(x + w * 1.05, y + h * 0.15, x + w, y + h * 0.55);
    ctx.lineTo(x + w * 0.9, y + h);
    ctx.closePath();
    ctx.fill();

    // Rock highlight
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath();
    ctx.ellipse(x + w * 0.35, y + h * 0.3, w * 0.18, h * 0.2, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Moss patches
    ctx.fillStyle = PAL.rockMoss;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(x + w * 0.25, y + h * 0.15, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + w * 0.65, y + h * 0.25, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Crack lines
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.4, y + h * 0.1);
    ctx.lineTo(x + w * 0.45, y + h * 0.4);
    ctx.lineTo(x + w * 0.55, y + h * 0.55);
    ctx.stroke();

    ctx.restore();
}

// ---- DRAW: Llama Obstacle ----
function drawLlama(ctx, x, y, w, h, frame) {
    ctx.save();
    const walkCycle = Math.sin(frame * 0.15) * 3;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h + 2, w * 0.45, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    ctx.fillStyle = PAL.llamaSh;
    const legW = 5, legH = h * 0.35;
    const legY = y + h - legH;
    // Back legs
    ctx.save();
    ctx.translate(x + w * 0.2, legY);
    ctx.rotate(walkCycle * 0.03);
    ctx.fillRect(-legW / 2, 0, legW, legH);
    ctx.restore();
    ctx.save();
    ctx.translate(x + w * 0.35, legY);
    ctx.rotate(-walkCycle * 0.03);
    ctx.fillRect(-legW / 2, 0, legW, legH);
    ctx.restore();
    // Front legs
    ctx.save();
    ctx.translate(x + w * 0.6, legY);
    ctx.rotate(-walkCycle * 0.03);
    ctx.fillRect(-legW / 2, 0, legW, legH);
    ctx.restore();
    ctx.save();
    ctx.translate(x + w * 0.75, legY);
    ctx.rotate(walkCycle * 0.03);
    ctx.fillRect(-legW / 2, 0, legW, legH);
    ctx.restore();

    // Body
    const bodyGrad = ctx.createRadialGradient(
        x + w * 0.4, y + h * 0.35, w * 0.1,
        x + w * 0.45, y + h * 0.4, w * 0.4
    );
    bodyGrad.addColorStop(0, PAL.llamaHi);
    bodyGrad.addColorStop(0.7, PAL.llamaBody);
    bodyGrad.addColorStop(1, PAL.llamaSh);
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(x + w * 0.45, y + h * 0.5, w * 0.38, h * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Candy spots
    ctx.fillStyle = PAL.llamaSpot;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(x + w * 0.35, y + h * 0.45, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + w * 0.55, y + h * 0.48, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Body shine
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.ellipse(x + w * 0.38, y + h * 0.38, w * 0.12, h * 0.1, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Neck
    ctx.fillStyle = PAL.llamaBody;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.65, y + h * 0.45);
    ctx.quadraticCurveTo(x + w * 0.75, y + h * 0.2, x + w * 0.78, y + h * 0.08);
    ctx.lineTo(x + w * 0.88, y + h * 0.1);
    ctx.quadraticCurveTo(x + w * 0.85, y + h * 0.25, x + w * 0.78, y + h * 0.48);
    ctx.closePath();
    ctx.fill();

    // Head
    const headCx = x + w * 0.83;
    const headCy = y + h * 0.08;
    ctx.fillStyle = PAL.llamaBody;
    ctx.beginPath();
    ctx.ellipse(headCx, headCy, 9, 7, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.fillStyle = PAL.llamaSpot;
    ctx.beginPath();
    ctx.ellipse(headCx - 5, headCy - 9, 2.5, 5, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(headCx + 3, headCy - 9, 2.5, 5, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.arc(headCx + 4, headCy - 1, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(headCx + 4.5, headCy - 2, 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Cute nose
    ctx.fillStyle = '#d4a07a';
    ctx.beginPath();
    ctx.ellipse(headCx + 9, headCy + 1, 2, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tail
    ctx.strokeStyle = PAL.llamaSh;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x + w * 0.12, y + h * 0.4);
    ctx.quadraticCurveTo(x + w * 0.05, y + h * 0.25 + walkCycle, x + w * 0.08, y + h * 0.2 + walkCycle);
    ctx.stroke();

    ctx.restore();
}

// ---- DRAW: Condor Obstacle ----
function drawCondor(ctx, x, y, w, h, frame) {
    ctx.save();
    
    // Flying animation bob
    const bob = Math.sin(frame * 0.1) * 3;
    const cy = y + h / 2 + bob;
    const cx = x + w / 2;
    
    // Wing flap
    const flap = Math.sin(frame * 0.25) * 12;

    ctx.fillStyle = '#2c2c2c'; // dark grey/black
    
    // Left wing
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy);
    ctx.quadraticCurveTo(cx - 15, cy - 10 + flap, cx - 30, cy - 15 + flap * 1.5);
    ctx.lineTo(cx - 20, cy + 5);
    ctx.fill();
    
    // Right wing
    ctx.beginPath();
    ctx.moveTo(cx + 10, cy);
    ctx.quadraticCurveTo(cx + 15, cy - 10 + flap, cx + 30, cy - 15 + flap * 1.5);
    ctx.lineTo(cx + 20, cy + 5);
    ctx.fill();

    // Body
    ctx.beginPath();
    ctx.ellipse(cx, cy, 14, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // White neck ring
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(cx - 12, cy - 2, 4, 6, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#9e3d3d'; // reddish head
    ctx.beginPath();
    ctx.ellipse(cx - 16, cy - 3, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Beak
    ctx.fillStyle = '#d4a07a';
    ctx.beginPath();
    ctx.moveTo(cx - 20, cy - 4);
    ctx.lineTo(cx - 26, cy - 2);
    ctx.lineTo(cx - 20, cy - 1);
    ctx.fill();
    
    // Eye
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(cx - 17, cy - 4, 1, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

// ---- DRAW: Quipu Collectible ----
function drawQuipu(ctx, x, y, w, h, frame) {
    ctx.save();

    // Glow pulse
    const glowPulse = 0.3 + Math.sin(frame * 0.08) * 0.15;
    ctx.shadowColor = PAL.gold;
    ctx.shadowBlur = 12 * glowPulse + 4;

    // Main horizontal cord
    ctx.strokeStyle = '#8b5e3c';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Hanging cords with knots
    const cordCount = 5;
    const cordSpacing = w / (cordCount + 1);
    for (let i = 0; i < cordCount; i++) {
        const cx = x + cordSpacing * (i + 1);
        const color = PAL.quipuColors[i % PAL.quipuColors.length];
        const cordLen = h * 0.5 + Math.sin(frame * 0.06 + i) * 4;
        const sway = Math.sin(frame * 0.04 + i * 1.2) * 2;

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, y + 2);
        ctx.quadraticCurveTo(cx + sway, y + cordLen * 0.5, cx + sway * 0.5, y + cordLen);
        ctx.stroke();

        // Knots (small circles)
        const knotCount = randInt(1, 2);
        ctx.fillStyle = color;
        for (let k = 0; k < knotCount; k++) {
            const knotY = y + cordLen * (0.3 + k * 0.35);
            ctx.beginPath();
            ctx.arc(cx + sway * ((knotY - y) / cordLen), knotY, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Sparkle effect
    ctx.fillStyle = PAL.gold;
    ctx.globalAlpha = glowPulse;
    for (let i = 0; i < 3; i++) {
        const sx = x + Math.sin(frame * 0.05 + i * 2.1) * w * 0.5 + w / 2;
        const sy = y + Math.cos(frame * 0.07 + i * 1.7) * h * 0.3 + h * 0.3;
        const sr = 1 + Math.sin(frame * 0.1 + i) * 0.5;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.restore();
}

// ---- Particle System ----
class Particle {
    constructor(x, y, color, type) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.type = type; // 'sparkle', 'dust', 'trail'
        this.life = 1;
        this.maxLife = 1;

        if (type === 'sparkle') {
            this.vx = rand(-3, 3);
            this.vy = rand(-4, -1);
            this.size = rand(2, 5);
            this.decay = rand(0.02, 0.04);
            this.gravity = 0.08;
        } else if (type === 'dust') {
            this.vx = rand(-1, 0.5);
            this.vy = rand(-1.5, -0.5);
            this.size = rand(2, 4);
            this.decay = rand(0.015, 0.03);
            this.gravity = 0;
        } else if (type === 'trail') {
            this.vx = rand(-0.5, 0.5);
            this.vy = rand(-0.5, 0.5);
            this.size = rand(1.5, 3);
            this.decay = rand(0.03, 0.05);
            this.gravity = 0;
        }
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.life -= this.decay;
        this.size *= 0.98;
    }
    draw(ctx) {
        if (this.life <= 0) return;
        ctx.save();
        ctx.globalAlpha = this.life * 0.8;
        ctx.fillStyle = this.color;
        if (this.type === 'sparkle') {
            // Star shape
            ctx.beginPath();
            for (let i = 0; i < 4; i++) {
                const angle = (i / 4) * Math.PI * 2 - Math.PI / 4;
                const len = this.size;
                ctx.lineTo(this.x + Math.cos(angle) * len, this.y + Math.sin(angle) * len);
                const innerAngle = angle + Math.PI / 4;
                ctx.lineTo(this.x + Math.cos(innerAngle) * len * 0.4, this.y + Math.sin(innerAngle) * len * 0.4);
            }
            ctx.closePath();
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, Math.max(0, this.size), 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
    get alive() { return this.life > 0 && this.size > 0.2; }
}

// ============================================================
// MAIN GAME CLASS
// ============================================================
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = CFG.W;
        this.canvas.height = CFG.H;

        this.sfx = new SoundFX();
        this.state = 'menu'; // 'menu', 'playing', 'gameover', 'quiz'
        this.frame = 0;
        this.score = 0;
        this.distance = 0;
        this.quipusCollected = 0;
        this.highScore = parseInt(localStorage.getItem('gomiChasqui_highScore') || '0');
        this.speed = CFG.INIT_SPEED;

        // Quiz / extra lives system
        this.extraLives = 3;
        this.usedQuestions = [];
        this.invincibleTimer = 0;
        this.currentQuiz = null;
        this.quizInterval = null;

        // Garment collection system
        this.garmentOrder = ['uncu', 'pututu', 'chuspa', 'qepi', 'ullu', 'usutas'];
        this.garmentNames = ['Uncu', 'Pututu', 'Chuspa', "Q'epi", 'Ullu', 'Usutas'];
        this.nextGarmentIndex = 0;

        // Player
        this.player = {
            x: 100,
            y: CFG.GROUND_Y - CFG.PLAYER_H,
            w: CFG.PLAYER_W,
            h: CFG.PLAYER_H,
            vy: 0,
            onGround: true,
            jumping: false,
            ducking: false,
        };

        // Game objects
        this.obstacles = [];
        this.quipus = [];
        this.particles = [];

        // Spawn timers
        this.nextObstacle = 1500;
        this.nextQuipu = 2000;
        this.lastTime = 0;
        this.deltaAccum = 0;

        // Background elements
        this.stars = createStars(80);
        this.clouds = createClouds(6);
        this.mtFar = generateMountainLayer(CFG.H * 0.55, 60, 150, 8);
        this.mtMid = generateMountainLayer(CFG.H * 0.62, 50, 120, 6);
        this.mtNear = generateMountainLayer(CFG.H * 0.68, 40, 90, 5);
        this.bgScroll = 0;
        this.groundScroll = 0;

        // Screen shake
        this.shake = { x: 0, y: 0, intensity: 0 };

        // UI elements
        this.hud = document.getElementById('hud');
        this.startScreen = document.getElementById('start-screen');
        this.gameoverScreen = document.getElementById('gameover-screen');
        this.quizScreen = document.getElementById('quiz-screen');

        this.setupControls();
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                if (this.state === 'menu') {
                    this.startGame();
                } else if (this.state === 'playing') {
                    this.jump();
                } else if (this.state === 'gameover') {
                    this.restart();
                }
            }
            if (e.code === 'ArrowDown' && this.state === 'playing') {
                e.preventDefault();
                this.duck(true);
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.code === 'ArrowDown') {
                this.duck(false);
            }
        });

        // Touch support (General canvas touch for safety)
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.state === 'menu') this.startGame();
            else if (this.state === 'gameover') this.restart();
        });

        // Touch support for overlays directly
        document.getElementById('start-screen').addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.state === 'menu') this.startGame();
        });
        document.getElementById('gameover-screen').addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.state === 'gameover') this.restart();
        });

        // Mobile specific buttons
        const btnJump = document.getElementById('btn-jump');
        const btnDuck = document.getElementById('btn-duck');
        
        if (btnJump && btnDuck) {
            btnJump.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (this.state === 'playing') this.jump();
                else if (this.state === 'menu') this.startGame();
                else if (this.state === 'gameover') this.restart();
            });
            
            btnDuck.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (this.state === 'playing') this.duck(true);
            });
            btnDuck.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.duck(false);
            });
        }
    }

    requestFullscreen() {
        try {
            const docEl = document.documentElement;
            if (docEl.requestFullscreen) {
                docEl.requestFullscreen().catch(err => console.log(err));
            } else if (docEl.webkitRequestFullscreen) {
                docEl.webkitRequestFullscreen();
            }
        } catch (e) {
            console.log('Fullscreen API error', e);
        }
    }

    startGame() {
        this.requestFullscreen();
        this.sfx.init();
        this.state = 'playing';
        this.startScreen.classList.add('hidden');
        this.hud.classList.add('visible');
        this.gameoverScreen.classList.add('hidden');
        this.quizScreen.classList.add('hidden');
        document.getElementById('mobile-controls').style.display = '';
        
        // Attempt to lock orientation to landscape (mobile only)
        try {
            if (screen.orientation && screen.orientation.lock) {
                screen.orientation.lock('landscape').catch(err => console.log('Orientation lock failed:', err));
            }
        } catch (e) {
            console.log('Orientation API not supported');
        }

        this.reset();
    }

    restart() {
        this.requestFullscreen();
        this.state = 'playing';
        this.gameoverScreen.classList.add('hidden');
        this.quizScreen.classList.add('hidden');
        this.hud.classList.add('visible');
        document.getElementById('mobile-controls').style.display = '';
        this.reset();
    }

    reset() {
        this.score = 0;
        this.distance = 0;
        this.quipusCollected = 0;
        this.speed = CFG.INIT_SPEED;
        this.player.x = 100;
        this.player.y = CFG.GROUND_Y - CFG.PLAYER_H;
        this.player.vy = 0;
        this.player.onGround = true;
        this.player.jumping = false;
        this.player.ducking = false;
        this.obstacles = [];
        this.quipus = [];
        this.particles = [];
        this.nextObstacle = 1200;
        this.nextQuipu = 1800;
        this.quipuTimer = Math.floor(Math.random() * 90) + 90; // Initialize proper timer
        this.deltaAccum = 0;
        this.shake = { x: 0, y: 0, intensity: 0 };
        this.extraLives = 3;
        this.usedQuestions = [];
        this.invincibleTimer = 0;
        this.currentQuiz = null;
        this.nextGarmentIndex = 0;

        // Reset HUD icons
        for (let i = 0; i < 6; i++) {
            const slot = document.getElementById(`inv-slot-${i}`);
            if (slot) slot.classList.remove('collected');
        }
    }

    collectGarment(index) {
        this.nextGarmentIndex++;
        
        // Update HUD
        const slot = document.getElementById(`inv-slot-${index}`);
        if (slot) slot.classList.add('collected');
        
        // Show Toast
        this.showToast(`¡Obtuviste ${this.garmentNames[index]}!`);
        
        // Check Victory
        if (this.nextGarmentIndex >= 6) {
            setTimeout(() => this.showVictoryModal(), 1000);
        }
    }

    showToast(msg) {
        const toast = document.getElementById('item-toast');
        document.getElementById('item-toast-text').textContent = msg;
        toast.classList.remove('hidden');
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    showVictoryModal() {
        this.state = 'gameover';
        document.getElementById('mobile-controls').style.display = 'none'; // Hide buttons
        const modal = document.getElementById('victory-screen');
        modal.classList.remove('hidden');
        
        const now = new Date();
        const timestamp = now.toLocaleString('es-PE');
        document.getElementById('victory-timestamp').textContent = timestamp;
        document.getElementById('victory-record').textContent = `Distancia: ${Math.floor(this.distance)} m`;
    }

    jump() {
        if (this.player.onGround) {
            this.player.vy = CFG.JUMP_FORCE;
            this.player.onGround = false;
            this.player.jumping = true;
            this.sfx.play('jump');

            // Jump dust
            for (let i = 0; i < 6; i++) {
                this.particles.push(new Particle(
                    this.player.x + this.player.w / 2 + rand(-8, 8),
                    CFG.GROUND_Y,
                    'rgba(180,160,120,0.6)',
                    'dust'
                ));
            }
        }
    }

    duck(active) {
        this.player.ducking = active;
        if (active) {
            this.player.h = CFG.DUCK_H;
            this.player.y = CFG.GROUND_Y - CFG.DUCK_H;
        } else {
            this.player.h = CFG.PLAYER_H;
            if (this.player.onGround) {
                this.player.y = CFG.GROUND_Y - CFG.PLAYER_H;
            }
        }
    }

    gameOver() {
        this.sfx.play('hit');
        this.shake.intensity = 10;

        // Collision particles
        for (let i = 0; i < 15; i++) {
            this.particles.push(new Particle(
                this.player.x + this.player.w / 2,
                this.player.y + this.player.h / 2,
                PAL.quipuColors[i % PAL.quipuColors.length],
                'sparkle'
            ));
        }

        // If extra lives available and unused questions remain, show quiz
        const availableQs = TRIVIA.filter((_, i) => !this.usedQuestions.includes(i));
        if (this.extraLives > 0 && availableQs.length > 0) {
            this.state = 'quiz';
            setTimeout(() => this.showQuiz(), 400);
        } else {
            this.finalGameOver();
        }
    }

    finalGameOver() {
        this.state = 'gameover';
        document.getElementById('mobile-controls').style.display = 'none';

        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('gomiChasqui_highScore', this.highScore.toString());
        }

        // Show game over UI
        setTimeout(() => {
            this.hud.classList.remove('visible');
            this.quizScreen.classList.add('hidden');
            this.gameoverScreen.classList.remove('hidden');
            document.getElementById('final-score').textContent = this.score;
            document.getElementById('final-distance').textContent = Math.floor(this.distance) + ' m';
            document.getElementById('final-quipus').textContent = this.quipusCollected;
            document.getElementById('high-score').textContent = this.highScore;
            document.getElementById('fact-text').textContent = TRIVIA[Math.floor(Math.random() * TRIVIA.length)].fact;
        }, 500);
    }

    showQuiz() {
        document.getElementById('mobile-controls').style.display = 'none';
        // Pick a random unused question
        const available = TRIVIA.map((q, i) => ({ q, i })).filter(x => !this.usedQuestions.includes(x.i));
        const pick = available[Math.floor(Math.random() * available.length)];
        this.currentQuiz = { ...pick.q, index: pick.i };
        this.usedQuestions.push(pick.i);

        // UI Elements
        const titleEl = document.getElementById('quiz-title');
        const stepFactEl = document.getElementById('quiz-step-fact');
        const stepQuestionEl = document.getElementById('quiz-step-question');
        const countdownEl = document.getElementById('quiz-countdown-timer');
        const feedback = document.getElementById('quiz-feedback');
        
        // Reset states
        titleEl.textContent = '📜 Dato Histórico';
        stepFactEl.classList.remove('hidden');
        stepQuestionEl.classList.add('hidden');
        feedback.classList.add('hidden');
        feedback.classList.remove('success', 'failure');

        // Populate fact
        document.getElementById('quiz-fact-text').textContent = this.currentQuiz.fact;
        document.getElementById('quiz-lives-text').textContent = `Vidas extra: ${this.extraLives}`;

        // Handle countdown timer to move to question step
        let timeLeft = 8;
        countdownEl.textContent = timeLeft;
        if (this.quizInterval) clearInterval(this.quizInterval);
        
        this.quizInterval = setInterval(() => {
            timeLeft--;
            countdownEl.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(this.quizInterval);
                stepFactEl.classList.add('hidden');
                stepQuestionEl.classList.remove('hidden');
                titleEl.textContent = '🧠 ¡Responde para revivir!';

                // Populate question
                document.getElementById('quiz-question').textContent = this.currentQuiz.q;

                // Build option buttons
                const optionsEl = document.getElementById('quiz-options');
                optionsEl.innerHTML = '';
                const letters = ['A', 'B', 'C', 'D'];
                this.currentQuiz.opts.forEach((opt, i) => {
                    const btn = document.createElement('button');
                    btn.className = 'quiz-option-btn';
                    btn.innerHTML = `<span class="option-letter">${letters[i]}</span>${opt}`;
                    btn.addEventListener('click', () => this.answerQuiz(i, btn));
                    optionsEl.appendChild(btn);
                });
            }
        }, 1000);

        this.quizScreen.classList.remove('hidden');
    }

    answerQuiz(selectedIndex, clickedBtn) {
        const isCorrect = selectedIndex === this.currentQuiz.correct;
        const allBtns = document.getElementById('quiz-options').querySelectorAll('.quiz-option-btn');
        const feedback = document.getElementById('quiz-feedback');
        const feedbackIcon = document.getElementById('quiz-feedback-icon');
        const feedbackText = document.getElementById('quiz-feedback-text');

        // Disable all buttons
        allBtns.forEach(b => b.classList.add('disabled'));

        // Always highlight correct answer
        allBtns[this.currentQuiz.correct].classList.add('correct');

        if (isCorrect) {
            clickedBtn.classList.add('correct');
            feedback.classList.remove('hidden', 'failure');
            feedback.classList.add('success');
            feedbackIcon.textContent = '🎉';
            feedbackText.textContent = '¡Correcto! ¡El Chasqui sigue corriendo!';
            this.extraLives--;
            this.sfx.play('revive');

            // Revive after short delay
            setTimeout(() => this.revivePlayer(), 1400);
        } else {
            clickedBtn.classList.add('wrong');
            feedback.classList.remove('hidden', 'success');
            feedback.classList.add('failure');
            feedbackIcon.textContent = '😢';
            feedbackText.textContent = `Incorrecto. La respuesta era: ${this.currentQuiz.opts[this.currentQuiz.correct]}`;

            // Transition to full game over
            setTimeout(() => {
                this.quizScreen.classList.add('hidden');
                this.finalGameOver();
            }, 2000);
        }
    }

    revivePlayer() {
        this.quizScreen.classList.add('hidden');
        this.state = 'playing';
        document.getElementById('mobile-controls').style.display = '';

        // Reset player to safe position on ground
        this.player.y = CFG.GROUND_Y - CFG.PLAYER_H;
        this.player.vy = 0;
        this.player.onGround = true;
        this.player.jumping = false;
        this.player.ducking = false;
        this.player.h = CFG.PLAYER_H;

        // Remove nearby obstacles (give breathing room)
        this.obstacles = this.obstacles.filter(o => o.x > this.player.x + this.player.w + 150);

        // Grant invincibility for 3 seconds (~180 frames at 60fps)
        this.invincibleTimer = 180;

        // Revival particles
        for (let i = 0; i < 20; i++) {
            this.particles.push(new Particle(
                this.player.x + this.player.w / 2 + rand(-20, 20),
                this.player.y + this.player.h / 2 + rand(-20, 20),
                PAL.gold,
                'sparkle'
            ));
        }
    }

    spawnObstacle() {
        // 35% rock, 35% llama, 30% condor (flying)
        const randType = Math.random();
        let type;
        if (randType < 0.35) type = 'rock';
        else if (randType < 0.70) type = 'llama';
        else type = 'condor';
        
        let w, h, alpacaVariant, y;
        if (type === 'rock') {
            w = rand(35, 55);
            h = rand(28, 45);
            y = CFG.GROUND_Y - h;
        } else if (type === 'llama') {
            w = rand(65, 80);
            h = rand(55, 68);
            y = CFG.GROUND_Y - h;
            alpacaVariant = Math.random() < 0.5 ? 1 : 2;
        } else {
            // Condor (flying, requires ducking)
            w = 50;
            h = 30;
            // Height placed exactly so standing hits it, ducking passes under
            y = CFG.GROUND_Y - 65; 
        }
        
        const newObs = {
            type,
            alpacaVariant,
            x: CFG.W + 20,
            y, w, h,
            frame: Math.random() * 100,
        };
        
        // If a quipu is too close, abort spawning this obstacle to let the player collect it safely
        const safeZone = { x: newObs.x - 100, y: 0, w: newObs.w + 200, h: CFG.H };
        if (this.quipus.some(q => this.checkCollision(q, safeZone))) {
            return; 
        }

        this.obstacles.push(newObs);
    }

    spawnQuipu() {
        const w = 35, h = 30;
        // Sometimes on the ground, sometimes elevated (jump required)
        const elevated = Math.random() < 0.4;
        const y = elevated ? CFG.GROUND_Y - h - rand(50, 90) : CFG.GROUND_Y - h - rand(5, 20);
        
        let isGarment = false;
        let garmentType = null;
        if (this.nextGarmentIndex < 6 && this.quipusCollected >= (this.nextGarmentIndex + 1) * 6) {
            // Check if this garment is already spawned and on screen
            const alreadySpawned = this.quipus.some(q => q.isGarment && q.garmentIndex === this.nextGarmentIndex);
            if (!alreadySpawned) {
                isGarment = true;
                garmentType = this.garmentOrder[this.nextGarmentIndex];
            }
        }
        
        const newQuipu = {
            x: CFG.W + 20,
            y, w, h,
            collected: false,
            frame: Math.random() * 100,
            isGarment: isGarment,
            garmentIndex: isGarment ? this.nextGarmentIndex : -1,
            garmentType: garmentType
        };

        // Prevent spawning directly inside or too close to an obstacle
        for (const obs of this.obstacles) {
            // Guarantee 100px horizontal clearance so they never overlap
            const safeZone = { x: obs.x - 100, y: 0, w: obs.w + 200, h: CFG.H };
            if (this.checkCollision(newQuipu, safeZone)) {
                return; // Abort spawn
            }
        }

        this.quipus.push(newQuipu);
    }

    checkCollision(a, b) {
        const s = CFG.HIT_SHRINK;
        return (
            a.x + s < b.x + b.w - s &&
            a.x + a.w - s > b.x + s &&
            a.y + s < b.y + b.h - s &&
            a.y + a.h - s > b.y + s
        );
    }

    // ---- UPDATE ----
    update(dt) {
        if (this.state !== 'playing' && this.state !== 'gameover' && this.state !== 'quiz') return;

        this.frame++;

        // Background scroll (always)
        this.bgScroll += this.speed * 0.3;
        this.groundScroll += this.speed;

        // Clouds
        for (const c of this.clouds) {
            c.x -= c.speed;
            if (c.x + c.w < -50) {
                c.x = CFG.W + rand(50, 200);
                c.y = rand(30, 180);
            }
        }

        if (this.state === 'gameover' || this.state === 'quiz') {
            // Just update particles and shake during gameover
            this.particles = this.particles.filter(p => p.alive);
            this.particles.forEach(p => p.update());
            if (this.shake.intensity > 0) {
                this.shake.x = (Math.random() - 0.5) * this.shake.intensity;
                this.shake.y = (Math.random() - 0.5) * this.shake.intensity;
                this.shake.intensity *= 0.9;
                if (this.shake.intensity < 0.5) this.shake.intensity = 0;
            }
            return;
        }

        // Speed increases
        this.speed = Math.min(CFG.MAX_SPEED, this.speed + CFG.SPEED_INC);

        // Score & distance
        this.distance += this.speed * 0.05;
        this.score = Math.floor(this.distance * 2) + this.quipusCollected * 50;

        // ---- Day Cycle Interpolation ----
        const CYCLE_DIST = 1600; // ~70-80 seconds for a full cycle (Dawn -> Noon -> Dusk -> Night -> Dawn)
        const cycleProgress = (this.distance % CYCLE_DIST) / CYCLE_DIST;
        
        // 4 phases
        const currentPhaseIdx = Math.floor(cycleProgress * 4);
        const nextPhaseIdx = (currentPhaseIdx + 1) % 4;
        
        // Local factor within this phase
        const phaseProgress = (cycleProgress * 4) - currentPhaseIdx;

        // Interpolate environment keys
        const c1 = DAY_CYCLES[currentPhaseIdx];
        const c2 = DAY_CYCLES[nextPhaseIdx];
        
        const envKeys = [
            'skyTop', 'skyMid', 'skyBot', 'horizon', 'sunGlow', 'starColor',
            'mtFar', 'mtMid', 'mtNear', 'mtSnow', 'groundTop', 'groundMid', 'groundBot',
            'pathStone', 'pathLine', 'cloudColor'
        ];
        for (const k of envKeys) {
            PAL[k] = interpolateColor(c1[k], c2[k], phaseProgress);
        }

        // Player physics
        if (!this.player.onGround) {
            this.player.vy += CFG.GRAVITY;
            this.player.y += this.player.vy;

            if (this.player.y >= CFG.GROUND_Y - this.player.h) {
                this.player.y = CFG.GROUND_Y - this.player.h;
                this.player.vy = 0;
                this.player.onGround = true;
                this.player.jumping = false;

                // Landing dust
                for (let i = 0; i < 4; i++) {
                    this.particles.push(new Particle(
                        this.player.x + this.player.w / 2 + rand(-6, 6),
                        CFG.GROUND_Y,
                        'rgba(180,160,120,0.5)',
                        'dust'
                    ));
                }
            }
        }

        // Running dust trail
        if (this.player.onGround && this.frame % 6 === 0) {
            this.particles.push(new Particle(
                this.player.x + 5,
                CFG.GROUND_Y - 2,
                'rgba(160,140,100,0.35)',
                'trail'
            ));
        }

        // Spawn obstacles
        this.deltaAccum += dt;
        if (this.deltaAccum >= this.nextObstacle) {
            this.spawnObstacle();
            this.nextObstacle = rand(CFG.OBS_GAP_MIN, CFG.OBS_GAP_MAX) / (this.speed / CFG.INIT_SPEED);
            this.deltaAccum = 0;
        }

        // Spawn quipus (using proper timer)
        this.quipuTimer--;
        if (this.quipuTimer <= 0) {
            if (this.quipus.length < 3) {
                this.spawnQuipu();
            }
            this.quipuTimer = Math.floor(Math.random() * 90) + 90; // Next spawn in 90-180 frames
        }

        // Move obstacles
        for (const obs of this.obstacles) {
            obs.x -= this.speed;
            obs.frame += 1;
        }
        this.obstacles = this.obstacles.filter(o => o.x + o.w > -50);

        // Move quipus
        for (const q of this.quipus) {
            q.x -= this.speed;
            q.frame += 1;
        }
        this.quipus = this.quipus.filter(q => q.x + q.w > -50 && !q.collected);

        // Invincibility countdown
        if (this.invincibleTimer > 0) {
            this.invincibleTimer--;
        }

        // Collision with obstacles (skip if invincible)
        if (this.invincibleTimer <= 0) {
            for (const obs of this.obstacles) {
                if (this.checkCollision(this.player, obs)) {
                    this.gameOver();
                    return;
                }
            }
        }

        // Collect quipus
        for (const q of this.quipus) {
            if (!q.collected && this.checkCollision(this.player, q)) {
                q.collected = true;
                this.sfx.play('collect');

                if (q.isGarment) {
                    this.collectGarment(q.garmentIndex);
                } else {
                    this.quipusCollected++;
                }

                // Collection particles
                for (let i = 0; i < 10; i++) {
                    this.particles.push(new Particle(
                        q.x + q.w / 2,
                        q.y + q.h / 2,
                        PAL.quipuColors[i % PAL.quipuColors.length],
                        'sparkle'
                    ));
                }
            }
        }

        // Update particles
        this.particles.forEach(p => p.update());
        this.particles = this.particles.filter(p => p.alive);

        // Update HUD
        document.getElementById('score-value').textContent = this.score;
        document.getElementById('distance-value').textContent = Math.floor(this.distance) + ' m';
        document.getElementById('quipu-value').textContent = this.quipusCollected;
        document.getElementById('speed-value').textContent = (this.speed / CFG.INIT_SPEED).toFixed(1) + 'x';

        // Screen shake
        if (this.shake.intensity > 0) {
            this.shake.x = (Math.random() - 0.5) * this.shake.intensity;
            this.shake.y = (Math.random() - 0.5) * this.shake.intensity;
            this.shake.intensity *= 0.9;
            if (this.shake.intensity < 0.5) this.shake.intensity = 0;
        }
    }

    // ---- DRAW ----
    draw() {
        const ctx = this.ctx;
        ctx.save();

        // Screen shake
        if (this.shake.intensity > 0) {
            ctx.translate(this.shake.x, this.shake.y);
        }

        // ---- Sky Gradient ----
        const skyGrad = ctx.createLinearGradient(0, 0, 0, CFG.H);
        skyGrad.addColorStop(0, PAL.skyTop);
        skyGrad.addColorStop(0.35, PAL.skyMid);
        skyGrad.addColorStop(0.65, PAL.skyBot);
        skyGrad.addColorStop(0.85, PAL.horizon);
        skyGrad.addColorStop(1, PAL.sunGlow);
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, CFG.W, CFG.H);

        // ---- Stars ----
        for (const s of this.stars) {
            const twinkle = 0.3 + Math.sin(this.frame * s.twinkleSpeed + s.twinkleOffset) * 0.35 + 0.35;
            ctx.globalAlpha = s.brightness * twinkle * 0.6;
            ctx.fillStyle = PAL.starColor;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // ---- Moon ----
        ctx.fillStyle = 'rgba(255,240,220,0.9)';
        ctx.shadowColor = 'rgba(255,240,200,0.4)';
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.arc(CFG.W - 120, 70, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = PAL.skyTop;
        ctx.beginPath();
        ctx.arc(CFG.W - 112, 65, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // ---- Clouds ----
        for (const c of this.clouds) {
            ctx.fillStyle = PAL.cloudColor;
            ctx.beginPath();
            ctx.ellipse(c.x, c.y, c.w / 2, c.h / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(c.x - c.w * 0.25, c.y + 5, c.w * 0.3, c.h * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(c.x + c.w * 0.25, c.y + 3, c.w * 0.28, c.h * 0.35, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // ---- Mountains (parallax) ----
        this.drawMountainLayer(ctx, this.mtFar, PAL.mtFar, this.bgScroll * 0.15, 0.6);
        // Snow caps on far mountains
        this.drawSnowCaps(ctx, this.mtFar, this.bgScroll * 0.15);
        this.drawMountainLayer(ctx, this.mtMid, PAL.mtMid, this.bgScroll * 0.35, 0.75);
        this.drawMountainLayer(ctx, this.mtNear, PAL.mtNear, this.bgScroll * 0.6, 0.9);

        // ---- Ground ----
        this.drawGround(ctx);

        // ---- Stone Path ----
        this.drawPath(ctx);

        // ---- Game Objects ----
        // Obstacles (draw first so they are behind Quipus)
        for (const obs of this.obstacles) {
            if (obs.type === 'rock') {
                drawRock(ctx, obs.x, obs.y, obs.w, obs.h);
            } else if (obs.type === 'condor') {
                drawCondor(ctx, obs.x, obs.y, obs.w, obs.h, obs.frame);
            } else {
                const asset = obs.alpacaVariant === 1 ? ASSETS.alpaca1 : ASSETS.alpaca2;
                if (asset.canvas) {
                    ctx.drawImage(asset.canvas, obs.x, obs.y, obs.w, obs.h);
                } else {
                    drawLlama(ctx, obs.x, obs.y, obs.w, obs.h, obs.frame);
                }
            }
        }

        // Quipus (in front of obstacles, behind player)
        for (const q of this.quipus) {
            if (!q.collected) {
                if (q.isGarment) {
                    const asset = ASSETS[q.garmentType];
                    if (asset && asset.img.complete) {
                        ctx.save();
                        // Add floating effect
                        const floatY = q.y + Math.sin(q.frame * 0.1) * 5;
                        ctx.drawImage(asset.img, q.x, floatY - 10, q.w + 20, q.h + 20);
                        
                        // Add glow
                        ctx.globalCompositeOperation = 'lighter';
                        ctx.shadowColor = PAL.gold;
                        ctx.shadowBlur = 15;
                        ctx.drawImage(asset.img, q.x, floatY - 10, q.w + 20, q.h + 20);
                        ctx.restore();
                    }
                } else {
                    drawQuipu(ctx, q.x, q.y, q.w, q.h, q.frame);
                }
            }
        }

        // Player (blink when invincible)
        const showPlayer = this.invincibleTimer <= 0 || Math.floor(this.frame / 3) % 2 === 0;
        if (showPlayer) {
            if (this.invincibleTimer > 0) {
                ctx.save();
                ctx.shadowColor = PAL.gold;
                ctx.shadowBlur = 15 + Math.sin(this.frame * 0.3) * 5;
            }
            drawChasqui(ctx, this.player.x, this.player.y, this.player.w, this.player.h,
                this.frame, this.player.jumping, this.player.ducking);
            if (this.invincibleTimer > 0) {
                ctx.restore();
            }
        }

        // Particles (on top of everything)
        for (const p of this.particles) {
            p.draw(ctx);
        }

        // ---- Vignette ----
        const vigGrad = ctx.createRadialGradient(
            CFG.W / 2, CFG.H / 2, CFG.W * 0.35,
            CFG.W / 2, CFG.H / 2, CFG.W * 0.7
        );
        vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
        vigGrad.addColorStop(1, 'rgba(0,0,0,0.35)');
        ctx.fillStyle = vigGrad;
        ctx.fillRect(0, 0, CFG.W, CFG.H);

        ctx.restore();
    }

    drawMountainLayer(ctx, pts, color, scroll, heightScale) {
        ctx.save();
        ctx.fillStyle = color;
        ctx.beginPath();
        const offset = -(scroll % (CFG.W + 200));

        ctx.moveTo(-100 + offset, CFG.H);
        for (let i = 0; i < pts.length; i++) {
            const p = pts[i];
            const nx = pts[i + 1] || { x: p.x + 100, y: p.y };
            const cpx = (p.x + nx.x) / 2 + offset;
            const cpy = Math.min(p.y, nx.y) - 15;
            ctx.quadraticCurveTo(p.x + offset, p.y * heightScale + (1 - heightScale) * CFG.H * 0.5, cpx, cpy * heightScale + (1 - heightScale) * CFG.H * 0.5);
        }
        ctx.lineTo(CFG.W + 200 + offset, CFG.H);
        ctx.closePath();
        ctx.fill();

        // Repeat for seamless scroll
        ctx.beginPath();
        ctx.moveTo(-100 + offset + CFG.W + 200, CFG.H);
        for (let i = 0; i < pts.length; i++) {
            const p = pts[i];
            const nx = pts[i + 1] || { x: p.x + 100, y: p.y };
            const cpx = (p.x + nx.x) / 2 + offset + CFG.W + 200;
            const cpy = Math.min(p.y, nx.y) - 15;
            ctx.quadraticCurveTo(p.x + offset + CFG.W + 200, p.y * heightScale + (1 - heightScale) * CFG.H * 0.5, cpx, cpy * heightScale + (1 - heightScale) * CFG.H * 0.5);
        }
        ctx.lineTo(CFG.W + 400 + offset, CFG.H);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    drawSnowCaps(ctx, pts, scroll) {
        ctx.save();
        const offset = -(scroll % (CFG.W + 200));
        ctx.fillStyle = PAL.mtSnow;

        for (let pass = 0; pass < 2; pass++) {
            const passOffset = pass * (CFG.W + 200);
            for (let i = 0; i < pts.length - 1; i++) {
                const p = pts[i];
                const peakY = p.y * 0.6 + 0.4 * CFG.H * 0.5;
                if (peakY < CFG.H * 0.4) {
                    ctx.beginPath();
                    ctx.moveTo(p.x + offset + passOffset - 15, peakY + 12);
                    ctx.lineTo(p.x + offset + passOffset, peakY);
                    ctx.lineTo(p.x + offset + passOffset + 15, peakY + 10);
                    ctx.quadraticCurveTo(p.x + offset + passOffset, peakY + 15, p.x + offset + passOffset - 15, peakY + 12);
                    ctx.fill();
                }
            }
        }
        ctx.restore();
    }

    drawGround(ctx) {
        // Terrain above path
        const terrainGrad = ctx.createLinearGradient(0, CFG.GROUND_Y - 20, 0, CFG.H);
        terrainGrad.addColorStop(0, PAL.groundTop);
        terrainGrad.addColorStop(0.4, PAL.groundMid);
        terrainGrad.addColorStop(1, PAL.groundBot);
        ctx.fillStyle = terrainGrad;
        ctx.fillRect(0, CFG.GROUND_Y - 5, CFG.W, CFG.H - CFG.GROUND_Y + 5);

        // Grass tufts along edge
        ctx.fillStyle = '#4a6a30';
        const grassOffset = -(this.groundScroll % 40);
        for (let x = grassOffset; x < CFG.W + 40; x += 40) {
            for (let g = 0; g < 3; g++) {
                ctx.beginPath();
                const gx = x + g * 12 + (g === 1 ? 5 : 0);
                ctx.moveTo(gx, CFG.GROUND_Y - 3);
                ctx.quadraticCurveTo(gx + 2, CFG.GROUND_Y - 10 - g * 3, gx + 4, CFG.GROUND_Y - 3);
                ctx.fill();
            }
        }
    }

    drawPath(ctx) {
        const pathY = CFG.GROUND_Y - 3;
        const pathH = 15;

        // Path base
        ctx.fillStyle = PAL.pathStone;
        ctx.fillRect(0, pathY, CFG.W, pathH);

        // Stone pattern
        ctx.strokeStyle = PAL.pathLine;
        ctx.lineWidth = 1;
        const stoneOffset = -(this.groundScroll % 60);

        for (let x = stoneOffset; x < CFG.W + 60; x += 30) {
            // Horizontal mortar lines
            ctx.beginPath();
            ctx.moveTo(x, pathY);
            ctx.lineTo(x, pathY + pathH);
            ctx.stroke();
        }
        // Middle horizontal line
        ctx.beginPath();
        ctx.moveTo(0, pathY + pathH / 2);
        ctx.lineTo(CFG.W, pathY + pathH / 2);
        ctx.stroke();

        // Path borders
        ctx.fillStyle = '#6e5438';
        ctx.fillRect(0, pathY - 2, CFG.W, 2);
        ctx.fillRect(0, pathY + pathH, CFG.W, 2);
    }

    // ---- GAME LOOP ----
    loop(timestamp) {
        const dt = this.lastTime ? timestamp - this.lastTime : 16;
        this.lastTime = timestamp;

        this.update(dt);
        this.draw();

        requestAnimationFrame(this.loop);
    }
}

// ---- Initialize ----
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
