'use strict'

const express = require('express');
const bodyParser= require('body-parser');
const request = require('request');

const app= express();
const access_token='EAAgXUDcQNOwBAOZAbMLppqziwZB1tk4TTV5B0iN8ZCoQyb1xlHyMRZBhDPsisOg4AQ4YROGGCcreDuKpD7Ejb7MqdeyBOZApHiEjecUJ0TV5wI5AcMAS7BVCtoh9t0ZBkn2zDHnUamGsO9BZA16wuOUZAFIe6hQPgWsm0HSPfVkCEgZDZD';
const hook_tocket='ssr_tokken';
app.set('port',3000);
app.use(bodyParser.json());

app.get('/', function(req,resp){
    resp.send('Saludos desde ChatBot');
});

app.get('/webhook',function(req,resp){
    if(req.query['hub.verify_token']===hook_tocket){
        resp.send(req.query['hub.challenge']);
    }else{
        resp.send('no tienes permisos')
    }
});
app.post('/webhook/', function(req,resp){
    const webhook_event=req.body.entry[0];// se toma la posión cero, allí está el mensaje
    if(webhook_event.messaging){
            webhook_event.messaging.forEach(event => {
                console.log(event);
                //handleMessage(event);
                handleEvent(event.sender.id, event);
            });
    }
    resp.sendStatus(200);// confirmemos recibido
});

function callSendApi(response){
    request({
        "uri":"https://graph.facebook.com/me/messages/",
        "qs":{
            "access_token": access_token   
        },
        "method":"POST",
        "json":response
    },function(err){
        if(err){
            console.log("Ha ocurrido un error");
        }else{
            console.log("Mensaje Enviado");
        }

    }
    
    );
}

function handleEvent(senderId, event) {
    if (event.message) {
        if (event.message.quick_reply) {
            handlePostBack(senderId, event.message.quick_reply.payload);
        } else {
            handleMessage(senderId, event.message);
        }
    }
    else if (event.postback) {
        handlePostBack(senderId, event.postback.payload);
    }
}

function handlePostBack(senderId, payload) {
    switch (payload) {
        case"GET_STARTED_BARVADER": 
            console.log(payload)
        break;

        case"ABOUT_PAYLOAD":
            showButton(senderId);
        break;

        case"ASKBEER_PAYLOAD":
            console.log(payload);
        break;

        case "CONTACT_PAYLOAD":
            contactSuppport(senderId);
        break;
        case "HELP_PAYLOAD":
            showLocations(senderId);
        break;
        
    }
}
function handleText(senderId, Text) {
    switch (Text) {
        case "muestrame una imagen":
            messageImage(senderId);
            break;
        case "pago":
            modoPago(senderId);
            break;        
        case "ubicación":
            getLocation(senderId);
            break;
        default:
            defaultMessage(senderId);
            break;

    }
}


//simula las acciones de escribiendo, etc, para simular que es una persona el que escribe
function senderActions(senderId) {
    const messageData = {
        "recipient": {
            "id": senderId
        },
        "sender_action": "typing_on"
    }
    callSendApi(messageData);
}



function showButton(senderId){
    const messageData = {
        "recipient": {
            "id": senderId
        },
        "message": {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "large",
                    "elements": [
                        {
                            "title": "acerca de las academias en DHIs",
                            "subtitle": "DHIS  realiza academias en todo el mundo ",
                            "image_url": "https://pbs.twimg.com/media/DJmUAd-WsAEtUob.jpg",
                            "buttons":[
                                   {
                                       "type:":"postback",
                                       "title":"academias DHIS2",
                                       "payload":"ELEGIR_OPCION_BOTON1"
                                    }

                            ]
                        },
                        {
                            "title": "el menú de DHIS",
                            "subtitle": "el menú de DHIS2 ",
                            "image_url": "https://docs.dhis2.org/2.25/en/developer/html/resources/images/apps/top-menu.png",
                            "buttons":[
                                   {
                                       "type:":"postback",
                                       "title":"imagen del menu",
                                       "payload":"ELEGIR_OPCION_BOTON2"
                                    }

                            ]
                        }
                    ]
                }
            }
        }
    }
    senderActions(senderId);
    setTimeout(() => callSendApi(messageData), 1000);

}

function handleMessage(senderId, event){
    if(event.text){
        handleText(senderId, event.text);
    }

}

