
const request = require('request');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const soap = require('soap');


function createpdfOrder(xmlData, res) {
    let parsed_data = xmlData["OrderDetails"];
    console.log("Parsed Data", parsed_data);

    let orderName, orderPath;
    orderName = 'invoice-' + parsed_data["name"] + '.pdf';
    orderPath = path.join('data', orderName);

    const pdfDoc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
        'Content-Disposition',
        'inline; filename="' + orderName + '"'
    );
    // sending a stream of the pdf
    pdfDoc.pipe(fs.createWriteStream(orderPath));
    pdfDoc.pipe(res);

    pdfDoc.fontSize(26).text('Factura', {
        underline: true
    });
    pdfDoc.text('-----------------------');

    pdfDoc
        .fontSize(14)
        .text(
            parsed_data["description"] +
            parsed_data["price"]
        );
    pdfDoc.text('---');
    pdfDoc.fontSize(20).text('Total Price: $' + parsed_data["price"]);

    pdfDoc.end();

}

exports.getAddOrder = (req, res, next) => {
    res.render('add_order', {
        pageTitle: "Add Order"
    })
}

exports.postProcessedOrder = (req, res, next) => {
    let description = req.body.description;
    let name = req.body.name;
    let price = req.body.price;

    console.log("Req body", req.body);

    const url = 'http://localhost:8080/ws/orders.wsdl';
    const args = { name: name, description: description, price: price };

    soap.createClient(url, function (err, client) {
        if (err) console.error(err);
        else {
            client.AddOrderDetails(args, function (err, response) {
                if (err) console.error(err);
                else {
                    console.log("Wsdl response", response);
                    res.send(response);
                }
            });
        }
    })
}

exports.postDeleteOrder = (req, res, next) => {
    let orderId = req.body.id;

    const url = 'http://localhost:8080/ws/orders.wsdl';
    const args = { id: orderId };
    soap.createClient(url, function (err, client) {
        if (err) console.error(err);
        else {
            client.DeleteOrderDetails(args, function (err, response) {
                if (err) console.error(err);
                else {
                    console.log("Wsdl response", response);
                    res.status(200).json({ message: response });
                }
            });
        }
    })
}

exports.getAllOrders = (req, res, next) => {

    const url = 'http://localhost:8080/ws/orders.wsdl';
    soap.createClient(url, function (err, client) {
        if (err) console.error(err);
        else {
            client.GetAllOrderDetails({}, function (err, response) {
                if (err) console.error(err);
                else {
                    console.log("Wsdl response", response);
                    res.status(200).json({ message: response });
                }
            });
        }
    })

}

exports.postRequestInvoice = (req, res, next) => {
    // primim un XML cu datele comenzii
    // aici trimitem datele XML către serviciul de parsare xml si folosim 
    // datele JSON primite ca sa cream un PDF cu factura
    //ezpz
    let orderId = req.body.id;

    const url = 'http://localhost:8080/ws/orders.wsdl';
    const args = { id: orderId };
    soap.createClient(url, function (err, client) {
        if (err) console.error(err);
        else {
            client.GetOrderDetails(args, function (err, response) {
                if (err) console.error(err);
                else {
                    console.log("Wsdl response", response);
                    createpdfOrder(response, res);
                }
            });
        }
    })

    /*
    let parsedData = {};

    const xmlData = req["rawBody"];
    console.log("Postman request", req);
    request.post(
        'http://localhost:3000/parseXml',
        {
            json: { xml: xmlData }
        },
        function (err, response, body) {
            parsedData = JSON.parse(response.body["result"]);
            console.log("Parsed data", parsedData);
            createpdfOrder(parsedData);
        }
    )
    */
}

/*
TODO don't repeat the connection to wsdl
function wsdlConnection() {

}
*/