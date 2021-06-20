var uuid = require("uuid");
var nacl = require("tweetnacl");
var util = require("tweetnacl-util");
var base32 = require("thirty-two");
var QRCode = require("qrcode-svg");
var totp = require("notp").totp;
var express = require("express");
var app = express();

const PERIOD = 16;

// Some pseudo-random MFA secret (must be stored in a vault later)
var MFASecret = util.encodeBase64(nacl.randomBytes(32));

// encoded will be the secret key, base32 encoded
var encoded = base32.encode(MFASecret);

// Google authenticator doesn't like equal signs
var encodedForGoogle = encoded.toString().replace(/=/g, "");

// to create a URI for a qr code (change totp to hotp is using hotp)
var uri = `otpauth://totp/YagoDorea:yago.dorea@gmail.com?secret=${encodedForGoogle}&issuer=YagoDorea&algorithm=SHA1&digits=6&period=${PERIOD}`;
console.log("MFA uri:", uri);

// Build QRCode in ASCII
// var modules = new QRCode(uri).qrcode.modules;
// var ascii = '';
// var length = modules.length;
// for (var y = 0; y < length; y++) {
//   for (var x = 0; x < length; x++) {
//     var module = modules[x][y];
//     ascii += (module ? '\u2592\u2592' : '  ');
//   }
//   ascii += '\r\n';
// }
// Print QRCode to log
// console.log(ascii);

// Build QRCode in SVG
var qrcode = new QRCode(uri);
var svg = qrcode.svg();
// document.getElementById("container").innerHTML = svg;

// Creates server to get/check token
app.get("/", (req, res) => {
  // [...] Retrieve MFASecret from vault
  var currToken = totp.gen(MFASecret, { time: PERIOD });
  res.send({ timestamp: Date.now(), token: currToken });
});

app.get("/svg", (req, res) => {
  res.set("Content-type", "image/svg+xml");
  res.status(200).send(svg);
});

app.post("/:token", (req, res) => {
  const token = req.params.token;
  // [...] Retrieve MFASecret
  console.log(req.query && req.query.MFASecret ? base32.decode(req.query.MFASecret).toString() : MFASecret)
  const currToken = totp.gen(
    req.query && req.query.MFASecret ? base32.decode(req.query.MFASecret).toString() : MFASecret,
    { time: PERIOD }
  );
  const verify = totp.verify(
    token,
    req.query && req.query.MFASecret ? base32.decode(req.query.MFASecret).toString() : MFASecret,
    { time: PERIOD }
  );
  console.log(verify);
  res.status(200).send(verify ? verify : currToken);
});

app.listen(9999);
