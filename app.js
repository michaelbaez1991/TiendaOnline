var express = require('express')
const oApp = express()
const port = 3000
const mysql = require('mysql');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

oApp.use(express.json());  
oApp.use(express.urlencoded({ extended: true }));

// CONFIGURACION PARA CONEXION A LA BASE DE DATOS
const oMyConnection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    database: 'tiendaonline'   
});

oApp.post('/upload', multipartMiddleware, function(req, resp) {
    // console.log(req.body, req.files);
    console.log(req.body.ejemplo);
    // don't forget to delete all req.files when done
});

// ALL METHOD REQUEST GET - POST - PUT - DELETE
oApp.all('/producto', function (req, res, next) {
    var oDataOP = {};  
    oDataOP = req.body;
    console.log(req.body);
  
    switch (req.method) {
      case 'GET':
        var sSQLGetAll = "SELECT * FROM gatos";
        oMyConnection.query(sSQLGetAll, function (error, results, fields) {
          if (error) throw error;
          res.write(JSON.stringify(results));
          res.end();
        });
        break;
  
      case 'POST':
        var sSQLCreate = "INSERT INTO producto (sku, nombre, descripcion, foto, precio, iva) VALUES (";
          sSQLCreate += "'" + oDataOP.sku + "', ";
          sSQLCreate += "'" + oDataOP.nombre + "', ";
          sSQLCreate += "'" + oDataOP.descripcion + "', ";
          sSQLCreate += "'" + oDataOP.foto + "', ";
          sSQLCreate += "'" + oDataOP.precio + "', ";
          sSQLCreate += "'" + oDataOP.iva + "')";
            
          oMyConnection.query(sSQLCreate, function (error, results, fields) {
            if (error) throw error;
            var iIDCreated = results.insertId;
            res.write(JSON.stringify({
              error: false,
              idCreated: iIDCreated
            }));
            res.end();
          });  
        break;
      
      case 'PUT':
        var sSQLUpdate = "UPDATE gatos SET ";
        if(oDataOP.hasOwnProperty('nombre')) {
          sSQLUpdate += "nombre = '" + oDataOP.nombre + "' ";
        }
  
        if(oDataOP.hasOwnProperty('raza')) {
          sSQLUpdate += ", raza = '" + oDataOP.raza + "' ";
        }
  
        if(oDataOP.hasOwnProperty('color')) {
          sSQLUpdate += ", color = '" + oDataOP.color + "' ";
        }
  
        if(oDataOP.hasOwnProperty('edad')) {
          sSQLUpdate += ", edad = " + oDataOP.edad + " ";
        }
  
        if(oDataOP.hasOwnProperty('peso')) {
          sSQLUpdate += ", peso = " + oDataOP.peso + " ";    
        }   
  
        sSQLUpdate += " WHERE id_gato = " + oDataOP.idgato;
        oMyConnection.query(sSQLUpdate, function (error, results, fields)  {
          if (error) throw error; 
          // res.write(JSON.stringify(results));
          res.write(JSON.stringify({
            error: false,
            result: results
          }));
          res.end();
        });
        break;
      
      case 'DELETE':
        var sSQLDelete = "DELETE FROM gatos WHERE id_gato = " + oDataOP.idgato;
        oMyConnection.query(sSQLDelete, function (error, results, fields) {
          if (error) throw error;
          res.write(JSON.stringify({
            error: false,
            result: results
          }));
          res.end();      
        });  
        break;
      
      default:
        res.write(JSON.stringify({ 
          error: true, 
          error_message: 'Debes proveer una operación correcta' 
        }));
        res.end();
        break;
    }
    // next(); // pass control to the next handler
});

// PUERTO ESCUCHA DE LA APP
oApp.listen(port, function(oReq, oRes) {
    console.log("Servicios web gestión de la tienda activo en el puerto 3000");   
});