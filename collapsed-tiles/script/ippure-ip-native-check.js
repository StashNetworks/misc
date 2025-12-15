async function request(method, params) {
  return new Promise((resolve) => {
    const httpMethod = $httpClient[method.toLowerCase()];
    httpMethod(params, (error, response, data) => {
      resolve({ error, response, data });
    });
  });
}

function isChinese() {
  const lang = ($environment.language || "").toLowerCase();
  return lang.startsWith("zh");
}

async function main() {
  const url = "https://my.ippure.com/v1/info";
  const { error, response, data } = await request("GET", url);

  if (error || !data) {
    $done({
      content: isChinese() ? "网络错误" : "Network Error",
      backgroundColor: "#C44",
    });
    return;
  }

  let json;
  try {
    json = JSON.parse(data);
  } catch {
    $done({
      content: isChinese() ? "无效 JSON" : "Invalid JSON",
      backgroundColor: "#C44",
    });
    return;
  }

  const isRes = Boolean(json.isResidential);
  const isBrd = Boolean(json.isBroadcast);

  // 中英文文本
  const resText = isChinese()
    ? (isRes ? "住宅" : "机房")
    : (isRes ? "Residential" : "DC");

  const brdText = isChinese()
    ? (isBrd ? "广播" : "原生")
    : (isBrd ? "Broadcast" : "Native");

  // 颜色：绿 优 → 黄 中 → 红 差
  let color = "#88A788"; // 绿
  if ((isRes && isBrd) || (!isRes && !isBrd)) {
    color = "#D4A017"; // 黄
  }
  if (!isRes && isBrd) {
    color = "#C44"; // 红
  }

  const separator = " • ";

  $done({
    content: `${resText}${separator}${brdText}`,
    backgroundColor: color,
  });
}

(async () => {
  try {
    await main();
  } catch {
    $done({
      content: isChinese() ? "脚本错误" : "Script Error",
      backgroundColor: "#C44",
    });
  }
})();
