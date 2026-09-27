import { effectiveStatus, isAdministrator, updateProduct } from "./model.mjs";

export function createHandler(repository) {
  return async event => {
    const route = event.routeKey;
    const admin = route === "GET /admin/products" || route === "PUT /admin/products/{id}";
    const respond = (statusCode, body) => ({ statusCode, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }, body: JSON.stringify(body) });
    if (admin && !isAdministrator(event.requestContext?.authorizer?.jwt?.claims)) return respond(403, { message: "Acesso administrativo necessário." });
    try {
      if (route === "GET /products" || route === "GET /admin/products") {
        const items = await repository.list();
        return respond(200, { products: items.filter(item => admin || item.status !== "HIDDEN").map(item => ({ ...item, effectiveStatus: effectiveStatus(item) })) });
      }
      if (route !== "GET /products/{id}" && route !== "PUT /admin/products/{id}") return respond(404, { message: "Rota não encontrada." });
      const id = event.pathParameters?.id;
      if (!/^dililu-\d{3}$/.test(id ?? "")) return respond(404, { message: "Produto não encontrado." });
      const current = await repository.get(id);
      if (!current || (!admin && current.status === "HIDDEN")) return respond(404, { message: "Produto não encontrado." });
      if (!admin) return respond(200, { ...current, effectiveStatus: effectiveStatus(current) });
      if (event.isBase64Encoded || typeof event.body !== "string" || event.body.length > 8192) return respond(400, { message: "Requisição inválida." });
      let next;
      try { next = updateProduct(current, JSON.parse(event.body)); }
      catch (error) { return respond(error.name === "ConflictError" ? 409 : 400, { message: error.message }); }
      await repository.put(next, current.version);
      return respond(200, { ...next, effectiveStatus: effectiveStatus(next) });
    } catch (error) {
      if (error.name === "ConditionalCheckFailedException") return respond(409, { message: "Produto alterado em outra sessão. Recarregue." });
      // Do not log tokens, request bodies or customer information.
      console.error("Catalog operation failed", error.name);
      return respond(500, { message: "Não foi possível concluir. Tente novamente." });
    }
  };
}

let runtimeHandler;
export async function handler(event) {
  if (!runtimeHandler) {
    const { DynamoDBClient } = await import("@aws-sdk/client-dynamodb");
    const { DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand } = await import("@aws-sdk/lib-dynamodb");
    const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
    const TableName = process.env.PRODUCTS_TABLE;
    runtimeHandler = createHandler({
      async list() {
        const items = [];
        let ExclusiveStartKey;
        do {
          const page = await client.send(new ScanCommand({ TableName, ExclusiveStartKey, ConsistentRead: true }));
          items.push(...(page.Items ?? []));
          ExclusiveStartKey = page.LastEvaluatedKey;
        } while (ExclusiveStartKey);
        return items.sort((a, b) => a.order - b.order);
      },
      async get(productId) { return (await client.send(new GetCommand({ TableName, Key: { productId }, ConsistentRead: true }))).Item; },
      async put(Item, version) {
        await client.send(new PutCommand({ TableName, Item, ConditionExpression: "attribute_exists(productId) AND #version = :version", ExpressionAttributeNames: { "#version": "version" }, ExpressionAttributeValues: { ":version": version } }));
      },
    });
  }
  return runtimeHandler(event);
}
