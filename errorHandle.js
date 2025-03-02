const errorHandle = (res) => {
  const headers = {
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, Content-Length, X-Requested-With",
    "Access-Control-Allow-Origin": "*", //讓所有IP都可造訪
    "Access-Control-Allow-Methods": "PATCH, POST, GET,OPTIONS,DELETE",
    "Content-Type": "application/json", //以JSON格式解析
  };

  res.writeHead(400, headers);

  const jsonContent = JSON.stringify({
    status: "false",
    message: "欄位未填寫正確，或無此 todo id",
  });

  res.write(jsonContent);
  res.end();
};

module.exports = errorHandle;
