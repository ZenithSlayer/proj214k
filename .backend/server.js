const app = require("./app");
const serviceName = process.env.SERVICE_NAME;
const PORT = process.env.PORT || 3001;

if (!serviceName || serviceName === "catalog") {
  const { startEventConsumer } = require("./services/catalog");
  void startEventConsumer();
}

app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`),
);