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

  const score = json.fraudScore;

  if (score === undefined || score === null) {
    $done({
      content: isChinese() ? "无评分数据" : "No Score",
      backgroundColor: "#C44",
    });
    return;
  }

  // 风险颜色：绿 → 黄 → 红
  let color = "#88A788"; // 低风险
  if (score >= 40 && score < 70) {
    color = "#D4A017"; // 中风险
  } else if (score >= 70) {
    color = "#C44"; // 高风险
  }

  const text = isChinese()
    ? `风险评分: ${score}`
    : `Fraud Score: ${score}`;

  $done({
    content: text,
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
