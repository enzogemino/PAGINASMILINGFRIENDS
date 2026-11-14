let imagenes = {};
let personajes = [];
let puntos = 0;
let fondoArcoiris = false;
let sonido;
let musica;
let indicadorPuntos = null;
let temporizadorDescuento = null;
let jeremyActivo = false;

function altoPersonaje(tipo) {
    if (tipo === 'glep') {
        return 55;
    }
    if (tipo === 'pim') {
        return 102;
    }
    if (tipo === 'alan' || tipo === 'mrboss') {
        return 126;
    }
    return 112;
}
function preload() {
    imagenes.alan = loadImage('./img/alan.png');
    imagenes.charlie = loadImage('./img/charlie.png');
    imagenes.glep = loadImage('./img/glep.png');
    imagenes.mrboss = loadImage('./img/mrboss.png');
    imagenes.pim = loadImage('./img/pim.png');
    imagenes.smiley = loadImage('./img/smiley.png');
    sonido = loadSound('./sonidos/jeremy.mp3');
    musica = loadSound('./sonidos/smiling_friends_intro.mp3');
}
function setup() {
    musica.setVolume(1.0);
    sonido.onended(() => {
        if (!jeremyActivo) {
            return;
        }

        jeremyActivo = false;
        select('#screamer').removeClass('visible');
        if (!select('#derrota').hasClass('visible')) {
            musica.loop();
        }
    });
    let zona = select('#escena');
    let lienzo = createCanvas(zona.width, zona.height);
    lienzo.parent('escena');
    imageMode(CENTER);

    const barra = select('.barra');
    indicadorPuntos = createDiv('-2');
    indicadorPuntos.id('puntos-alerta');
    indicadorPuntos.parent(barra);
    indicadorPuntos.style('display', 'none');

    const tiposBase = ['alan', 'charlie', 'pim', 'glep'];
    let tipos = [];

    for (let i = 0; i < tiposBase.length; i++) {
        const cantidad = tiposBase[i] === 'charlie'
            ? 11
            : tiposBase[i] === 'pim' ? 9
            : tiposBase[i] === 'glep' ? 5 : 9;
        for (let j = 0; j < cantidad; j++) {
            tipos.push(tiposBase[i]);
        }
    }

    for (let i = 0; i < 5; i++) {
        tipos.push('mrboss');
    }

    for (let i = tipos.length - 1; i > 0; i--) {
        let j = floor(random(i + 1));
        [tipos[i], tipos[j]] = [tipos[j], tipos[i]];
    }

    for (let i = 0; i < tipos.length; i++) {
        let personaje = {
            tipo: tipos[i],
            x: 0,
            y: 0,
            fase: random(TWO_PI)
        };

        let posicion = buscarPosicion(personaje);
        personaje.x = posicion.x;
        personaje.y = posicion.y;
        personajes.push(personaje);
    }
}

function buscarPosicion(personajeMovido) {
    let posicion = { x: 0, y: 0 };

    for (let intento = 0; intento < 100; intento++) {
        posicion.x = random(65, width - 65);
        posicion.y = random(65, height - 65);

        let hayPersonajeCerca = false;
        for (let i = 0; i < personajes.length; i++) {
            let otro = personajes[i];
            if (otro !== personajeMovido && dist(posicion.x, posicion.y, otro.x, otro.y) < 85) {
                hayPersonajeCerca = true;
                break;
            }
        }

        if (!hayPersonajeCerca) {
            break;
        }
    }

    return posicion;
}

function draw() {
    let zona = select('#escena');
    if (width !== zona.width || height !== zona.height) {
        resizeCanvas(zona.width, zona.height);
    }
    if (fondoArcoiris) {
        clear();
    } else {
        background('#f8f1e3');
    }
    dibujarSmiley();
    dibujarPersonajes();
}

function dibujarSmiley() {
    let imagen = imagenes.smiley;
    if (imagen && imagen.width > 0) {
        let alto = 150;
        let ancho = alto * imagen.width / imagen.height;
        image(imagen, width / 2, height / 2, ancho, alto);
    }
}

