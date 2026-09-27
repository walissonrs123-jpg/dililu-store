export const adminConfig = {
  apiUrl: process.env.NEXT_PUBLIC_CATALOG_API_URL ?? "",
  cognitoDomain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN ?? "",
  clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ?? "",
};
