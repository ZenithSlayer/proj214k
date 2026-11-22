const { signEvent, verifyEvent } = require("../services/catalog");

describe("signed Redis events", () => {
  const secret = "test-signing-secret";
  const event = {
    eventId: "event-1",
    type: "product.updated",
    occurredAt: "2026-01-01T00:00:00.000Z",
    data: { productId: 42 },
  };

  it("accepts a correctly signed event", () => {
    const message = JSON.stringify({
      event,
      signature: signEvent(event, secret),
    });

    expect(verifyEvent(message, secret)).toEqual(event);
  });

  it("rejects a modified event", () => {
    const message = JSON.stringify({
      event,
      signature: signEvent(event, secret),
    });
    const modified = JSON.stringify({
      event: { ...event, data: { productId: 43 } },
      signature: signEvent(event, secret),
    });

    expect(verifyEvent(modified, secret)).toBeNull();
    expect(verifyEvent(message, "wrong-secret")).toBeNull();
  });

  it("rejects malformed envelopes", () => {
    expect(verifyEvent("not-json", secret)).toBeNull();
    expect(verifyEvent(JSON.stringify({ event }), secret)).toBeNull();
  });
});
