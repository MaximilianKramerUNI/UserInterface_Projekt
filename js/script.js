// Globales cart-Array
var cart = [];

$(document).ready(function() {

    // Im LocalStorage nach einem Warenkorb-Eintrag suchen
    if (localStorage.getItem('cart'))
    {
        // Warenkorb in das globale cart-Array übernehmen
        cart = JSON.parse(localStorage.getItem('cart'));
    }
    
    // Warenkorb-Button aktualisieren
    updateCart();

    // Warenkorb anzeigen (falls ein Element mit der id cart auf der Webseite angezeigt wird)
    renderCart();

    // Wenn ein Button mit der Klasse 'buy-button' geklickt wird
    $('section').on('click', '.buy-button', function() {

        // Suche das erste Parent-'article' Element zum geklickten Button (über mehrere Ebenen nach oben in der Hierarchie)
        var article = $(this).parents('article').first();

        // Wenn 'article'-Element für Artikel gefunden wurde
        if (article.length == 1)
        {
            // Artikel zum Warenkorb hinzufügen
            addToCart(article);
        }
        
    })

    // Wenn ein Button mit der Klasse 'remove-button' geklickt wird
    $('#cart').on('click', '.remove-button', function() {
        // Abfrage, ob wirklich gelöscht werden soll (Shneiderman 5, 6, 7 !!!!!!!!)
        if (confirm('Wirklich löschen?'))
        {
            // Suche das erste Parent-'article' Element zum geklickten Button (über mehrere Ebenen nach oben in der Hierarchie)
            var articleId = parseInt($(this).data('id'), 10);

            // Wenn 'article'-Element für Artikel gefunden wurde
            if (articleId > 0)
            {
                // Artikel aus dem Warenkorb entfernen
                removeFromCart(articleId);
            }
        }
    })
})


/* WARENKORB FUNKTIONEN */

// HTML-Code des Warenkorbs erzeugen und anzeigen
function renderCart()
{
    // Suche nach einem Element mit der ID cart
    var cartElement = $('#cart');
    if (cartElement.length == 1)
    {
        // Variable für Quelltext initialisieren
        var html = '';
        // Wenn mindestens ein Produkt im Warenkorb liegt
        if (cart.length > 0)
        {
            // Variable für Gesamtpreis auf 0.0 setzen
            var completePrice = 0.0;
            
            // Beginn des HTML-Quelltextes der Warenkorb-Tabelle
            html = `<table class="table table-striped">
                  <thead>
                    <tr>
                      <th>Position</th>
                      <th>Artikelnummer</th>
                      <th>Artikel</th>
                      <th>Anzahl</th>
                      <th>Einzelpreis</th>
                      <th>Preis</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>`;
            // Durch alle Artikel im Warenkorb iterieren
            for (var i = 0; i < cart.length; i++)
            {
                // Für jeden Artikel eine Zeile erzeugen mit 
                // Artikelnummer, Artikelname, Anzahl, Einzelpreis, Gesamtpreis, Button zum Löschen
                // Artikelnummer: cart[i].articlenumber
                // Anzahl: cart[i].amount
                html += `
                <tr>
                    <td>${i+1}</td>
                    <td>${cart[i].articlenumber}</td>
                    <td>${cart[i].articlename}</td>
                    <td>${cart[i].amount}</td>
                    <td>${formatNumber(cart[i].price)}€</td>
                    <td>${formatNumber(cart[i].amount*cart[i].price)}€</td>
                    <td><button class="btn btn-danger remove-button" data-id="${cart[i].id}">Löschen</button></td>
                </tr>`;
                // Gesamtpreis aufaddieren
                completePrice+=cart[i].price*cart[i].amount;
            }
                    
                // HTML-Code der Tabelle vervollständigen und in den tfoot-Bereich den Gesamtpreis des Warenkorbes schreiben
                html += `</tbody>
                    <tfoot>
                        <tr>
                            <td></td>
                            <td><strong>Gesamtpreis<strong></td>
                            <td><strong>${formatNumber(completePrice)}€</strong></td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>`;


            if (completePrice > 1000)        //Feuerwerk
            {
                firework()
            }
        }
        // Keine Artikel im Warenkorb
        else
        {
            // HTML-Quelltext für Anzeige, dass keine Artikel im Warenkorb sind
            html = '<p><strong>Keine Artikel im Warenkorb.<strong><p>';
        }
    
        // HTML-Quelltext in das Element mit der ID cart schreiben
        cartElement.first().html(html);
    }
}

