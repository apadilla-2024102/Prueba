// Usuarios del panel de administración (/admin).
// Las contraseñas no se guardan tal cual: solo su huella cifrada (scrypt con sal).
// Para cambiar una contraseña, genera la huella nueva con:
//   node -e 'const c=require("crypto");const s=c.randomBytes(16).toString("hex");console.log(s, c.scryptSync("NUEVA",s,64).toString("hex"))'
// y reemplaza sal y hash del usuario.
module.exports = [
    { usuario: "andreaSparkle", sal: "2cf0ad8515f78e72f8606819b31a5fcb", hash: "61778a1a96ddd646aac0e21d8f7e3ad020093280823ba2a8bbcbe4983c65849bc020761d7bd20260336c6f71fd98c7c3a9ac3a4364d0116839ccd66b4b4e6b37" },
    { usuario: "OdraSparkle", sal: "e60834ab4413f285a7e1f901b45370fc", hash: "3dfbacdc695dfb5b8fe4c88095811ecf950c1b254620aa7b61d60611a7de1b40f6f4db4aef3df3db1e8248b34af62ac7b0b13374b7580e6eae8ee3b7a2068356" },
    { usuario: "GahelSparkle", sal: "a124b9e97c96906f40a71e07bef9f983", hash: "de4bcaf52cc42efac02a65069c18fc5f5ca04ddacbc789ea8e588fb050fe92cf81617c130d5d38bc25a0b00f79f9a98542526ef942b522e49ad3c9ef7b748f85" },
];
