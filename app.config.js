// Cargar variables de entorno desde .env
require("dotenv").config({ path: ".env" });

module.exports = ({ config }) => {
  return {
    ...config,
    extra: {
      ...config.extra,
      openaiApiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
      stripePublishableKey: process.env.EXPO_PUBLIC_PUBLISABLE_STRIPE_KEY,
    },
  };
};