// Funktion zum Hinzufügen eines Artikels in den Warenkorb
function addToCart(article)
{
    // Artikeldaten aus den Custom-Data-Attributen des article-Elementes beziehen
    var articleData = article.data();

    // Nur, wenn Preis, ID, Artikelnummer und Artikelname vorliegen
    if (articleData.price && articleData.id && articleData.articlenumber && articleData.articlename)
    {
        // Suche nach einem Input mit der Klasse 'amount' (über mehrere Ebenen nach unten in der Hierarchie)
        var input = article.find('input.amount').first();

        // Anzahl-Formularfeld bereinigen und zu integer casten
        var amount = parseInt(input.val().replace(',', '.').replace('e', ''), 10);

        // Preis noch einmal zu float casten
        var price = parseFloat(articleData.price);

        // Wenn eine Anzahl größer als 0 eingegeben wurde
        if (amount > 0)
        {
            // Wir suchen den Artikel im aktuellen Warenkorb (um die Anzahl anzupassen)
            var articleInCart = cart.find( function (element) {return element.id == parseInt(article.data('id'), 10)});
            
            // Artikel ist bereits im Warenkorb
            if (articleInCart)
            {
                articleInCart.amount+=amount;
            }
            // Artikel ist noch nicht im Warenkorb
            else
            {
                // Artikel-Objekt erstellen und in den Warenkorb legen
                var articleData = {
                    'id': articleData.id, 
                    'articlenumber': articleData.articlenumber, 
                    'articlename': articleData.articlename,
                    'amount': amount,
                    'price': price
                };
                cart.push(articleData);
                
            }         

            // Warenkorb speichern
            persist();
        }
        // Wenn eine Anzahl kleiner oder gleich 0 ist
        else
        {
            // Fehlerausgabe
            alert('Bitte schließen und eine Anzahl eingeben.');
        }

        // Suche nach einem Input mit der Klasse 'amount' (über mehrere Ebenen nach unten in der Hierarchie)
        // und Wert auf leeren String setzen (löschen)
        article.find('input.amount').val('');
    }
}

// Funktion zum Entfernen eines Artikels aus dem Warenkorb
function removeFromCart(articleId)
{
    // Wenn die übergebene Artikel-ID größer als 0 ist
    if (articleId > 0)
    {
        // Nach dem Artikel im Warenkorb suchen (Bedingung: ID des Artikels muss der übergebenen Artikel-ID entsprechen)
        var cartArticle = cart.find(function(article) {
            return article.id == articleId;
        });
        
        // Wenn ein Artikel gefunden wurde
        if (cart.indexOf(cartArticle) > -1)
        {
            // Artikel aus dem Array entfernen
            cart.splice(cart.indexOf(cartArticle), 1);
        }
        // Daten im LocalStorage speichern
        persist();
        // Tabelle neu aufbauen und anzeigen
        renderCart();
        
    }
}

/* HILFSFUNKTIONEN */

// Funktion zum Aktualisieren des Warenkorb-Links (Badge mit Anzahl der verschiedenen Produkte im Warenkorb)
function updateCart()
{
    // Anzahl initialisieren
    var amount = 0;

    // Wenn mindestens ein Produkt im Warenkorb liegt
    if (cart.length > 0)
    {
        // Durch alle Artikel im Warenkorb iterieren
        for (var i = 0; i < cart.length; i++)
        {
            // Die Anzahl der einzelnen Produkte im Warenkorb aufaddieren
            amount += cart[i].amount;
        }
        // Badge anzeigen
        $('#cart_amount').removeClass('d-none');    
    }
    // Keine Artikel im Warenkorb
    else
    {
        // Badge verstecken
        $('#cart_amount').addClass('d-none');    
    }
    // Anzahl in Badge schreiben
    $('#cart_amount').html(amount);
}

// Funktion zum Speichern des Warenkorbs im LocalStorage
function persist()
{
    // LocalStorage mit Warenkorb-Array befüllen
    localStorage.setItem('cart', JSON.stringify(cart));
    // Warenkorb-Button aktualisieren
    updateCart();
}

// Funktion zum Formatieren einer Nummer in das deutsche Format xxxxxxx, xx
function formatNumber(number)
{
    return number.toFixed(2).replace('.', ',');
}


// Funktion für Konfetti-Party, Inhalt übernommen von https://confetti.js.org/more.html
function firework()
{
    const duration = 15 * 1000,
    animationEnd = Date.now() + duration,
    defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
        return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    // since particles fall down, start a bit higher than random
    confetti(
        Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        })
    );
    confetti(
        Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        })
    );
    }, 250);
}

// Prompts die genutzt wurden:
// "Erstelle mir den Code für javaScript mit allen Funktionen, welche für einen Warenkorb nötig sind (hinzufügen und löschen von artikeln, Feuerwerkanimation ab 1000 Euro) und zeige mir wie ich ihn einfüge"
//Zeige mir die Grundbefehle in JavaScript