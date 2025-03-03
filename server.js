const http = require("http");
const errorHandle = require("./errorHandle");
const { v4: uuidv4 } = require("uuid");

const todos = [];

/**
 * @param {*} req 請求者的資料
 * @param {*} res 要回覆的資料
 */

const requestListener = (req, res) => {
  // 要傳給前端的headers(cors表頭)資訊 (開放自訂)
  const headers = {
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, Content-Length, X-Requested-With",
    "Access-Control-Allow-Origin": "*", //讓所有IP都可造訪
    "Access-Control-Allow-Methods": "PATCH, POST, GET,OPTIONS,DELETE",
    "Content-Type": "application/json", //以JSON格式解析
  };

  let body = "";

  //開始接收資料、拼裝
  req.on("data", (chunk) => {
    // console.log("chunk", chunk); //查看TCP封包
    body += chunk;
  });

  //資料接收結束
  //   req.on("end", () => {
  //     console.log(body);
  //   });

  //拜訪3005-首頁給的訊息
  if (req.url === "/todos" && req.method === "GET") {
    res.writeHead(200, headers);
    /**
     * 1. 將 JSON 格式以字串方式傳送 (網路請求只看得懂字串，看不懂物件陣列格式)
     * 2. 外加 headers 已經加入可傳送 json 格式
     * */
    const jsonContent = JSON.stringify({
      status: "success",
      data: todos,
    });
    res.write(jsonContent);
    res.end();
  } else if (req.url === "/todos" && req.method === "POST") {
    req.on("end", () => {
      //加入try catch 可確保程式出錯時，剩餘的 code 仍然會執行
      try {
        const title = JSON.parse(body).title; //在此代表前面 req.on data 請求已結束, 正常來說 body 內會有資料
        if (title !== undefined) {
          const content = {
            title,
            uuid: uuidv4(),
          };
          todos.push(content);

          res.writeHead(200, headers);
          const jsonContent = JSON.stringify({
            status: "success",
            data: todos,
          });
          res.write(jsonContent);
          res.end();
        } else {
          errorHandle(res);
        }
      } catch (error) {
        errorHandle(res);
      }
    });
  } else if (req.url === "/todos" && req.method === "DELETE") {
    todos.length = 0;
    res.writeHead(200, headers);
    const jsonContent = JSON.stringify({
      status: "success",
      data: todos,
    });
    res.write(jsonContent);
    res.end();
  } else if (req.url.startsWith("/todos/") && req.method === "DELETE") {
    const id = req.url.split("/").pop(); //刪除陣列最後一個值並回傳
    const deleteIndex = todos.findIndex((x) => x.uuid === id);
    if (deleteIndex !== -1) {
      res.writeHead(200, headers);
      todos.splice(deleteIndex, 1);
      const jsonContent = JSON.stringify({
        status: "success",
        data: todos,
      });
      res.write(jsonContent);
      res.end();
    } else {
      errorHandle(res);
    }
  } else if (req.method === "OPTIONS") {
    //處理 RESTful API preflight 機制 (會在正式的 request 前先發一個測試的請求確認連線暢通)
    res.writeHead(200, headers);
    res.end();
  } else {
    res.writeHead(404, headers);
    const jsonContent = JSON.stringify({
      status: "false",
      message: "無此頁面路由",
    });
    res.write(jsonContent);
    res.end();
  }
};

//以 createServer 開啟伺服器
const server = http.createServer(requestListener);

server.listen(3005);
