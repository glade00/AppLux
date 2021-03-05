// Envoi de la couleur a une PLAYBULB
// couleur sous la forme FFFFFF ou #FFFFFFF
function SendColorAsString(id, htmlcolor) {
    var configData = new Uint8Array(4);
    // test, accepte les chaines avec ou sans le #
    if ((htmlcolor.length === 6) || (htmlcolor.length === 7)) {
        // supprime #
        c = (htmlcolor.replace('#', '')).split('');
        configData[0] = 0x00;
        configData[1] = parseInt((c[0] + c[1]), 16);   // red
        configData[2] = parseInt((c[2] + c[3]), 16);   // green
        configData[3] = parseInt((c[4] + c[5]), 16);   // blue

        // Attention FF01 pour la playbulb rainbow, FF02 pour la playbulb candle
        ble.writeWithoutResponse(id, "FF02", "FFFC", configData.buffer,
            function () {
                console.log("Send command");
            }, function () {
            });
    }
}

// genere une couleur aléatoire
function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


// retourne la couleur moyenne calculée sur 1/5 de l'image au centre
// en augmentant la saturation.
// id : id de l'image
// blockSize : le pas utilisé pour passer d'un pixel à l'autre,
//  si blockSize = 1 on utilise tous les pixels, si la valeur est
//  supérieure, on prend moins de pixels en compte et le calcul est plus rapide
function couleurDominanteImage(id, blockSize) {
    var i = -4,
        r = 0,
        g = 0,
        b = 0,
        fr = 0.0,
        fg = 0.0,
        fb = 0.0,
        count = 0;

    var image = document.getElementById(id);
    var canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    var ctx = canvas.getContext('2d');

    // on recupere 1/5 de l'image au centre
    var w = Math.round(image.width / 10);
    var h = Math.round(image.height / 10);

    ctx.drawImage(image, 4 * w, 4 * h, 2 * w, 2 * h, 0, 0, canvas.width, canvas.height);
    var pix = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    var length = pix.length;

    // boucle pour les sommes. En ajustant blockSize, on peut considerer 1 pixel parmi N
    // si blocksize = 1, tous les pixels sont considéré.
    // un pixel possède un canal alpha qui n'est pas pris en considération.
    while ((i += blockSize * 4) < length) {
        ++count;
        fr += pix[i];
        fg += pix[i + 1];
        fb += pix[i + 2];
    }

    // calcul des moyennes par canal couleur
    fr = fr / count;
    fg = fg / count;
    fb = fb / count;

    // augmente la  saturation
    // si la valeur minimale de r,g,b n'est pas 0, il y présence de "blanc" que l'on retire
    var min = Math.min(fr, fg, fb);
    var max = Math.max(fr, fg, fb)
    var gain = max / (max - min);

    // arrondi inférieur pour ne pas depasser 255
    r = Math.floor((fr - min) * gain);
    g = Math.floor((fg - min) * gain);
    b = Math.floor((fb - min) * gain);

    color = rgbToHex(r, g, b);
    //alert(w+' '+h+':'+color);
    return (color);
}

// retourne la couleur r,g,b sous forme de chaine de caractères SANS #
function rgbToHex(r, g, b) {
    return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}