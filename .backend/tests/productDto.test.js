const { toProductInputDto } = require("../dto/product");

describe("product input DTO", () => {
  it("keeps the writable product fields and excludes unrecognized fields", () => {
    expect(toProductInputDto({
      name: "Widget",
      description: "A useful widget",
      price: 12.5,
      image_url: "https://example.test/widget.png",
      category_id: 3,
      is_deleted: true,
      admin_id: 99,
    })).toEqual({
      name: "Widget",
      description: "A useful widget",
      price: 12.5,
      image_url: "https://example.test/widget.png",
      category_id: 3,
    });
  });
});
