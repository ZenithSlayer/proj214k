const toProductInputDto = (body) => ({
  name: body.name,
  description: body.description,
  price: body.price,
  image_url: body.image_url,
  category_id: body.category_id,
});

module.exports = { toProductInputDto };
