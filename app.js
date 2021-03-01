var express = require('express')
const oApp = express()
const port = 3000
const mysql = require('mysql');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var path = require('path');
var fs = require('fs');

oApp.use(express.json());  
oApp.use(express.urlencoded({ extended: true }));

// CONFIGURACION PARA CONEXION A LA BASE DE DATOS
const oMyConnection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    database: 'tiendaonline'   
});

// ALL METHOD REQUEST GET - POST - PUT - DELETE
oApp.all('/producto', multipartMiddleware, function (req, res, next) {
    var oDataOP = {};  
    oDataOP = req.body;

    // VALIDO LA EXITENCIA DEL LA IMAGEN 
    if (req.method == "POST" || req.method == "PUT") {
        if (req.files.foto) {
            var nombreNuevo = oDataOP.nombre; // NOMBRE QUE LLEVARA EL ARCHIVO
            var rutaArchivo = req.files.foto.path; // GUARDAR EN ARCHIVOS TMP
            var nuevaRuta = "public/imgproductos/" + nombreNuevo + path.extname(rutaArchivo).toLowerCase(); // CONSTRUYO LA RUTA DONDE SE GUARDARA
            fs.createReadStream(rutaArchivo).pipe(fs.createWriteStream(nuevaRuta)); // COPIA EL ARCHIVO DE TMP A LA NUEVA RUTA
        }
    }
  
    switch (req.method) {
      case 'GET':
        var sSQLGetAll = "SELECT * FROM producto";
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
          sSQLCreate += "'" + nuevaRuta + "', ";
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
        var sSQLUpdate = "UPDATE producto SET ";
        if(oDataOP.hasOwnProperty('sku')) {
          sSQLUpdate += "sku = '" + oDataOP.sku + "'";
        }
  
        if(oDataOP.hasOwnProperty('nombre')) {
          sSQLUpdate += ", nombre = '" + oDataOP.nombre + "'";
        }
  
        if(oDataOP.hasOwnProperty('descripcion')) {
          sSQLUpdate += ", descripcion = '" + oDataOP.descripcion + "'";
        }

        if (req.method == "POST" || req.method == "PUT") {
            if (req.files.foto) {
                sSQLUpdate += ", foto = '" + nuevaRuta + "'";
            }
        }

        if(oDataOP.hasOwnProperty('precio')) {
            sSQLUpdate += ", precio = " + oDataOP.precio + "";
        }
  
        if(oDataOP.hasOwnProperty('iva')) {
          sSQLUpdate += ", iva = " + oDataOP.iva + "";    
        }   

        sSQLUpdate += " WHERE id = " + oDataOP.id;
        console.log(sSQLUpdate);
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
        var sSQLDelete = "DELETE FROM producto WHERE id = " + oDataOP.id;
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
});

oApp.post('/venta', function (req, res) {
    var oDataOP = {};  
    oDataOP = req.body;

    var sSQLGetAll = "SELECT MAX(id) AS id FROM venta";
    oMyConnection.query(sSQLGetAll, function (error, results, fields) {
        var id = (results[0].id + 1);

        var sSQLCreate = "INSERT INTO venta (numero_factura, cliente, telefono, email, subtotal, iva, gran_total) VALUES (";
        sSQLCreate += "'" + id + "', ";
        sSQLCreate += "'" + oDataOP.cliente + "', ";
        sSQLCreate += "'" + oDataOP.telefono + "', ";
        sSQLCreate += "'" + oDataOP.email + "', ";
        sSQLCreate += "'" + oDataOP.subtotal + "', ";
        sSQLCreate += "'" + oDataOP.iva + "', ";
        sSQLCreate += "'" + oDataOP.gran_total + "')";
        
        oMyConnection.query(sSQLCreate, function(oError, oRows, oCols) {
            if (error) throw error;
            var iIDCreated = results.insertId; 
        });  
    });
});

function relationProductsOrders(venta_id, producto_id, cantidad, valor_unitario, iva){
    var valorUnitarioTotal = (valor_unitario * cantidad);
    var valorIvaTotal = (iva * cantidad);
    var sSQLCreate = "INSERT INTO productos_vendidos (venta_id, producto_id, cantidad, valor_unitario, iva, valor_total) VALUES (";
    sSQLCreate += "" + venta_id + ", ";
    sSQLCreate += "" + producto_id + ", ";
    sSQLCreate += "" + cantidad + ", ";
    sSQLCreate += "" + valor_unitario + ", ";
    sSQLCreate += "" + iva + ", ";
    sSQLCreate += "" + (valorUnitarioTotal + valorIvaTotal ) + ")";
    
    oMyConnection.query(sSQLCreate, function(error, results, fields) {
        if (error) throw error;
        return results;
    });
}

// PUERTO ESCUCHA DE LA APP
oApp.listen(port, function(oReq, oRes) {
    console.log("Servicios web gestión de la tienda activo en el puerto 3000");   
});