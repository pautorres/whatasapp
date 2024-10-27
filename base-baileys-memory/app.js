const { createBot, createProvider, createFlow, addKeyword, addAnswer, EVENTS } = require("@bot-whatsapp/bot");

const QRPortalWeb = require("@bot-whatsapp/portal");
const BaileysProvider = require("@bot-whatsapp/provider/baileys");
const MockAdapter = require("@bot-whatsapp/database/mock");
const path = require("path");
const fs = require("fs");

const menuPath = path.join(__dirname, "mensajes", "menu.txt");
const menu = fs.readFileSync(menuPath, "utf-8");
const flowTalles = addKeyword(EVENTS.ACTION).addAnswer(["Para ver nuestra guía de talles entre acá: https://nativodelpago.com/guia-de-talles/", "Si tiene más dudas responda '_menu_' u '_hola_'."]);

const flowEntregaTrue = addKeyword("entrega").addAnswer("¡Gracias por su compra! Lo pondremos en contacto con un representante. Mientras tanto, por favor, escriba un posible _lugar de encuentro_ o su _domicilio_.");
const flowEntrega = addKeyword(EVENTS.ACTION).addAnswer("Las entregas en Salta Capital se realizan en la Zona Centro de 1 a 3 días habiles después del pago.").addAnswer(["Si ya realizo la compra de un artículo y desea coordinar la entrega escriba: *_entrega_*. De lo contrario, si tiene otras dudas responda '_menu_' u '_hola_'."], null, null, [flowEntregaTrue]);

const flowCYDTrue = addKeyword("si").addAnswer("Responda con su número de pedido y una foto de los articulos que compró. El vendedor responderá pronto.");

const flowCamYDevo = addKeyword(EVENTS.ACTION)
	.addAnswer("Gracias por comunicarte. En NATIVO, ofrecemos la posibilidad de realizar cambios o devoluciones en un plazo de 4 días hábiles desde la llegada de tu remera.")
	.addAnswer(["Además, la remera debe estar sin uso, en su estado original.", " Los costos de envío para cambios o devoluciones estarán a cargo del cliente, salvo en el caso de que la prenda presente un defecto de fábrica."])
	.addAnswer(["Si desea realizar el proceso de Cambio o Devolución escriba *_si_*. De lo contrario, si tiene otro tipo de dudas responda '_menu_' u '_hola_'."], null, null, [flowCYDTrue]);

const flowSeguimiento = addKeyword(EVENTS.ACTION).addAnswer("Si ya realizaste una compra, envianos el código de orden que llegó al mail con el que te registraste en nuestra página.");

const flowAtencion = addKeyword(EVENTS.ACTION).addAnswer(["Comentanos tus dudas.", "El vendedor responderá lo más pronto posible."]);

const menuFlow = addKeyword(["menu", "hola"]).addAnswer(menu, { capture: true }, async (ctx, { gotoFlow, fallBack, flowDynamic }) => {
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
