const Router = require('express').Router();
const xmlparser = require('express-xml-bodyparser');
const bodyparser = require('body-parser');


Router.use(xmlparser());
Router.use(bodyparser.urlencoded());
Router.use(bodyparser.json());

const mainController = require('../controllers/main');

Router.get("/getAddOrder", mainController.getAddOrder);

Router.post("/postProcessedOrder", mainController.postProcessedOrder);

Router.post("/postRequestInvoice", mainController.postRequestInvoice);

Router.post("/postDeleteOrder", mainController.postDeleteOrder);

Router.post("/getAllOrders", mainController.getAllOrders);

module.exports = Router;
