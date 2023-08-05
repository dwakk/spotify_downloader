const string = "大好きの世界"

const buffer = Buffer.from(string, "utf-8")

//backend (nodejs)
const bufferData = Buffer.from("coucou", "utf-8")
const buffer64 = bufferData.toString("base64")

//frontend (vue)
const receivedData = Buffer.from(buffer64, "base64")
console.log(receivedData.toString("utf-8"))