function dibujarPersonajes() {
    for (let i = 0; i < personajes.length; i++) {
        let personaje = personajes[i];
        let imagen = imagenes[personaje.tipo];
        if (imagen && imagen.width > 0) {
            let alto = altoPersonaje(personaje.tipo);
            let ancho = alto * imagen.width / imagen.height;
            image(imagen, personaje.x, personaje.y, ancho, alto);
        }
    }
}

function mostrarCambioPuntos(cambio, esPositivo) {
    if (!indicadorPuntos) {
        return;
    }

    indicadorPuntos.html(cambio);
    if (esPositivo) {
        indicadorPuntos.addClass('positivo');
    } else {
        indicadorPuntos.removeClass('positivo');
    }
    indicadorPuntos.style('display', 'inline-block');
    indicadorPuntos.style('opacity', '1');
    indicadorPuntos.style('transform', 'scale(1)');

    if (temporizadorDescuento) {
        clearTimeout(temporizadorDescuento);
    }

    temporizadorDescuento = setTimeout(() => {
        indicadorPuntos.style('opacity', '0');
        indicadorPuntos.style('transform', 'scale(0.8)');
        temporizadorDescuento = setTimeout(() => {
            indicadorPuntos.style('display', 'none');
        }, 300);
    }, 1200);
}

function mousePressed() {
    if(!musica.isPlaying()) {
        musica.loop();
    }
    let personajeClickeado = null;

    for (let i = personajes.length - 1; i >= 0; i--) {
        let personaje = personajes[i];
        let imagen = imagenes[personaje.tipo];
        if (imagen && imagen.width > 0) {
            let alto = altoPersonaje(personaje.tipo);
            let ancho = alto * imagen.width / imagen.height;
            let flotacion = sin(frameCount * 0.035 + personaje.fase) * 4;
            let clicEnX = mouseX > personaje.x - ancho / 2 &&
                mouseX < personaje.x + ancho / 2;
            let clicEnY = mouseY > personaje.y + flotacion - alto / 2 &&
                mouseY < personaje.y + flotacion + alto / 2;
            if (clicEnX && clicEnY) {
                personajeClickeado = personaje;
                break;
            }
        }
    }

    if (!personajeClickeado) {
        return;
    }

    if (personajeClickeado.tipo === 'mrboss') {
        puntos = 0;
        select('#contador').html('SONRISAS: ' + puntos);
        fondoArcoiris = false;
        select('#escena').removeClass('arcoiris');
        select('#screamer').removeClass('visible');
        jeremyActivo = false;
        sonido.stop();
        musica.stop();
        select('#derrota').addClass('visible');
        setTimeout(() => {
            select('#derrota').removeClass('visible');
            musica.loop();
        }, 3000);
        return;
    }

    if (personajeClickeado.tipo === 'glep') {
        puntos = Math.max(0, puntos - 2);
        select('#contador').html('SONRISAS: ' + puntos);
        mostrarCambioPuntos('-2', false);
    } else if (personajeClickeado.tipo === 'pim') {
        puntos += 2;
        select('#contador').html('SONRISAS: ' + puntos);
        mostrarCambioPuntos('+2', true);
    } else {
        puntos = puntos + 1;
        select('#contador').html('SONRISAS: ' + puntos);
    }
    actualizarEfectos();

    let posicion = buscarPosicion(personajeClickeado);
    personajeClickeado.x = posicion.x;
    personajeClickeado.y = posicion.y;
}

function actualizarEfectos() {
    if (puntos === 15 || puntos === 30 || puntos === 67 || puntos === 80 || puntos === 100) {
        select('#screamer').addClass('visible');
        musica.stop();
        if (!sonido.isPlaying()) {
            jeremyActivo = true;
            sonido.play();
        }
    }
    if (puntos >= 30) {
        fondoArcoiris = true;
        select('#escena').addClass('arcoiris');
    }

    if (puntos === 100) {
        puntos = 0;
        select('#contador').html('SONRISAS: ' + puntos);
        fondoArcoiris = false;
        select('#escena').removeClass('arcoiris');
    }
}

function windowResized() {
    let zona = select('#escena');
    resizeCanvas(zona.width, zona.height);
}