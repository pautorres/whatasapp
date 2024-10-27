const { createBot, createProvider, createFlow, addKeyword, addAnswer, EVENTS } = require("@bot-whatsapp/bot");

const QRPortalWeb = require("@bot-whatsapp/portal");
const BaileysProvider = require("@bot-whatsapp/provider/baileys");
const MockAdapter = require("@bot-whatsapp/database/mock");
const path = require("path");
const fs = require("fs");

const menuPath = path.join(__dirname, "mensajes", "menu.txt");
const menu = fs.readFileSync(menuPath, "utf-8");
const flowTalles = addKeyword(EVENTS.ACTION).addAnswer(["Para ver nuestra guía de talles entrá acá: https://nativodelpago.com/guia-de-talles/", "Si tenes más dudas responde '_menu_'."]);

const flowEntregaTrue = addKeyword("entrega").addAnswer("¡Gracias por su compra! Lo pondremos en contacto con un representante. Mientras tanto, por favor, escriba un posible _lugar de encuentro_ o su _domicilio_.");
const flowEntrega = addKeyword(EVENTS.ACTION).addAnswer("Las entregas en Salta Capital se realizan en la Zona Centro de 1 a 3 días habiles.").addAnswer(["Si ya realizo la compra de un artículo y desea coordinar la entrega escriba: *_entrega_*"], null, null, [flowEntregaTrue]);

const flowCamYDevo = addKeyword(EVENTS.ACTION)
	.addAnswer("Gracias por comunicarte. En NATIVO, ofrecemos la posibilidad de realizar cambios o devoluciones en un plazo de 3 días hábiles desde la llegada de tu remera. Estos son los pasos para procesar un cambio o devolución:")
	.addAnswer(["1. *Contáctanos*: Responde a este mensaje o envíanos un correo con tu número de pedido y motivo de cambio/devolución.", "2. *Estado de la prenda*: La remera debe estar sin uso, en su estado original.", "3. *Costos de envío*: Los costos de envío para cambios o devoluciones estarán a cargo del cliente, salvo en caso de que la prenda presente un defecto de fábrica."])
	.addAnswer("Pronto el vendedor se comunicará contigo.");

const flowSeguimiento = addKeyword(EVENTS.ACTION).addAnswer("Si ya realizaste una compra, envianos el código de orden que llegó al mail con el que te registraste en nuestra página.");

const flowAtencion = addKeyword(EVENTS.ACTION).addAnswer(["Comentanos tus dudas.", "El vendedor responderá lo más pronto posible."]);

const menuFlow = addKeyword("menu").addAnswer(menu, { capture: true }, async (ctx, { gotoFlow, fallBack, flowDynamic }) => {
	if (!["1", "2", "3", "4", "5", "0"].includes(ctx.body)) {
		return fallBack("Respuesta no válida, por favor selecciona una de las opciones.");
	}
	switch (ctx.body) {
		case "1":
			return gotoFlow(flowEntrega);
		case "2":
			return gotoFlow(flowTalles);
		case "3":
			return gotoFlow(flowCamYDevo);
		case "4":
			return gotoFlow(flowSeguimiento);
		case "5":
			return gotoFlow(flowAtencion);
	}
});

const main = async () => {
	const adapterDB = new MockAdapter();
	const adapterFlow = createFlow([menuFlow, flowEntrega, flowTalles, flowCamYDevo, flowSeguimiento, flowAtencion]);
	const adapterProvider = createProvider(BaileysProvider);

	createBot({
		flow: adapterFlow,
		provider: adapterProvider,
		database: adapterDB,
	});

	QRPortalWeb();
};

main();