//como enviar mensajes por defectos y respuestas rápidas
function defaultMessage(senderId) {
    const messageData = {
        "recipient": {
            "id": senderId
        },
        "message": {
            "text": "Hola soy un bot, te invito a utilizar nuestro menu",
            "quick_replies": [
                {
                    "content_type": "text",
                    "title": "Geolocalización",
                    "payload": "HELP_PAYLOAD"
                },
                {
                    "content_type": "text",
                    "title": "Acerca de",
                    "payload": "ABOUT_PAYLOAD"
                }
            ]
        }
    }
    senderActions(senderId);
    //esto lo añadí yo para darle mas timpo con la acción de typing
    //callSendApi(messageData);
    setTimeout(() => callSendApi(messageData), 1000);
    
}

function messageImage(senderId) {
    const messageData = {
        "recipient": {
            "id": senderId
        },
        "message": {
            "attachment": {
                "type": "image",
                "payload": {
                    "url": "https://media.giphy.com/media/1dOIvm5ynwYolB2Xlh/giphy.gif"
                }
            }
        }
    }
    callSendApi(messageData);
}

function contactSuppport(senderId) {
    const messageData = {
        "recipient": {
            "id": senderId
        },
        "message": {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "button",
                    "text": "Hola este es el canal de soporte, ¿quieres llamarnos?",
                    "buttons": [
                        {
                            "type": "phone_number",
                            "title": "Llamar a un asesor",
                            "payload": "+573122594780"
                        }
                    ]
                }
            }
        }
    }
    callSendApi(messageData);
}

function showLocations(senderId) {
    const messageData = {
        "recipient": {
            "id": senderId
        },
        "message": {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "list",
                    "top_element_style": "large",
                    "elements": [
                        {
                            "title": "Sucursal Mexico",
                            "image_url": "https://s3.amazonaws.com/chewiekie/img/productos-pizza-peperoni-champinones.jpg",
                            "subtitle": "Direccion bonita #555",
                            "buttons": [
                                {
                                    "title": "Ver en el mapa",
                                    "type": "web_url",
                                    "url": "https://goo.gl/maps/GCCpWmZep1t",
                                    "webview_height_ratio": "full"
                                }
                            ]
                        },
                        {
                            "title": "Sucursal Colombia",
                            "image_url": "https://s3.amazonaws.com/chewiekie/img/productos-pizza-peperoni-champinones.jpg",
                            "subtitle": "Direccion muy lejana #333",
                            "buttons": [
                                {
                                    "title": "Ver en el mapa",
                                    "type": "web_url",
                                    "url": "https://goo.gl/maps/GCCpWmZep1t",
                                    "webview_height_ratio": "tall"
                                }
                            ]
                        }
                    ]
                }
            }
        }
    }
    callSendApi(messageData);
}

function modoPago(senderId) {
    const messageData = {
        "recipient": {
            "id": senderId
        },
        "message": {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "receipt",
                    "recipient_name": "Oscar Barajas",
                    "order_number": "123123",
                    "currency": "MXN",
                    "payment_method": "Efectivo",
                    "order_url": "https://platzi.com/order/123",
                    "timestamp": "123123123",
                    "address": {
                        "street_1": "Platzi HQ",
                        "street_2": "---",
                        "city": "Mexico",
                        "postal_code": "543135",
                        "state": "Mexico",
                        "country": "Mexico"
                    },
                    "summary": {
                        "subtotal": 12.00,
                        "shipping_cost": 2.00,
                        "total_tax": 1.00,
                        "total_cost": 15.00
                    },
                    "adjustments": [
                        {
                            "name": "Descuento frecuent",
                            "amount": 1.00
                        }
                    ],
                    "elements": [
                        {
                            "title": "Pizza Pepperoni",
                            "subtitle": "La mejor pizza de pepperoni",
                            "quantity": 1,
                            "price": 10,
                            "currency": "MXN",
                            "image_url": "https://s3.amazonaws.com/chewiekie/img/productos-pizza-peperoni-champinones.jpg"
                        },
                        {
                            "title": "Bebida",
                            "subtitle": "Jugo de Tamarindo",
                            "quantity": 1,
                            "price": 2,
                            "currency": "MXN",
                            "image_url": "https://s3.amazonaws.com/chewiekie/img/productos-pizza-peperoni-champinones.jpg"
                        }
                    ]
                }
            }
        }
    }
    callSendApi(messageData);
}

function getLocation(senderId){
    const messageData = {
        "recipient": {
            "id": senderId
        },
        "message": {
            "text": "Ahora ¿Puedes proporcionarnos tu ubicación?",
            "quick_replies": [
                {
                    "content_type": "location"
                }
            ]
        }
    }
    callSendApi(messageData);
}
app.listen(app.get('port'),function(){
    console.log('app corre como flash en el puerto '+ app.get('port'))
});